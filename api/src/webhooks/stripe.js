const express = require("express");
const asyncHandler = require("express-async-handler");
const config = require("../config");

module.exports = async (app) => {
  const logger = app.get("logger");
  const {
    userSubscription_getList,
    userSubscription_update,
    user_getList,
    userPaymentMethod_getList,
    userPaymentMethod_delete,
  } = app.get("datastore");
  const router = express.Router();
  const { getDiffenceBetweenTwotimeStampInDays } = app.get("utilities");
  const stripe = app.get("stripe");
  const { send_subscription_renewed_successfully_mail } = app.get("notify");

  // Stripe webhook
  router.post(
    "/sp-callback",
    asyncHandler(async (request, response) => {
      // This is your Stripe CLI webhook secret for testing your endpoint locally.
      //const endpointSecret = "whsec_2eb3a19b731db6e5f49e1e68e4c9d024e65353cb8ae6c7dc6095be81d6a0ea94"; // local
      let endpointSecret = "whsec_0s5wsJPT2a8t7DUlRkqJ0JGPHHHVEKPu"; // live mod
      if (config.stripe_mode == "test") {
        endpointSecret = "whsec_0s5wsJPT2a8t7DUlRkqJ0JGPHHHVEKPu"; // test mod
      }

      const sig = request.headers["stripe-signature"];

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret
        );
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Handle the event
      let subscription;
      let invoice;
      let paymentMethod;
      switch (event.type) {
        case "customer.subscription.created":
          subscription = event.data.object;
          // Then define and call a function to handle the event customer.subscription.created
          if (subscription.id) {
            // Find the subscription in DB
            //console.log("subscription.id", subscription.id);
            const getSubscription = await userSubscription_getList({
              subscription_id: subscription.id,
            });
            if (getSubscription.length > 0) {
              // Update the status in UserSubscriptionPayment in DB
              // convert timestamp to mili seconds
              await userSubscription_update(getSubscription[0].id, {
                stripe_status: subscription.status,
                stripe_start_date: new Date(subscription.start_date * 1000),
                stripe_current_period_start: new Date(
                  subscription.current_period_start * 1000
                ),
                stripe_current_period_end: new Date(
                  subscription.current_period_end * 1000
                ),
                stripe_plan_interval: subscription.plan.interval,
                stripe_plan_amount: subscription.plan.amount / 100,
                stripe_plan_count: subscription.plan.interval_count,
              });

              logger.info(
                { getSubscription },
                "Stripe webhook subscription created"
              );
            } else {
              // Assuming that it is creating using the stripe schedule
              // No longer provided
            }
          }
          break;
        case "customer.subscription.deleted":
          subscription = event.data.object;
          // Then define and call a function to handle the event customer.subscription.deleted
          if (subscription.id) {
            // Find the subscription in DB
            //console.log("subscription.id", subscription.id);
            const getSubscription = await userSubscription_getList({
              subscription_id: subscription.id,
            });
            if (getSubscription.length > 0) {
              // Update the status in UserSubscriptionPayment in DB
              // convert timestamp to mili seconds
              await userSubscription_update(getSubscription[0].id, {
                stripe_status: subscription.status,
                stripe_canceled_at: new Date(subscription.canceled_at * 1000),
                stripe_start_date: new Date(subscription.start_date * 1000),
                stripe_ended_at: new Date(subscription.ended_at * 1000),
                stripe_current_period_start: new Date(
                  subscription.current_period_start * 1000
                ),
                stripe_current_period_end: new Date(
                  subscription.current_period_end * 1000
                ),
              });

              logger.info(
                { getSubscription },
                "Stripe webhook subscription deleted"
              );
            }
          }
          break;
        case "customer.subscription.updated":
          subscription = event.data.object;
          // Then define and call a function to handle the event customer.subscription.updated
          if (subscription.id) {
            // Find the subscription in DB
            //console.log("subscription.id", subscription.id);
            const getSubscription = await userSubscription_getList({
              subscription_id: subscription.id,
            });
            if (getSubscription.length > 0) {
              // Update the status in UserSubscriptionPayment in DB
              // convert timestamp to mili seconds
              await userSubscription_update(getSubscription[0].id, {
                stripe_status: subscription.status,
                stripe_canceled_at: new Date(subscription.canceled_at * 1000),
                stripe_start_date: new Date(subscription.start_date * 1000),
                stripe_current_period_start: new Date(
                  subscription.current_period_start * 1000
                ),
                stripe_current_period_end: new Date(
                  subscription.current_period_end * 1000
                ),
                stripe_plan_interval: subscription.plan.interval,
                stripe_plan_amount: subscription.plan.amount / 100,
                stripe_plan_count: subscription.plan.interval_count,
              });

              logger.info(
                { getSubscription },
                "Stripe webhook subscription updated"
              );
            }
          }
          break;
        case "invoice.marked_uncollectible":
          invoice = event.data.object;
          // Then define and call a function to handle the event invoice.marked_uncollectible
          if (invoice.subscription) {
            // get the user_id for current subscription
          }
          break;
        case "invoice.paid":
          invoice = event.data.object;
          if (invoice.subscription) {
            // get the user_id for current subscription
          }
          // Then define and call a function to handle the event invoice.paid
          break;
        case "invoice.payment_action_required":
          invoice = event.data.object;
          // Then define and call a function to handle the event invoice.payment_action_required
          if (invoice.subscription) {
          }
          break;
        case "invoice.payment_failed":
          invoice = event.data.object;
          // Then define and call a function to handle the event invoice.payment_failed
          if (invoice.subscription) {
          }
          break;
        case "invoice.payment_succeeded":
          invoice = event.data.object;
          // Then define and call a function to handle the event invoice.payment_succeeded
          if (invoice.subscription) {
            // get the user_id for current subscription
            if (invoice.status === "paid") {
              const getUserSubscription = await userSubscription_getList({
                subscription_id: subscription.id,
              });
              if (getUserSubscription.length > 0) {
                const uid = getUserSubscription[0].user_id;
                // get user email by id
                const userData = await user_getList({ id: uid });
                const email = userData[0]?.name;
                const first_name = userData[0]?.profile?.first_name;
                const diffDays = getDiffenceBetweenTwotimeStampInDays(
                  getUserSubscription[0].stripe_start_date * 1000,
                  Date.now()
                );
                if (
                  userData.deleted === false &&
                  email !== "" &&
                  diffDays > 1
                ) {
                  let susbcriptionText = "";
                  susbcriptionText +=
                    "<p><b>Subscription Name: " +
                    getUserSubscription[0].subscription_name +
                    "</b><br>";
                  susbcriptionText +=
                    "<b>Subscription: $" +
                    getUserSubscription[0].stripe_plan_amount +
                    "/" +
                    getUserSubscription[0].stripe_plan_interval +
                    "</b><br>";
                  // send mail
                  await send_subscription_renewed_successfully_mail(
                    email,
                    first_name,
                    susbcriptionText
                  );
                }
              }
            }
          }
          break;
        case "payment_method.detached":
          paymentMethod = event.data.object;
          // Then define and call a function to handle the event subscription_schedule.updated
          if (paymentMethod.id) {
            const getPaymentMethod = await userPaymentMethod_getList({
              payment_id: paymentMethod.id,
            });
            if (getPaymentMethod.length > 0) {
              // delete the method stored in db
              await userPaymentMethod_delete({
                payment_id: paymentMethod.id,
              });
            }
          }
          break;
        // ... handle other event types
        default:
          logger.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      response.send();
    })
  );
  return router;
};
