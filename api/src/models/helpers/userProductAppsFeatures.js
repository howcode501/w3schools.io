module.exports = async (models, config, logger) => {
  const { UserProductAppFeature } = models;

  const userProductDetailedDataReturn = {
    product: true,
    app: true,
    feature: true,
  };

  function UserProductAppFeature_where({
    id,
    user_id,
    subscription_id,
    subscription_plan_id,
    stripe_customer_id,
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

    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique UserProductAppFeature based on query params
  async function UserProductAppFeature_findUnique(params) {
    const query = UserProductAppFeature_where(params);

    logger.warn({ query }, "UserProductAppFeature_findUnique");

    const UserProductAppFeatureFound = UserProductAppFeature.findUnique({
      where: { ...query },
    });
    return UserProductAppFeatureFound;
  }

  // Get list of UserProductAppFeature
  async function UserProductAppFeature_getList(params = {}) {
    const query = UserProductAppFeature_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const UserProductAppFeatureMany = UserProductAppFeature.findMany({
      where: query,
      orderBy: {
        id: "asc",
      },
      include: userProductDetailedDataReturn,
    });
    return UserProductAppFeatureMany;
  }

  function get_userProductByID(userProducts, productId) {
    return userProducts.filter(
      (userProduct) =>
        userProduct.product_id === productId &&
        userProduct.data_type === "product"
    );
  }

  function get_userAppByID(userProducts, appId) {
    return userProducts.filter(
      (userProduct) =>
        userProduct.app_id === appId && userProduct.data_type === "app"
    );
  }

  function get_userFeatureByID(userProducts, featureId) {
    return userProducts.filter(
      (userProduct) =>
        userProduct.feature_id === featureId &&
        userProduct.data_type === "feature"
    );
  }

  function get_userSubscriptionByID(
    userSubscriptions,
    appId = "",
    featureId = ""
  ) {
    let data = [];
    if (appId !== "") {
      userSubscriptions.forEach((subs) => {
        if (Date.now() < new Date(subs?.stripe_current_period_end).getTime()) {
          subs?.subscriptions?.apps.forEach((app) => {
            if (app.id == appId) {
              data.push(subs);
            }
          });
        }
      });
    }

    if (featureId !== "") {
      userSubscriptions.forEach((subs) => {
        if (Date.now() < new Date(subs?.stripe_current_period_end).getTime()) {
          subs?.subscriptions?.features.forEach((feature) => {
            if (feature.id == featureId) {
              data.push(subs);
            }
          });
        }
      });
    }

    return data;
  }

  function parse_userProducts(
    products,
    userProducts = [],
    userSubscriptions = []
  ) {
    const parsedProducts = [];
    products?.forEach((product) => {
      // Loop through each app in product
      const parsedApps = [];
      product?.apps?.forEach((app1) => {
        // find userApp
        const parsedApp = app1;
        const uApp = get_userAppByID(userProducts, app1.id);
        if (uApp.length > 0) {
          if (uApp[0]?.visible_status !== "Global") {
            parsedApp.status =
              uApp[0]?.visible_status === "true" ||
              uApp[0]?.visible_status === true
                ? true
                : false;
          }
        }

        // other params
        parsedApp.activated_by = uApp[0]?.activated_by;
        parsedApp.active = uApp[0]?.status ? uApp[0]?.status : false;

        parsedApp.is_purchased = parsedApp.active;

        parsedApp.is_subscription = false;
        // check for subscription
        const appSubscription = get_userSubscriptionByID(
          userSubscriptions,
          app1.id
        );

        if (appSubscription.length > 0) {
          parsedApp.is_subscription = true;
          parsedApp.active = true;
        }

        parsedApps.push(parsedApp);
      });

      // Loop through each feature in product
      const parsedFeatures = [];
      product?.features?.forEach((feature) => {
        // find userFeature
        const parsedFeature = feature;
        const uFeature = get_userFeatureByID(userProducts, feature.id);
        if (uFeature.length > 0) {
          if (uFeature[0]?.visible_status !== "Global") {
            parsedFeature.status =
              uFeature[0]?.visible_status === "true" ||
              uFeature[0]?.visible_status === true
                ? true
                : false;
          }
        }

        // other params
        parsedFeature.activated_by = uFeature[0]?.activated_by;
        parsedFeature.active = uFeature[0]?.status
          ? uFeature[0]?.status
          : false;

        parsedFeature.is_purchased = parsedFeature.active;

        // check for subscription
        parsedFeature.is_subscription = false;
        const featureSubscription = get_userSubscriptionByID(
          userSubscriptions,
          "",
          feature.id
        );

        if (featureSubscription.length > 0) {
          parsedFeature.is_subscription = true;
          parsedFeature.active = true;
        }

        parsedFeatures.push(parsedFeature);
      });

      const parsedProduct = product;
      // find userProduct
      const uProduct = get_userProductByID(userProducts, product.id);
      if (uProduct.length > 0) {
        if (uProduct[0]?.visible_status !== "Global") {
          parsedProduct.product_status =
            uProduct[0]?.visible_status === "true" ||
            uProduct[0]?.visible_status === true
              ? true
              : false;
        }
      }
      // push to global array
      parsedProducts.push({
        ...parsedProduct,
        apps: parsedApps,
        features: parsedFeatures,
      });
    });
    return parsedProducts;
  }

  return {
    UserProductAppFeature_where,
    UserProductAppFeature_findUnique,
    UserProductAppFeature_getList,
    get_userProductByID,
    get_userAppByID,
    get_userFeatureByID,
    get_userSubscriptionByID,
    parse_userProducts,
  };
};
