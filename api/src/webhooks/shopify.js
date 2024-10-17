/* #shopify notes

Here’s the flow
1) Order is placed in shopify and webhook is triggered
2) order email is looked for on server…if found, products are activated on that account. If not, a new account is made for user.
3) each line item of the order is iterated through, looking at the sku of each item
4) that sku is searched for/compared to all the sku’s for all the products on the server
5) if the sku is found it’s checked if it’s in the fulfill or don’t fulfill box for a product…if it’s sku is in the fulfill field, the line is marked as fulfilled on the shopify order
6) the app/feature/subscription with that sku is activated for the product
7) That repeats for each item in the order…once done, an email is sent to the user to confirm. If it’s a new account, the email provides a link to password reset. If not, it just provides confirmation of everything activated

# If user has an active subscription and he also purchased the product from shopify then :

here is the plan: set product as active, but leave subscription running. Product will show as “Purchased” in user portal (purchased has priority over subscription in user portal)…When subscription expires, product will still be active on user’s account

No, change in current subsription, add to product

****Items which our server as marked as fullfilled, those need to marked as fullfilled in shopify
*/
const express = require("express");
const asyncHandler = require("express-async-handler");
const { validateShopifySignature } = require("./checkShopify");
const moment = require("moment");
const { fullfillOrder } = require("./shopifyReq");

module.exports = async (app) => {
  const logger = app.get("logger");
  const {
    shopify_getList,
    shopify_insert,
    shopify_update,
    product_getList,
    subscription_getList,
    user_getList,
    user_upsert,
    user_setroles,
    user_setsubscriptions,
    user_setproducts,
  } = app.get("datastore");
  const router = express.Router();
  const {
    send_shopify_user_welcome_mail_exists,
    send_shopify_user_welcome_mail,
  } = app.get("notify");
  const { stringToArray, randomString, calculateSubscriptionExpiraryDate } =
    app.get("utilities");
  const { addToMailchimpList, addMailchimp } = app.get("mailchimp");

  const config = app.get("configuration");
  const notify = app.get("notify");

  const { confirmUserAndGenerateToken } = await require("../auth/helpers")(app);

  // Shopify webhook

  // validateShopifySignature
  router.post(
    "/orders/paid",

    asyncHandler(async (req, res) => {
      try {
        console.log("🎉 We got an order!");
        // It's a match! All good
        const order = req.body;
        logger.info({ order }, "shopify order");

        // check if order already exists
        const checkIfOrderAlreadyExits = await shopify_getList({
          order_id: order.id.toString(),
        });

        if (checkIfOrderAlreadyExits && checkIfOrderAlreadyExits.length > 0) {
          await shopify_update(checkIfOrderAlreadyExits[0].id, {
            message: "already redeemed code for this order.",
          });

          return res.status(200).json({
            error: "already redeemed code for this order.",
            success: false,
          });
        }

        const ShopifyDoc = await shopify_insert({
          request_object: order,
          email: order.email,
          order_id: order.id.toString(),
          order_number: "INV" + order.name,
        });
        if (order.financial_status !== "paid") {
          await shopify_update(ShopifyDoc.id, {
            message: "order payment is " + order.financial_status,
          });

          return res.status(200).json({
            error: "order payment is " + order.financial_status,
            success: false,
          });
        }
        const orderId = order.id;
        const orderEmail = order.email.toLowerCase();
        const orderFirstName = order.customer.first_name.trim();
        const orderLastName = order.customer.last_name.trim();
        const activated_by = "Shopify";

        const orderSkus = order.line_items
          .map((item) => item.sku)
          .filter((a) => a != "");

        // get the apps and feature fullfill and unfullfill sku for shopify

        const unFulfilledSKUs = [];
        const fulfilledSKUShopify = [];
        const appsExits = [];
        const featuresExits = [];

        // check products :  app, features
        const products = await product_getList();

        for (let i = 0; i < products.length; i++) {
          // for check apps
          for (let j = 0; j < products[i].apps.length; j++) {
            // app_shopify_fulfill
            const app_shopify_fulfill = products[i].apps[j].app_shopify_fulfill
              ? products[i].apps[j].app_shopify_fulfill
              : [];
            // eslint-disable-next-line no-loop-func
            app_shopify_fulfill?.map((element) => {
              if (orderSkus.includes(element.trim())) {
                // push to fulfilledSKUShopify
                fulfilledSKUShopify.push(element);
                // push to appsExits
                appsExits.push(products[i].apps[j]);
              }
            });

            // app_shopify_unfulfill
            const app_shopify_unfulfill = products[i].apps[j]
              .app_shopify_unfulfill
              ? products[i].apps[j].app_shopify_unfulfill
              : [];
            // eslint-disable-next-line no-loop-func
            app_shopify_unfulfill?.map((element) => {
              if (orderSkus.includes(element.trim())) {
                // push to unFulfilledSKUs
                unFulfilledSKUs.push(element);
                // push to appsExits
                appsExits.push(products[i].apps[j]);
              }
            });
          }
          // for check features
          for (let k = 0; k < products[i].features.length; k++) {
            // feature_shopify_fulfill
            const feature_shopify_fulfill = products[i].features[k]
              .feature_shopify_fulfill
              ? products[i].features[k].feature_shopify_fulfill
              : [];
            // eslint-disable-next-line no-loop-func
            feature_shopify_fulfill?.map((element) => {
              if (orderSkus.includes(element.trim())) {
                // push to fulfilledSKUShopify
                fulfilledSKUShopify.push(element);
                // push to featuresExits
                featuresExits.push(products[i].features[k]);
              }
            });

            // feature_shopify_unfulfill
            const feature_shopify_unfulfill = products[i].features[k]
              .feature_shopify_unfulfill
              ? products[i].features[k].feature_shopify_unfulfill
              : [];
            // eslint-disable-next-line no-loop-func
            feature_shopify_unfulfill?.map((element) => {
              if (orderSkus.includes(element.trim())) {
                // push to unFulfilledSKUs
                unFulfilledSKUs.push(element);
                // push to featuresExits
                featuresExits.push(products[i].features[k]);
              }
            });
          }
        }

        // check for subscriptions
        const subscriptionskuexists = [];

        const subscriptions = await subscription_getList({});

        if (subscriptions.length > 0) {
          subscriptions.map(async (subscriptionRow) => {
            subscriptionRow.subscription_pricing_plan.map(
              async (pricingOptionsRow) => {
                const fullFilledSku1 = pricingOptionsRow.shopify_fulfill
                  ? pricingOptionsRow.shopify_fulfill
                  : [];
                const notFullFillSku1 = pricingOptionsRow.shopify_unfulfill
                  ? pricingOptionsRow.shopify_unfulfill
                  : [];
                notFullFillSku1?.map(async (rowskunot) => {
                  if (orderSkus.includes(rowskunot)) {
                    subscriptionskuexists.push({
                      ...pricingOptionsRow,
                      subscription_name: subscriptionRow.subscription_name,
                      mailchimp_tag: subscriptionRow.mailchimp_tag,
                    });
                  }
                });
                fullFilledSku1?.map(async (rowsku) => {
                  fulfilledSKUShopify.push(rowsku);
                  if (orderSkus.includes(rowsku)) {
                    subscriptionskuexists.push({
                      ...pricingOptionsRow,
                      subscription_name: subscriptionRow.subscription_name,
                      mailchimp_tag: subscriptionRow.mailchimp_tag,
                    });
                  }
                });
              }
            );
          });
        }

        if (
          !(appsExits.length > 0) &&
          !(featuresExits.length > 0) &&
          !(subscriptionskuexists.length > 0)
        ) {
          await shopify_update(ShopifyDoc.id, {
            message: "no products found in our database matches this SKU.",
          });

          return res.status(200).json({
            error: "no products found in our database matches this SKU.",
            success: false,
          });
        }

        // user create or update process

        let user = await user_getList({ name: orderEmail });

        if (!user.length > 0) {
          // user create payload
          const data = {
            profile: {
              email: orderEmail,
              email_validated: true,
              first_name: orderFirstName,
              last_name: orderLastName,
            },
            auth: { password: randomString(), method: 1, enabled: true },
            name: orderEmail,
          };

          // create user
          user = await user_upsert(data);

          if (user) {
            // Assign user role
            const roles = "user";
            if (roles) {
              await user_setroles({ roles, user });
            }

            // Send mail to user //
            // try {
            //   const result = await confirmUserAndGenerateToken(data.name);
            //   await notify.send_welcome_mail({
            //     email: result.user.profile.email,
            //     firstName: result.user.profile.first_name,
            //     createPasswordLink: `${config.base_uri}/password/reset-password/${result.token.accessToken}`,
            //   });
            // } catch (err) {
            //   logger.info({ err }, "Error sending welcome mail");
            // }
          }
        } else {
          user = user[0];
        }

        // form userProducts array
        // apps
        const userProducts = [];
        appsExits.map((app1) => {
          const userProductsAppIndex = userProducts.findIndex(
            (p) => p.product_id === app1.product_id
          );

          const appObj = {
            data_type: "app",
            app_activated_by: activated_by,
            app_description: app1.app_description,
            app_visible_status: "Global",
            app_id: `${app1.id}_app`,
            app_status: true,
            app_activated_date_time: moment().format("MMMM Do YYYY, h:mm:ss a"),
            id: app1.id,
          };
          if (userProductsAppIndex < 0) {
            //create obj
            const product = {
              data_type: "product",
              product_id: `${app1.product_id}_product`,
              product_visible_status: "Global",
              activated_by,
              id: app1.product_id,
              apps: [appObj],
              features: [],
            };
            userProducts.push(product);
          } else {
            userProducts[userProductsAppIndex].apps.push(appObj);
          }
        });
        // features
        featuresExits.map((feature) => {
          const userProductsFeatureIndex = userProducts.findIndex(
            (p) => p.product_id == feature.product_id
          );

          const featureObj = {
            data_type: "feature",
            feature_activated_by: activated_by,
            feature_description: app.app_description,
            feature_visible_status: "Global",
            feature_id: `${feature.id}_app`,
            feature_status: true,
            feature_activated_date_time: moment().format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
            id: feature.id,
          };
          if (userProductsFeatureIndex < 0) {
            //create obj
            const product = {
              data_type: "product",
              product_id: `${feature.product_id}_product`,
              product_visible_status: "Global",
              activated_by,
              id: feature.product_id,
              apps: [],
              features: [featureObj],
            };
            userProducts.push(product);
          } else {
            userProducts[userProductsFeatureIndex].apps.push(featureObj);
          }
        });

        // Assign user products
        if (userProducts) {
          await user_setproducts({ userProducts, user });

          // add products to mail chimp
          const mailChimpDetails = {
            purchased: userProducts,
            email: orderEmail,
            firstname: orderFirstName,
            lastname: orderLastName,
            custId: order.customer.id,
          };

          addToMailchimpList(mailChimpDetails);
        }

        // set user subscriptions

        const userSubscriptions = [];
        if (subscriptionskuexists.length > 0) {
          subscriptionskuexists.map((pricingPlan) => {
            const subsObj = {
              id: "a1696776428575",
              subscription_id: pricingPlan.subscription_id,
              subscription_name: pricingPlan.subscription_name,
              subscription_pricing_plan_id: pricingPlan.id,
              subscription_pricing_plan_price: pricingPlan.price,
              subscription_pricing_plan_time_option: `${pricingPlan.time_option_date}/${pricingPlan.time_option_frequency}`,
              activated_by,
              auto_subscription: false,
              stripe_current_period_end: calculateSubscriptionExpiraryDate(
                pricingPlan.time_option_date,
                pricingPlan.time_option_frequency
              ),
            };

            userSubscriptions.push(subsObj);

            // add mail chimp tag for subscription
            if (pricingPlan.mailchip_tag && pricingPlan.mailchip_tag !== "") {
              const mtags = stringToArray(pricingPlan.mailchip_tag);
              addMailchimp(orderEmail, mtags, {
                firstname: orderFirstName,
                lastname: orderLastName,
              });
            }
          });
        }

        // // Assign user subscriptions
        if (userSubscriptions) {
          await user_setsubscriptions({ userSubscriptions, user });
        }

        // Mailchimp tags

        //fulll filling orders which are digital
        const line_items = order.line_items
          .filter((item) => fulfilledSKUShopify.includes(item.sku))
          .map((el) => {
            return {
              id: el.id,
            };
          });

        if (line_items && line_items.length > 0) {
          const data = {
            fulfillment: {
              location_id: 5069865020,
              line_items,
              notify_customer: false,
            },
          };
          // fullfill shopify order
          fullfillOrder(orderId, data);
          await shopify_update(ShopifyDoc.id, {
            fullfilled_line_items: JSON.stringify(line_items),
          });
        }

        await shopify_update(ShopifyDoc.id, {
          purchased: true,
        });

        return res
          .status(200)
          .json({ data: "Successfully added products :)", success: true });
      } catch (error) {
        logger.error("Shopify webhook (/orders/paid)", error);
        return res.status(200).json({ error: error.message, success: false });
      }
    })
  );
  return router;
};
