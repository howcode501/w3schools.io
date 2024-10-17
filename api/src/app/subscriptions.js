const express = require("express");
const asyncHandler = require("express-async-handler");
const { base64decode } = require("nodejs-base64");

module.exports = async (app) => {
  const router = express.Router();

  const { user_findUnique, userSubscription_getList } = app.get("datastore");

  // Endpoints

  // Check subscription
  router.post(
    "/check-subscription",
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/subscriptions/check-subscription");

      try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email) {
          return res
            .status(400)
            .json({ error: "email is required!", success: false });
        }
        if (!password) {
          return res
            .status(400)
            .json({ error: "password is required!", success: false });
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
        // get user active susbscriptions
        const susbscription = await userSubscription_getList({
          user_id: user.id,
        });
        if (!susbscription.length > 0) {
          return res
            .status(400)
            .json({ error: "User has no subscription!", success: false });
        }

        return res.status(200).json({ data: susbscription, success: true });
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  return router;
};
