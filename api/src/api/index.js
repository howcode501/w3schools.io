const express = require("express");

module.exports = async (app) => {
  const apiRouter = express.Router();
  const helpers = await require("./helpers")(app);
  const validations = await require("./validations")(app);
  const usersHandler = await require("./users")(app, helpers, validations);
  const roleHandler = await require("./roles")(app, helpers);
  const auditLogsHandler = await require("./auditlogs")(app, helpers);
  const aboutHandler = await require("./about")(app, helpers);

  const productsHandler = await require("./products")(app, helpers);
  const uploadHandler = await require("./upload-files")(app, helpers);
  const appsHandler = await require("./apps")(app, helpers);
  const featuresHandler = await require("./features")(app, helpers);
  const subscriptionsHandler = await require("./subscriptions")(app, helpers);
  const promoCodesHandler = await require("./promo-codes")(app, helpers);
  const SystemConfigHandler = await require("./system-config")(app, helpers);
  const userProducts = await require("./user-products")(app, helpers);
  const stripe = await require("./stripe")(app, helpers);
  const apiKeys = await require("./app-keys")(app, helpers);

  apiRouter.use("/users", usersHandler);
  apiRouter.use("/roles", roleHandler);
  apiRouter.use("/auditlogs", auditLogsHandler);
  apiRouter.use("/about", aboutHandler);

  apiRouter.use("/products", productsHandler);
  apiRouter.use("/upload", uploadHandler);
  apiRouter.use("/apps", appsHandler);
  apiRouter.use("/features", featuresHandler);
  apiRouter.use("/subscriptions", subscriptionsHandler);
  apiRouter.use("/promo-codes", promoCodesHandler);
  apiRouter.use("/system-config", SystemConfigHandler);
  apiRouter.use("/user-products", userProducts);
  apiRouter.use("/stripe", stripe);
  apiRouter.use("/app-keys", apiKeys);

  return { apiRouter };
};
