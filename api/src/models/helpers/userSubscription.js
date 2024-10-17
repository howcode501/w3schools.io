module.exports = async (models, config, logger) => {
  const { UserSubscription } = models;

  const userSubscriptionsDetailedDataReturn = {
    subscriptions: {
      include: {
        apps: true,
        features: true,
      },
    },
    subscription_pricing_plan: true,
  };

  function userSubscription_where({
    id,
    user_id,
    subscription_id,
    subscription_plan_id,
    stripe_customer_id,
    stripe_status,
    subscriptions,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (user_id) {
      query.user_id = user_id;
    }
    if (subscription_id) {
      query.subscription_id = parseInt(subscription_id);
    }
    if (subscription_plan_id) {
      query.subscription_plan_id = parseInt(subscription_plan_id);
    }
    if (stripe_customer_id) {
      query.stripe_customer_id = stripe_customer_id;
    }

    if (stripe_status) {
      query.stripe_status = stripe_status;
    }

    if (subscriptions) {
      query.subscriptions = subscriptions;
    }

    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique subscription based on query params
  async function userSubscription_findUnique(params) {
    const query = userSubscription_where(params);

    logger.warn({ query }, "userSubscription_findUnique");

    const UserSubscriptionFound = UserSubscription.findUnique({
      where: { ...query },
    });
    return UserSubscriptionFound;
  }

  // Get list of userSubscription
  async function userSubscription_getList(params = {}) {
    const query = userSubscription_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const UserSubscriptionMany = UserSubscription.findMany({
      where: query,
      orderBy: {
        id: "asc",
      },
      include: userSubscriptionsDetailedDataReturn,
    });
    return UserSubscriptionMany;
  }

  // update user subscription
  async function userSubscription_update(id, params) {
    const userSubs = await UserSubscription.update({
      where: { id },
      data: { ...params },
    });

    return userSubs;
  }
  return {
    userSubscription_where,
    userSubscription_findUnique,
    userSubscription_getList,
    userSubscription_update,
  };
};
