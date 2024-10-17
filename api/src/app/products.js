const express = require("express");
const asyncHandler = require("express-async-handler");
const { base64decode } = require("nodejs-base64");

module.exports = async (app) => {
  const router = express.Router();

  const {
    user_findUnique,
    rawQuery,
    app_findUnique,
    feature_findUnique,
    userSubscription_getList,
    userAppDeviceId_getList,
    userAppDeviceId_insert,
    userAppDeviceId_update,
    product_getList,
    UserProductAppFeature_getList,
    parse_userProducts,
    user_update,
  } = app.get("datastore");

  const { randomString } = app.get("utilities");

  const config = app.get("configuration");

  // Endpoints

  // Get user active products
  router.post(
    "/get-active-products",
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/products/get-active-products");

      try {
        const email = req.body.email;
        const password = req.body.password;

        const productId = req.body.product_id;
        const featureId = req.body.feature_id;
        const appId = req.body.app_id;

        if (!email) {
          return res
            .status(400)
            .json({ error: "Please enter email", success: false });
        }
        if (!password) {
          return res
            .status(400)
            .json({ error: "password id is required!", success: false });
        }
        if (!productId && !featureId && !appId) {
          return res.status(400).json({
            error: "Please enter product_id , app_id or feature_id",
            success: false,
          });
        }
        // get user by email
        const user = await user_findUnique({ name: email });

        if (!user) {
          return res.status(400).json({
            error: "Email does not exist in our server",
            success: false,
          });
        }

        const encodedPassword = base64decode(password);
        if (user.auth.password !== encodedPassword) {
          return res
            .status(400)
            .json({ error: "Incorrect user password!", success: false });
        }

        // find the usersubscription and products active

        // Product query
        const queryProduct = {};
        if (productId) {
          queryProduct.product_id = productId;
        }
        if (appId) {
          queryProduct.apps = { some: { app_id: appId } };
        }
        if (featureId) {
          queryProduct.features = { some: { feature_id: featureId } };
        }

        const products = await product_getList(queryProduct);

        const userProducts = await UserProductAppFeature_getList({
          user_id: user.id,
        });

        const userSubscriptions = await userSubscription_getList({
          user_id: user.id,
        });

        const userProductsParsed = await parse_userProducts(
          products,
          userProducts,
          userSubscriptions
        );
        if (userProductsParsed.length > 0) {
          return res.status(200).json({ userProductsParsed, success: true });
        }
        return res
          .status(400)
          .json({ error: "No app or feature found !", success: false });
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  // Edit App details
  router.post(
    "/edit-app-details",
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/products/edit-app-details");

      try {
        const email = req.body.email;
        const appcustomId = req.body.appId;
        const deviceId = req.body.deviceId;
        const lastUsed = req.body.lastUsed;
        const launchesSinceActivation = null;

        if (!appcustomId) {
          return res.status(400).json({
            error: "Please provide atleast one app or feature id",
            success: false,
          });
        }
        if (!email) {
          return res
            .status(400)
            .json({ error: "Please provide email", success: false });
        }

        const user = await user_findUnique({ name: email });
        if (!user) {
          return res.status(400).json({
            error: "Email does not exist in our server",
            success: false,
          });
        }

        const checkApp = await app_findUnique({ app_id: appcustomId });
        const checkFeature = await feature_findUnique({
          feature_id: appcustomId,
        });

        if (checkApp) {
          // check if active for user via subscription or purchased
          const checkUserAppPurchased = await rawQuery(
            `select * from user_products_apps_features where user_id = '${user.id}' and  app_id = '${checkApp.id}' and status = true`
          );

          const checkUserAppSubscription = await userSubscription_getList({
            subscriptions: {
              apps: { some: { id: checkApp.id } },
            },
          });
          const checkSubsFilter = checkUserAppSubscription.filter(
            (subs) => subs.user_id === user.id
          );

          if (
            checkUserAppPurchased.length > 0 ||
            Date.now() <
              new Date(checkSubsFilter[0].stripe_current_period_end).getTime()
          ) {
            // means active
            const checkdeviceId = await userAppDeviceId_getList({
              user_id: user.id,
              app_id: appcustomId,
            });

            if (checkdeviceId.length > 0) {
              // update
              await userAppDeviceId_update(checkdeviceId[0].id, {
                user_id: user.id,
                app_id: appcustomId,
                device_id: deviceId,
              });
            } else {
              // insert
              await userAppDeviceId_insert({
                user_id: user.id,
                app_id: appcustomId,
                device_id: deviceId,
              });
            }
            res.status(200).json({
              message: `App details updated successfully`,
              success: true,
            });
          } else {
            return res
              .status(400)
              .json({ error: "No app or feature found !", success: false });
          }
        } else if (checkFeature) {
          // check if active for user via subscription or purchased
          const checkUserFeaturePurchased = await rawQuery(
            `select * from user_products_apps_features where user_id = '${user.id}' and  feature_id = '${checkFeature.id}' and status = true`
          );

          const checkUserAppSubscription = await userSubscription_getList({
            subscriptions: {
              features: { some: { id: checkFeature.id } },
            },
          });
          const checkSubsFilter = checkUserAppSubscription.filter(
            (subs) => subs.user_id === user.id
          );

          if (
            checkUserFeaturePurchased.length > 0 ||
            Date.now() <
              new Date(checkSubsFilter[0].stripe_current_period_end).getTime()
          ) {
            // means active
            const checkdeviceId = await userAppDeviceId_getList({
              user_id: user.id,
              feature_id: appcustomId,
            });

            if (checkdeviceId.length > 0) {
              // update
              await userAppDeviceId_update(checkdeviceId[0].id, {
                user_id: user.id,
                feature_id: appcustomId,
                device_id: deviceId,
              });
            } else {
              // insert
              await userAppDeviceId_insert({
                user_id: user.id,
                feature_id: appcustomId,
                device_id: deviceId,
              });
            }
            res.status(200).json({
              message: `Feature details updated successfully`,
              success: true,
            });
          } else {
            return res
              .status(400)
              .json({ error: "No app or feature found !", success: false });
          }
        } else {
          return res
            .status(400)
            .json({ error: "Invalid appId !", success: false });
        }
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  router.post(
    "/get-app-deviceid",
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/products/get-app-deviceid");

      try {
        const email = req.body.email;
        const appcustomId = req.body.appId;
        const password = req.body.password;

        if (!(email && appcustomId)) {
          return res
            .status(400)
            .json({ error: "Please enter email and appId", success: false });
        }

        if (!password) {
          return res
            .status(400)
            .json({ error: "password id is required!", success: false });
        }

        let encodedPassword = base64decode(password);

        const user = await user_findUnique({ name: email });

        if (!user) {
          return res.status(400).json({
            error: "Email does not exist in our server",
            success: false,
          });
        }

        if (user.auth.password !== encodedPassword) {
          return res
            .status(400)
            .json({ error: "Incorrect user password!", success: false });
        }

        // device id
        let deviceid = await userAppDeviceId_getList({
          user_id: user.id,
          app_id: appcustomId,
        });

        if (deviceid.length > 0) {
          res.status(200).json({
            data: deviceid,
            success: true,
          });
        } else {
          deviceid = await userAppDeviceId_getList({
            user_id: user.id,
            feature_id: appcustomId,
          });

          if (deviceid.length > 0) {
            res.status(200).json({
              data: deviceid,
              success: true,
            });
          } else {
            return res.status(400).json({
              error:
                "You have to purchase or subscribe this app or device id is not there",
              success: false,
            });
          }
        }
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  // Reset actions API token
  router.post(
    "/getresetactionapiurl",
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/products/getresetactionapiurl");
      try {
        const email = req.body.email;
        const password = req.body.password;
        const reset = req.body.reset;

        if (!email) {
          return res
            .status(400)
            .json({ error: "Email is required!", success: false });
        }
        if (!password) {
          return res
            .status(400)
            .json({ error: "Password is required!", success: false });
        }

        const encodedPassword = base64decode(password);
        // get user by email
        const user = await user_findUnique({ name: email });

        if (!user) {
          return res.status(400).json({
            error: "Email does not exist in our server",
            success: false,
          });
        }

        if (user.auth.password !== encodedPassword) {
          return res
            .status(400)
            .json({ error: "Incorrect user password!", success: false });
        }

        if (reset) {
          // update token
          await user_update(user.id, {
            actions_api_token: randomString(),
          });
        }

        const baseURL = `${config.base_uri}/actionsapi/`;

        const user1 = await user_findUnique({ name: email });

        const actionsAPIURL = baseURL + user1?.actions_api_token;

        return res.status(200).json({ data: actionsAPIURL, success: true });
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  // Add action api token
  router.post(
    "/app-listening",
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/products/app-listening");
      try {
        const email = req.body.email;
        const password = req.body.password;
        const text = req.body.text;

        if (!email) {
          return res
            .status(400)
            .json({ error: "Email is required!", success: false });
        }
        if (!password) {
          return res
            .status(400)
            .json({ error: "Password is required!", success: false });
        }
        if (!text) {
          return res
            .status(400)
            .json({ error: "Text is required!", success: false });
        }
        let encodedPassword = base64decode(password);
        // get user by email
        const user = await user_findUnique({ name: email });

        if (!user) {
          return res.status(400).json({
            error: "Email does not exist in our server",
            success: false,
          });
        }

        if (user.auth.password !== encodedPassword) {
          return res
            .status(400)
            .json({ error: "Incorrect user password!", success: false });
        }

        // update token
        await user_update(user.id, {
          actions_api_text: text,
        });

        return res
          .status(200)
          .json({ data: "Added successfully", success: true });
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  // Book test library
  // Add action api token
  router.post(
    "/books",
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/products/books");
      try {
        const email = req.body.email;
        const password = req.body.password;
        const bookID = req.body.bookID; // String - this is the id of the book we are going to search
        const pageNumber = req.body.pageNumber; // optional string - number specifying page number
        const lineNumber = req.body.lineNumber; // optional string - number specifying the line number - for dictionaries this would be the column number
        const wordNumber = req.body.wordNumber; // optional string - number specifying how many words in the word is located - for dictionaries this is how many words down
        const wordToFind = req.body.wordToFind; // optional string - this is for the user to specify a specific word to find the location
        const random = req.body.random; // optional bool - related to "wordToFind", this is for the user to speficy if they want a random location (if true), or the first location (if false)

        if (!email) {
          return res
            .status(400)
            .json({ error: "Email is required!", success: false });
        }
        if (!password) {
          return res
            .status(400)
            .json({ error: "Password is required!", success: false });
        }
        if (!text) {
          return res
            .status(400)
            .json({ error: "Text is required!", success: false });
        }
        let encodedPassword = base64decode(password);
        // get user by email
        const user = await user_findUnique({ name: email });

        if (!user) {
          return res.status(400).json({
            error: "Email does not exist in our server",
            success: false,
          });
        }

        if (user.auth.password !== encodedPassword) {
          return res
            .status(400)
            .json({ error: "Incorrect user password!", success: false });
        }

        // check if user has active subscription for this book or it is active

        return res
          .status(200)
          .json({ data: "Added successfully", success: true });
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  return router;
};
