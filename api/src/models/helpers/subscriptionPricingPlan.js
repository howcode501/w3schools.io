module.exports = async (models, config, logger) => {
  const { SubscriptionPricingPlan } = models;

  // Define the data to be returned
  const subscriptionPricingPlanDetailedDataReturn = {
    subscriptions: true,
  };

  // Construct a query object for subscriptions pricing plan lookups
  function subscriptionPricingPlan_where({
    id,
    time_option_date,
    time_option_frequency,
    price,
    stripe_price_id,
    status,
    subscription_id,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (time_option_date) {
      query.time_option_date = time_option_date;
    }
    if (time_option_frequency) {
      query.time_option_frequency = time_option_frequency;
    }
    if (price) {
      query.price = price;
    }
    if (stripe_price_id) {
      query.stripe_price_id = stripe_price_id;
    }
    if (status) {
      query.status = status;
    }
    if (subscription_id) {
      query.subscription_id = subscription_id;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique subscription pricing plan based on query params
  async function subscriptionPricingPlan_findUnique(params) {
    const query = subscriptionPricingPlan_where(params);

    logger.warn({ query }, "subscriptionPricingPlan_findUnique");

    const subscriptionPricingPlanFound = SubscriptionPricingPlan.findUnique({
      where: { ...query },
      include: subscriptionPricingPlanDetailedDataReturn,
    });
    return subscriptionPricingPlanFound;
  }

  // Get list of subscription pricing plan
  async function subscriptionPricingPlan_getList(params = {}) {
    const query = subscriptionPricingPlan_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const subscriptionPricingPlanMany = SubscriptionPricingPlan.findMany({
      where: query,
      orderBy: {
        id: "asc",
      },
      include: subscriptionPricingPlanDetailedDataReturn,
    });
    return subscriptionPricingPlanMany;
  }

  return {
    subscriptionPricingPlan_where,
    subscriptionPricingPlan_findUnique,
    subscriptionPricingPlan_getList,
  };
};
