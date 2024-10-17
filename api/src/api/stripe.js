const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { anyUser } = helpers;
  const {
    stripe_createSetupIntent,
    stripe_listPaymentMethods,
    userPaymentMethod_upsert,
    userPaymentMethod_updateMany,
    stripe_deatachedPaymentMethods,
    userPaymentMethod_delete,
    subscriptionPricingPlan_getList,
    user_getSmallList,
    stripe_createSubscription,
    UserSubscription,
    userPaymentMethod_getList,
    userSubscription_update,
    stripe_updateSubscription,
  } = app.get("datastore");

  function parse_body(body) {
    const data = {};

    if (body?.subscription_plan_id) {
      data.id = body.subscription_plan_id;
    }
    return data;
  }

  // Get All User Options for Edit and New Forms
  router.put(
    "/createsetupintent",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/stripe/createsetupintent");

      const { stripe_customer_id } = req.user;

      const setupIntent = await stripe_createSetupIntent(stripe_customer_id);

      // get user details

      res.json({ data: setupIntent.client_secret });
    })
  );

  router.get(
    "/listsetupintent",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/stripe/listsetupintent");

      const { stripe_customer_id, id } = req.user;

      const paymentMethods = await stripe_listPaymentMethods(
        stripe_customer_id
      );

      // check if first time add payment method
      const userPaymentMethodList = await userPaymentMethod_getList({
        user_id: id,
      });
      let count = 0;
      let defaultSet = false;
      await Promise.all(
        paymentMethods?.data?.map(async (paymentMethod) => {
          const params = {
            user_id: id,
            payment_id: paymentMethod.id,
          };
          if (defaultSet === false && !userPaymentMethodList.length > 0) {
            params.is_default = true;
            defaultSet = true;
          }
          const payment = await userPaymentMethod_upsert(params);
          if (payment) {
            paymentMethods.data[count].default = payment?.is_default;
          }
          count++;
        })
      );

      res.json({ data: paymentMethods });
    })
  );

  router.post(
    "/updatedefaultpaymentmethod",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/stripe/updatedefaultpaymentmethod");

      const { id } = req.user;

      const { payment_id } = req.body;

      // set all default method to false
      await userPaymentMethod_updateMany(id, { is_default: false });

      // set selected default true
      await userPaymentMethod_upsert({
        user_id: id,
        payment_id,
        is_default: true,
      });

      res.json({ data: true });
    })
  );

  router.delete(
    "/deletepaymentmethod/:payment_id",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/stripe/deletepaymentmethod/:payment_id");

      const { payment_id } = req.params;

      // Detached payment method from stripe
      await stripe_deatachedPaymentMethods(payment_id);

      // finally remove from db
      await userPaymentMethod_delete({ payment_id });

      res.json({ data: true });
    })
  );

  router.put(
    "/createsubscription",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/stripe/createsubscription");

      const params = parse_body(req.body.data);
      req.logger.debug({ params }, "Parsed Body stripe/createsubscription");

      const subscriptionDetails = await subscriptionPricingPlan_getList(params);

      const userDetails = await user_getSmallList({ id: req?.user?.id });

      const default_payment_method = userDetails[0]?.payment_method.find(
        (method) => {
          return method.is_default === true;
        }
      );
      // If not payment method not setup
      if (!default_payment_method) {
        res.status(200).json({
          error: { type: "StripeInvalidRequestError" },
        });
      }
      // stripe customer id check
      if (
        userDetails[0].profile?.stripe_customer_id !== "" &&
        userDetails[0].profile?.stripe_customer_id !== null
      ) {
        // stripe product id check
        if (
          subscriptionDetails[0].subscriptions.stripe_product_id !== null &&
          subscriptionDetails[0].subscriptions.stripe_product_id !== ""
        ) {
          // stripe price id check
          if (
            subscriptionDetails[0].stripe_price_id !== null &&
            subscriptionDetails[0].stripe_price_id !== ""
          ) {
            // now finally create the subscription in stripe
            if (default_payment_method?.payment_id) {
              const stripeObj = {
                customer: userDetails[0].profile?.stripe_customer_id,
                default_payment_method: default_payment_method?.payment_id,
                items: [{ price: subscriptionDetails[0].stripe_price_id }],
              };
              try {
                const subscription = await stripe_createSubscription(stripeObj);
                if (subscription) {
                  const userSubscriptions = {
                    user_id: userDetails[0].id,
                    subscription_id: subscriptionDetails[0].subscriptions.id,
                    stripe_subscription_id: subscription.id,
                    subscription_plan_id: parseInt(params.id),
                    activated_by: "User",
                    description: "subscription is activated by user",
                    auto_subscription: true,
                    stripe_current_period_start: new Date(
                      subscription.start_date * 1000
                    ),
                    stripe_start_date: new Date(subscription.start_date * 1000),
                    stripe_current_period_end: new Date(
                      subscription.current_period_end * 1000
                    ),
                    stripe_status: subscription.status,
                    subscription_name:
                      subscriptionDetails[0].subscriptions.subscription_name,
                    time_option_date: subscriptionDetails[0].time_option_date,
                    time_option_frequency:
                      subscriptionDetails[0].time_option_frequency,
                    stripe_plan_amount: subscriptionDetails[0].price.toString(),
                  };

                  const details = await UserSubscription.create({
                    data: userSubscriptions,
                  });

                  res.json({ data: details });
                }
              } catch (err) {
                res.status(200).json({ error: err });
              }
            } else {
              res.status(200).json({
                error: { type: "StripeInvalidRequestError" },
              });
            }
          }
        }
      }

      res.status(200).json({
        error: "Something went wrong. Contact administrator",
      });
    })
  );

  // subscription auto renew
  router.post(
    "/auto-renew",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/stripe/auto-renew");

      const { auto_subscription, userSubscription } = req.body.data;

      try {
        // update subscription in stripe if it is an stripe subscription
        if (userSubscription?.stripe_subscription_id) {
          await stripe_updateSubscription(
            userSubscription?.stripe_subscription_id,
            {
              // eslint-disable-next-line no-unneeded-ternary
              cancel_at_period_end: auto_subscription === true ? false : true,
            }
          );
        }
        // update usersubscription in db
        await userSubscription_update(userSubscription.id, {
          auto_subscription,
        });
      } catch (error) {
        res.json({ data: { error } });
      }

      res.json({ data: true });
    })
  );

  return router;
};
