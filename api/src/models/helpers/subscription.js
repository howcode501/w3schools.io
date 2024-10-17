module.exports = async (models, config, logger, helpers) => {
  const { Subscription, SubscriptionPricingPlan } = models;

  // Define the data to be returned
  const subscriptionDetailedDataReturn = {
    products: true,
    apps: true,
    features: true,
    subscription_pricing_plan: true,
    promo_codes: true,
    attachments: true,
  };

  // Construct a query object for subscriptions lookups
  // TODO Come back and account for Hidden and Disabled subscription
  function subscription_where({
    id,
    subscription_name,
    status,
    apps,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (subscription_name) {
      query.subscription_name = subscription_name;
    }
    if (status) {
      query.status = status;
    }
    if (apps) {
      query.apps = apps;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique subscription_name based on query params,
  // but return very little information for security
  async function subscription_validateSubscriptionName(params) {
    const query = subscription_where(params);

    // If they are searching by subscription name, let's add some wildcard features
    if (query.subscription_name) {
      const { subscription_name } = query;

      query.subscription_name = {
        equals: subscription_name,
        mode: "insensitive",
      };
    }
    logger.warn({ query }, "subscription_validateSubscriptionName");
    const subscriptionMany = Subscription.findMany({
      where: query,
    });
    return subscriptionMany;
  }

  // Find a unique subscription based on query params
  async function subscription_findUnique(params) {
    const query = subscription_where(params);

    logger.warn({ query }, "subscription_findUnique");

    const subscriptionFound = Subscription.findUnique({
      where: { ...query },
      include: subscriptionDetailedDataReturn,
    });
    return subscriptionFound;
  }

  async function subscription_upsert({
    id,
    subscription_name,
    subscription_description,
    subscription_icon_id,
    mailchimp_tag,
    status,
    products = {},
    apps = {},
    features = {},
    subscriptionPricingPlan = {},
    deleted = null,
  }) {
    if (!subscription_name)
      logger.debug({ subscription_name }, "Upsert subscription");
    let subscription;
    if (id !== "" && id !== undefined) {
      subscription = await subscription_findUnique({ id });
    } else {
      subscription = await subscription_findUnique({ subscription_name });
    }

    // remap pricing plan
    const newpricingPlan = [];
    const updatePricingPlan = [];
    subscriptionPricingPlan.map((pricingPlan) => {
      if (pricingPlan?.id == "") {
        delete pricingPlan.id;
        newpricingPlan.push(pricingPlan);
      } else {
        const updateId = pricingPlan.id;
        delete pricingPlan.subscription_id;
        delete pricingPlan.id;
        const dt = {
          where: { id: updateId },
          data: {
            ...pricingPlan,
          },
        };
        updatePricingPlan.push(dt);
      }
    });

    if (subscription === null) {
      logger.debug({ subscription_name }, "No such subscription, creating..");

      // sync in stripe
      let stripe_product_id = "";
      // create product in stripe
      const stripeProduct = await helpers.stripe_createProduct({
        name: helpers.replaceSpacesWithUnderscore(subscription_name),
        description: subscription_description,
      });

      if (stripeProduct) {
        stripe_product_id = stripeProduct.id;
        // create price for each subscription / product
        let pricingPlanCount = 0;
        await Promise.all(
          newpricingPlan.map(async (pricingPlan) => {
            const stripeCreatePrice = await helpers.stripe_createPrice({
              unit_amount: pricingPlan?.price ? pricingPlan?.price * 100 : 0,
              currency: "usd",
              recurring: {
                interval: pricingPlan?.time_option_frequency.toLowerCase(),
                interval_count: pricingPlan?.time_option_date,
              },
              product: stripe_product_id,
            });
            if (stripeCreatePrice) {
              newpricingPlan[pricingPlanCount].stripe_price_id =
                stripeCreatePrice.id;
            }
            pricingPlanCount++;
          })
        );

        const query = {
          subscription_name,
          stripe_product_id,
          subscription_description,
          mailchimp_tag,
          subscription_icon_id,
          status,
          products: {
            connect: products,
          },
          subscription_pricing_plan: {
            create: newpricingPlan,
          },
        };

        if (Object.keys(features).length > 0) {
          query.features = {
            connect: features,
          };
        }

        if (Object.keys(apps).length > 0) {
          query.apps = {
            connect: apps,
          };
        }

        subscription = await Subscription.create({
          data: query,
          include: subscriptionDetailedDataReturn,
        });
      }
    } else {
      // disconnect first and update
      await Subscription.update({
        where: { id: subscription.id },
        data: {
          products: {
            set: [],
          },
          apps: {
            set: [],
          },
          features: {
            set: [],
          },
        },
        include: subscriptionDetailedDataReturn,
      });
      logger.debug({ subscription_name }, "Subscription exists, updating..");

      // update or create price in stripe

      // create
      let pricingPlanCount = 0;
      await Promise.all(
        newpricingPlan.map(async (pricingPlan) => {
          const stripeCreatePrice = await helpers.stripe_createPrice({
            unit_amount: pricingPlan?.price ? pricingPlan?.price * 100 : 0,
            currency: "usd",
            recurring: {
              interval: pricingPlan?.time_option_frequency.toLowerCase(),
              interval_count: pricingPlan?.time_option_date,
            },
            product: subscription.stripe_product_id,
          });
          if (stripeCreatePrice) {
            newpricingPlan[pricingPlanCount].stripe_price_id =
              stripeCreatePrice.id;
          }
          pricingPlanCount++;
        })
      );

      // update

      await Promise.all(
        updatePricingPlan.map(async (pricingPlan) => {
          if (
            pricingPlan?.data?.stripe_price_id !== null &&
            pricingPlan?.data?.deleted !== null
          ) {
            try {
              await helpers.stripe_updatePrice(
                pricingPlan.data.stripe_price_id,
                {
                  active: false,
                }
              );
            } catch (err) {
              logger.debug({ err }, "Stripe Update price");
            }
          }
        })
      );

      const query = {
        subscription_name,
        subscription_description,
        subscription_icon_id,
        mailchimp_tag,
        status,
        products: {
          connect: products,
        },
        subscription_pricing_plan: {
          create: newpricingPlan,
          update: updatePricingPlan,
        },
      };

      if (Object.keys(features).length > 0) {
        query.features = {
          connect: features,
        };
      }

      if (Object.keys(apps).length > 0) {
        query.apps = {
          connect: apps,
        };
      }

      subscription = await Subscription.update({
        where: { id: subscription.id },
        data: query,
        include: subscriptionDetailedDataReturn,
      });

      if (subscription) {
        // update in stripe
        await helpers.stripe_updateProduct(subscription.stripe_product_id, {
          name: helpers.replaceSpacesWithUnderscore(subscription_name),
          description: subscription_description,
        });
      }
    }

    logger.debug({ subscription }, "Subscription Upserted");
    return subscription;
  }

  // Normalize subscription into a structure for transport over REST
  async function subscription_normalize(subscription) {
    if (!subscription) {
      return null;
    }

    if (subscription.mailchimp_tag[0] === "NotSet") {
      subscription.mailchimp_tag = "";
    }

    logger.debug(subscription, "Subscription Normalize Data In");

    return subscription;
  }

  // Get list of subscription
  async function subscription_getList(params = {}) {
    const query = subscription_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const subscriptionMany = Subscription.findMany({
      where: query,
      orderBy: {
        subscription_name: "asc",
      },
      include: subscriptionDetailedDataReturn,
    });
    return subscriptionMany;
  }

  async function subscription_deleteHard(subscription) {
    logger.debug({ subscription }, "Found subscription..");

    if (subscription?.subscription_pricing_plan) {
      await SubscriptionPricingPlan.deleteMany({
        where: { subscription_id: subscription.id },
      });

      // update prices to active false

      await Promise.all(
        subscription?.subscription_pricing_plan.map(async (pricingPlan) => {
          if (pricingPlan?.stripe_price_id !== null) {
            try {
              await helpers.stripe_updatePrice(pricingPlan.stripe_price_id, {
                active: false,
              });
            } catch (err) {
              logger.info({ err }, "delete stripe update price..");
            }
          }
        })
      );
      //Remove product and prices from stripe
      if (subscription.stripe_product_id) {
        try {
          await helpers.stripe_deleteProduct(subscription.stripe_product_id);
        } catch (err) {
          logger.info({ err }, "delete stripe product error..");
          try {
            await helpers.stripe_updateProduct(subscription.stripe_product_id, {
              active: false,
            });
          } catch (err) {
            logger.info({ err }, " update delete stripe product error..");
          }
        }
      }
    }

    // delete subscription attachments
    if (subscription?.attachments) {
      // delete it from s3
      const path = subscription?.attachments?.public_url.replace(
        `${config.amazon.s3_bucket_base_url}/`,
        ""
      );
      await helpers.amazon_deleteImage(path);
      // delete if from our db
      await helpers.attachment_delete(subscription?.attachments?.id);
    }

    // finally, delete the subscription record
    await Subscription.delete({ where: { id: subscription.id } });

    logger.debug({ subscription }, "Subscription Hard delete complete");

    return subscription;
  }

  return {
    subscription_where,
    subscription_validateSubscriptionName,
    subscription_findUnique,
    subscription_upsert,
    subscription_normalize,
    subscription_getList,
    subscription_deleteHard,
  };
};
