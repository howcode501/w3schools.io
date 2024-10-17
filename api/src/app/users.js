const express = require("express");
const asyncHandler = require("express-async-handler");
const { base64decode } = require("nodejs-base64");

module.exports = async (app, checkApiKey) => {
  const router = express.Router();
  const config = app.get("configuration");
  const notify = app.get("notify");

  const { user_findUnique, user_getList } = app.get("datastore");
  const { confirmUserAndGenerateToken } = await require("../auth/helpers")(app);

  // Endpoints

  // Verify User
  router.post(
    "/verify-user",
    checkApiKey,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/users/verify-user");

      try {
        const reqEmail = req.body.email;
        const password = req.body.password;

        if (!reqEmail) {
          return res
            .status(400)
            .json({ error: "Please provide email", success: false });
        }
        if (!password) {
          return res
            .status(400)
            .json({ error: "password id is required!", success: false });
        }
        let encodedPassword = base64decode(password);
        const email = reqEmail.toLowerCase();
        const userData = await user_findUnique({ name: email });
        if (!userData) {
          return res.status(400).json({
            error: "Email does not exist in our server",
            success: false,
          });
        }

        if (encodedPassword !== userData.auth.password) {
          return res
            .status(400)
            .json({ error: "Incorrect user password!", success: false });
        }

        return res
          .status(200)
          .json({ data: { message: "success", success: true } });
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  // Send Password Reset Mail
  router.post(
    "/send-password-reset-email",
    checkApiKey,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /app/users/send-password-reset-email");

      try {
        let email = req.body.email;
        if (!email) {
          return res.status(400).json({
            error: "Please enter email",
            status: false,
          });
        }
        email = email.toLowerCase();
        const user = await user_findUnique({ name: email });

        if (user) {
          const result = await confirmUserAndGenerateToken(user.name);
          await notify.send_password_reset({
            email: result.user.profile.email,
            firstName: result.user.profile.first_name,
            resetLink: `${config.base_uri}/password/reset-password/${result.token.accessToken}`,
          });
          return res.status(200).json({
            data: "Mail send successfully",
            success: true,
          });
        } else {
          return res.status(400).json({
            error: "User not found",
            success: false,
          });
        }
      } catch (error) {
        return res.status(400).json({
          error: error.message,
          success: false,
        });
      }
    })
  );

  // Read actions apps json response
  router.get(
    "/actionsapi/:id/json",
    asyncHandler(async (req, res) => {
      try {
        const id = req.params.id;
        if (!id) {
          return res
            .status(400)
            .json({ error: "Unique ID is required!", success: false });
        }
        // get user by ID token
        const user = await user_getList({ actions_api_token: id });
        if (!user.length > 0) {
          return res.status(400).json({
            error: "User or ID does not exist in our server",
            success: false,
          });
        }

        return res
          .status(200)
          .json({ data: user[0]?.actions_api_text, success: true });
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  // Read actions apps text response
  router.get(
    "/actionsapi/:id",
    asyncHandler(async (req, res) => {
      try {
        const id = req.params.id;
        if (!id) {
          return res
            .status(400)
            .json({ error: "Unique ID is required!", success: false });
        }
        // get user by ID token
        const user = await user_getList({ actions_api_token: id });
        if (!user.length > 0) {
          return res.status(400).json({
            error: "User or ID does not exist in our server",
            success: false,
          });
        }

        return res.status(200).send(user[0]?.actions_api_text);
      } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
      }
    })
  );

  return router;
};
