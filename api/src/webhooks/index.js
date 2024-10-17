const express = require("express");

module.exports = async (app) => {
  const webhookRouter = express.Router();

  const stripeWebhookHandler = await require("./stripe")(app);

  const shopifyWebhookHandler = await require("./shopify")(app);

  webhookRouter.use(
    "/stripe/",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler
  );

  webhookRouter.use(
    "/shopify/",
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    }),
    shopifyWebhookHandler
  );

  return { webhookRouter };
};
