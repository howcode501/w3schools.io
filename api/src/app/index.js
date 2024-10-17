const express = require("express");

module.exports = async (app) => {
  const { apiKeys_findUnique } = app.get("datastore");
  const appRouter = express.Router();

  async function checkApiKey(req, res, next) {
    try {
      const email = req.headers.authemail;
      const apiKey = req.headers.apikey;
      if (!email) {
        return res.status(401).json({
          error: "Please provide authemail",
          success: false,
        });
      } else if (!apiKey) {
        return res.status(401).json({
          error: "Please provide apikey",
          success: false,
        });
      }

      const apiData = await apiKeys_findUnique({ email });
      const requestUrl = req.originalUrl.split("/").pop();
      if (apiData) {
        let valid = false;
        if (apiData?.key === apiKey && apiData.status === true) {
          for (let i = 0; i < apiData?.routes.length; i++) {
            if (
              requestUrl.trim() == apiData.routes[i].name &&
              apiData.routes[i].value === true
            ) {
              valid = true;
            }
          }
          if (valid === true) {
            next();
          } else {
            return res.status(401).json({
              error: "Unauthorized",
              success: false,
            });
          }
        } else {
          return res.status(401).json({
            error: "Unauthorized",
            success: false,
          });
        }
      } else {
        return res.status(401).json({
          error: "Unauthorized",
          success: false,
        });
      }
    } catch (error) {
      return res.status(401).json({
        error: error.message,
        success: false,
      });
    }
    // return;
  }

  const usersHandler = await require("./users")(app, checkApiKey);
  const productHandler = await require("./products")(app);
  const subscriptionHandler = await require("./subscriptions")(app);

  appRouter.use("/users", usersHandler);
  appRouter.use("/products", checkApiKey, productHandler);
  appRouter.use("/subscriptions", checkApiKey, subscriptionHandler);

  return { appRouter, checkApiKey };
};
