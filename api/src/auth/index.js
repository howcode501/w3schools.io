const express = require("express");
const Passport = require("passport");

module.exports = async (app, req, socket) => {
  const authRouter = express.Router();
  const passport = new Passport.Passport();
  const config = app.get("configuration");
  const helpers = await require("./helpers")(app);
  const logger = app.get("logger");

  const { getRefreshToken, refreshTokenHandler } =
    await require("./refresh-token")(app, passport, helpers);
  const { getAccessToken, accessTokenMiddleware } =
    await require("./access-token")(app, passport, helpers, socket);
  const { loginHandler } = await require("./login")(app, passport, helpers);
  const { checkUsernameHandler, validateUseremailHandler, createUser } =
    await require("./user-curd")(app, helpers);
  const { checkCodeHandler } = await require("./check-code")(app, helpers);

  const {
    forgetPasswordHandler,
    resetPasswordHandler,
    resetPasswordVerifyHandler,
  } = await require("./change-password")(app, helpers);

  const { logoutHandler } = await require("./logout")(app, passport, helpers);
  const { apikeyHandler } = await require("./get-token")(
    app,
    passport,
    helpers
  );
  const { init_superadmin, serialize_user, deserialize_user } = helpers;

  // init_superadmin
  await init_superadmin();

  passport.serializeUser(serialize_user);
  passport.deserializeUser(deserialize_user);

  // User Authentication
  authRouter.post("/login", loginHandler);
  authRouter.post("/check-user", checkUsernameHandler);
  authRouter.post("/validate-user", validateUseremailHandler);

  // User Signup / Activation
  authRouter.post("/check-code", checkCodeHandler);
  authRouter.post("/create-user", createUser);

  // OAuth2 Authentication
  // if (config.tenant_oauth) {
  //   const {
  //     loginOauthHandler,
  //     OAuthSSOCallbackHandler,
  //   } = await OAuthCallbackHandler(app, passport, helpers);
  //   authRouter.get('/tenant', loginOauthHandler);
  //   authRouter.get('/tenant/callback', OAuthSSOCallbackHandler);
  // }
  // // OAuth2 Authentication
  // if (config.tenant_oauth) {
  //   const {
  //     loginOauthHandler,
  //     OAuthSSOCallbackHandler,
  //   } = await OAuthCallbackHandler(app, passport, helpers);
  //   authRouter.get('/tenant', loginOauthHandler);
  //   authRouter.get('/tenant/callback', OAuthSSOCallbackHandler);
  // }

  // User Forgot & Reset Password
  authRouter.post("/forgot-password", forgetPasswordHandler);
  authRouter.get("/reset-password/:token", resetPasswordVerifyHandler);
  authRouter.patch("/reset-password/:token", resetPasswordHandler);

  // Service Authentication
  authRouter.post("/get-token", apikeyHandler);
  authRouter.get("/get-token", apikeyHandler);

  // Refresh Token logic
  authRouter.get("/refresh-token", refreshTokenHandler);
  authRouter.post("/refresh-token", refreshTokenHandler);

  // Logout
  authRouter.get("/logout", getRefreshToken, getAccessToken, logoutHandler);

  // Return current authenticated user object
  authRouter.get("/me", accessTokenMiddleware, (req, res) => {
    res.json(req.user);
  });

  return { passport, authRouter, accessTokenMiddleware };
};
