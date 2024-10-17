module.exports = async (app, config, logger) => {
  const { userSubscription_getList, userSubscription_update, user_getList } =
    app.get("datastore");

  const {
    send_subscription_renew_mail,
    send_subscription_default_payment_not_set_mail,
  } = app.get("notify");

  const { getDiffenceBetweenTwotimeStampInDays } = app.get("utilities");

  async function cronStripe_UpdateIfSubscriptionCanceled() {
    // This cron will check the user susbscription which are in cancel status and update the subscription in user collection
    // get all susbscription which are in cancel status
    try {
      const getSubscription = await userSubscription_getList({
        stripe_status: "canceled",
        checked_canceled: false,
      });

      // for each row
      for (let i = 0; i < getSubscription.length; i++) {
        if (Date.now() > getSubscription[i].stripe_current_period_end * 1000) {
          // set flag to  await userSubscription_update
          await userSubscription_update(getSubscription[i].id, {
            checked_canceled: true,
          });
        }
      }

      return { data: "Records updated", success: true };
    } catch (error) {
      logger.error("cronStripe_UpdateIfSubscriptionCanceled", error);
      return { error: error, success: false };
    }
  }

  async function cronStripe_sendRenewalMail5Days() {
    // TO BE REMOVE
    //await send_subscription_renew_mail('balkishannatani@gmail.com', 'test');
    // This cron will sent mail to users which renewals are in next five days
    try {
      // get timestamp minus 5 days from now
      const d = new Date();
      d.setDate(d.getDate() - 5);
      const getSubscription = await userSubscription_getList({
        stripe_status: "active",
        auto_subscription: true,
      });
      // each susbscription
      let renewArray = [];
      for (let i = 0; i < getSubscription.length; i++) {
        if (getSubscription[i].stripe_current_period_end) {
          // get difference in days
          const diffDays = await getDiffenceBetweenTwotimeStampInDays(
            Date.now(),
            getSubscription[i].stripe_current_period_end * 1000
          );
          if (diffDays == 5) {
            if (renewArray[getSubscription[i].user_id]) {
              renewArray[getSubscription[i].user_id].push({
                subscription_group_id: getSubscription[i].subscription_group_id,
                subscription_name: getSubscription[i].subscription_name,
                stripe_plan_amount: getSubscription[i].stripe_plan_amount,
                stripe_plan_interval: getSubscription[i].stripe_plan_interval,
              });
            } else {
              renewArray[getSubscription[i].user_id] = new Array({
                subscription_group_id: getSubscription[i].subscription_group_id,
                subscription_name: getSubscription[i].subscription_name,
                stripe_plan_amount: getSubscription[i].stripe_plan_amount,
                stripe_plan_interval: getSubscription[i].stripe_plan_interval,
              });
            }
          }
        }
      }
      for (const key in renewArray) {
        if (Object.hasOwnProperty.call(renewArray, key)) {
          const element = renewArray[key];
          // check if user has already setup the default payment method
          const paymentMethod = await userPaymentMethod_getList({
            id: key,
            is_default: true,
          });
          if (paymentMethod.length > 0) {
            // get user email from system
            const userData = await user_getList({ id: key });
            const email = userData[0]?.name;
            const first_name = userData[0]?.profile?.first_name;
            let susbcriptionText = "";
            if (userData.is_deleted === false && email !== "") {
              element.forEach((ele) => {
                susbcriptionText +=
                  "<p><b>Subscription Name: " +
                  ele.subscription_name +
                  "</b><br>";
                susbcriptionText +=
                  "<b>Subscription: $" +
                  ele.stripe_plan_amount +
                  "/" +
                  ele.stripe_plan_interval +
                  "</b><br>";
              });
              // send mail
              await send_subscription_renew_mail(
                email,
                first_name,
                susbcriptionText
              );
            }
          }
        }
      }

      return { data: "Renewal Mail sent", success: true };
    } catch (error) {
      logger.error("cronStripe_sendRenewalMail5Days", error);
      return { error: error, success: false };
    }
  }

  async function cronStripe_sendRenewalMail5Days_PaymentMethodNotSet() {
    // This cron will sent mail to users which renewals are in next five days
    try {
      // get timestamp minus 5 days from now
      const d = new Date();
      d.setDate(d.getDate() - 5);

      const getSubscription = await userSubscription_getList({
        stripe_status: "active",
        auto_subscription: true,
      });

      // each susbscription
      let renewArray = [];
      for (let i = 0; i < getSubscription.length; i++) {
        if (getSubscription[i].stripe_current_period_end) {
          // get difference in days
          const diffDays = await getDiffenceBetweenTwotimeStampInDays(
            Date.now(),
            getSubscription[i].stripe_current_period_end * 1000
          );
          if (diffDays == 5) {
            if (renewArray[getSubscription[i].user_id]) {
              renewArray[getSubscription[i].user_id].push({
                subscription_group_id: getSubscription[i].subscription_group_id,
                subscription_name: getSubscription[i].subscription_name,
                stripe_plan_amount: getSubscription[i].stripe_plan_amount,
                stripe_plan_interval: getSubscription[i].stripe_plan_interval,
              });
            } else {
              renewArray[getSubscription[i].user_id] = new Array({
                subscription_group_id: getSubscription[i].subscription_group_id,
                subscription_name: getSubscription[i].subscription_name,
                stripe_plan_amount: getSubscription[i].stripe_plan_amount,
                stripe_plan_interval: getSubscription[i].stripe_plan_interval,
              });
            }
          }
        }
      }
      for (const key in renewArray) {
        if (Object.hasOwnProperty.call(renewArray, key)) {
          const element = renewArray[key];
          // check if user has already setup the default payment method
          const paymentMethod = await userPaymentMethod_getList({
            id: key,
            is_default: true,
          });
          if (paymentMethod.length > 0) {
            // get user email from system
            const userData = await user_getList({ id: key });
            const email = userData[0]?.name;
            const first_name = userData[0]?.profile?.first_name;
            let susbcriptionText = "";
            if (userData.is_deleted === false && email !== "") {
              element.forEach((ele) => {
                susbcriptionText +=
                  "<p><b>Subscription Name: " +
                  ele.subscription_name +
                  "</b><br>";
                susbcriptionText +=
                  "<b>Subscription: $" +
                  ele.stripe_plan_amount +
                  "/" +
                  ele.stripe_plan_interval +
                  "</b><br>";
              });
              // send mail
              await send_subscription_default_payment_not_set_mail(
                email,
                first_name,
                susbcriptionText
              );
            }
          }
        }
      }

      return { data: "Renewal Mail sent", success: true };
    } catch (error) {
      logger.error("cronStripe_sendRenewalMail5Days", error);
      return { error: error, success: false };
    }
  }

  return {
    cronStripe_UpdateIfSubscriptionCanceled,
    cronStripe_sendRenewalMail5Days,
    cronStripe_sendRenewalMail5Days_PaymentMethodNotSet,
  };
};
