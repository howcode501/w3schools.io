/* eslint-disable no-unneeded-ternary */
const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { anyUser } = helpers;

  const {
    UserProductAppFeature_getList,
    userSubscription_getList,
    product_getList,
    subscription_getList,
    systemConfig_getList,
    parse_userProducts,
  } = app.get("datastore");

  // LIST
  router.get(
    "/",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/user-products");

      const dataReturn = {};

      const user_id = req?.user?.id;

      const products = await product_getList({});

      const userProducts = await UserProductAppFeature_getList({
        user_id,
      });

      const userSubscriptions = await userSubscription_getList({
        user_id,
      });

      const subscriptions = await subscription_getList();

      dataReturn.products = products;

      dataReturn.userProducts = userProducts;

      dataReturn.subscriptions = subscriptions;

      dataReturn.userSubscriptions = userSubscriptions;

      dataReturn.systemConfig = await systemConfig_getList();

      // parse array

      dataReturn.userProductsParsed = await parse_userProducts(
        products,
        userProducts,
        userSubscriptions
      );

      res.json({ data: dataReturn });
    })
  );

  return router;
};
