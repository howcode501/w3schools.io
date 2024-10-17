const { compose } = require("compose-middleware");
const asyncHandler = require("express-async-handler");
const jwt_decode = require("jwt-decode");
const OAuth2Strategy = require("passport-oauth2");

module.exports = async (app, passport, helpers) => {
  const { user_normalize } = app.get("datastore");
  const config = app.get("configuration");
  const { lookup_or_create_user, compute_refresh_token } = helpers;

  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

  // Token decode
  const computeIdToken = (params) => {
    const userFields = jwt_decode(params.id_token);
    const user = {
      email: userFields.email,
      displayName: userFields.name,
      firstName: userFields.given_name,
      lastName: userFields.family_name,
      avatar: userFields.picture,
    };
    return user;
  };

  const OAuthCallbackHandler = async (
    accessToken,
    refreshToken,
    params,
    profile,
    cb
  ) => {
    if (params) {
      const user = computeIdToken(params);
      // Check user if it exists in database, if not then create new user
      const senduser = await lookup_or_create_user(user);
      return cb(null, senduser);
    }
    return cb(null, null);
  };

  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: config.tenant_oauth.authUri,
        tokenURL: config.tenant_oauth.tokenUrl,
        clientID: config.tenant_oauth.clientId,
        clientSecret: config.tenant_oauth.clientSecret,
        callbackURL: config.tenant_oauth.path,
      },
      OAuthCallbackHandler
    )
  );

  const loginOauthHandler = passport.authenticate("oauth2", {
    scope: ["email", "profile"],
  });

  const successHandler = asyncHandler(async (req, res) => {
    if (req.user) {
      const user = await user_normalize(req.user);
      const { refreshToken, cookieOptions } = await compute_refresh_token({
        user_id: user.id,
        rememberMe: req.rememberMe || false,
      });

      res.cookie(config.refreshToken_name, refreshToken, cookieOptions);
      // Successful authentication, redirect home.
      res.redirect(`${config.frontend_url}/`);
    }
  });

  const OAuthSSOCallbackHandler = compose([
    passport.authenticate("oauth2", {
      failureRedirect: `${config.frontend_url}/login`,
    }),
    successHandler,
  ]);

  return { OAuthSSOCallbackHandler, loginOauthHandler };
};
