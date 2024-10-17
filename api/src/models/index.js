module.exports = async (_prisma, config, logger, utilities) => {
  const models = {
    User: _prisma.user,
    UserProfile: _prisma.userProfile,
    AuthProfile: _prisma.authProfile,
    Role: _prisma.role,
    RoleOption: _prisma.roleOption,
    RoleOptionValue: _prisma.roleOptionValue,
    OneTimeToken: _prisma.oneTimeToken,
    RefreshToken: _prisma.refreshToken,
    AuditLog: _prisma.auditLog,
    Notification: _prisma.Notification,
    Product: _prisma.Product,
    Attachment: _prisma.Attachment,
    App: _prisma.App,
    Feature: _prisma.Feature,
    Subscription: _prisma.Subscription,
    SubscriptionPricingPlan: _prisma.SubscriptionPricingPlan,
    PromoCode: _prisma.PromoCode,
    UserProductAppFeature: _prisma.UserProductAppFeature,
    UserSubscription: _prisma.UserSubscription,
    SystemConfig: _prisma.SystemConfig,
    UserPaymentMethod: _prisma.UserPaymentMethod,
    ApiKeys: _prisma.ApiKeys,
    UserAppDeviceId: _prisma.UserAppDeviceId,
    Shopify: _prisma.Shopify,
  };

  const { replaceSpacesWithUnderscore, randomString } = utilities;

  const systemConfigHelpers = await require("./helpers/system-config")(
    models,
    config,
    logger
  );

  const amazonHelpers = await require("./helpers/amazon")(
    models,
    config,
    logger
  );

  // Get system config to check and load stripe

  const systemConfig = await systemConfigHelpers.systemConfig_getList({});

  let stripeHelpers;

  if (systemConfig) {
    systemConfig.forEach((row) => {
      if (row.name === "Stripe_Mode") {
        config.stripe.stripe_mode = row.value;
      }
      if (row.name === "Stripe_Live_Publishable_Key") {
        config.stripe.stripe_live_publishable_key = row.value;
      }
      if (row.name === "Stripe_Live_Secret_Key") {
        config.stripe.stripe_live_secret_key = row.value;
      }
      if (row.name === "Stripe_Test_Publishable_Key") {
        config.stripe.stripe_test_publishable_key = row.value;
      }
      if (row.name === "Stripe_Test_Secret_Key") {
        config.stripe.stripe_test_secret_key = row.value;
      }
    });

    // Finally load stripe
    const stripe = require("stripe")(
      config.stripe.stripe_mode === "Test"
        ? config.stripe.stripe_test_secret_key
        : config.stripe.stripe_live_secret_key
    );

    stripeHelpers = await require("./helpers/stripe")(
      models,
      config,
      logger,
      stripe
    );
  }

  const optionHelpers = await require("./helpers/option")(
    models,
    config,
    logger
  );
  const attachmentHelpers = await require("./helpers/attachment")(
    models,
    config,
    logger
  );

  const roleHelpers = await require("./helpers/role")(models, config, logger);

  const userPaymentMethodHelpers =
    await require("./helpers/user-payment-method")(models, config, logger);

  const userAppDeviceIdHelpers = await require("./helpers/userAppDeviceId")(
    models,
    config,
    logger,
    _prisma
  );

  const userHelpers = await require("./helpers/user")(models, config, logger, {
    ...stripeHelpers,
    ...attachmentHelpers,
    ...amazonHelpers,
    randomString,
    ...userPaymentMethodHelpers,
    ...userAppDeviceIdHelpers,
  });

  const auditLogHelpers = await require("./helpers/auditlog")(
    models,
    config,
    logger
  );

  const aboutHelpers = await require("./helpers/about")(models, config, logger);

  const productHelpers = await require("./helpers/product")(
    models,
    config,
    logger,
    { ...amazonHelpers, ...attachmentHelpers }
  );

  const appHelpers = await require("./helpers/app")(models, config, logger);

  const featureHelpers = await require("./helpers/feature")(
    models,
    config,
    logger
  );

  const promoCodeHelpers = await require("./helpers/promo-code")(
    models,
    config,
    logger
  );

  const userSubscriptionHelpers = await require("./helpers/userSubscription")(
    models,
    config,
    logger
  );

  const userProductAppFeatureHelpers =
    await require("./helpers/userProductAppsFeatures")(models, config, logger);

  const subscriptionHelpers = await require("./helpers/subscription")(
    models,
    config,
    logger,
    {
      ...stripeHelpers,
      replaceSpacesWithUnderscore,
      ...amazonHelpers,
      ...attachmentHelpers,
    }
  );

  const subscriptionPricingPlanHelpers =
    await require("./helpers/subscriptionPricingPlan")(models, config, logger);

  const apiKeysHelpers = await require("./helpers/api-keys")(
    models,
    config,
    logger
  );

  const shopifyHelpers = await require("./helpers/shopify")(
    models,
    config,
    logger,
    _prisma
  );

  return {
    ...models,
    ...optionHelpers,
    ...roleHelpers,
    ...userHelpers,
    ...auditLogHelpers,
    ...aboutHelpers,
    ...productHelpers,
    ...attachmentHelpers,
    ...appHelpers,
    ...featureHelpers,
    ...subscriptionHelpers,
    ...promoCodeHelpers,
    ...systemConfigHelpers,
    ...userSubscriptionHelpers,
    ...userProductAppFeatureHelpers,
    ...stripeHelpers,
    ...userPaymentMethodHelpers,
    ...subscriptionPricingPlanHelpers,
    ...amazonHelpers,
    ...apiKeysHelpers,
    ...userAppDeviceIdHelpers,
    ...shopifyHelpers,
  };
};
