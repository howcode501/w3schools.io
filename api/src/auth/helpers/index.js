/* eslint-disable no-else-return */
const jwt = require("jsonwebtoken");
const axios = require("axios");
const jwt_decode = require("jwt-decode");

module.exports = async (app) => {
  const logger = app.get("logger");
  const config = app.get("configuration");
  const { nanocode } = app.get("utilities");
  const {
    user_findUnique,
    user_upsert,
    user_setroles,
    refreshToken_compute,
    refreshToken_delete,
    oneTimeToken_compute,
    oneTimeToken_invalid,
    oneTimeToken_check,
    promoCode_findUnique,
    user_validateUser,
    user_setsubscriptions,
    user_setproducts,
    promoCode_update,
  } = app.get("datastore");

  function sign(payload) {
    // TODO - fill out signing details, ie. issuer, etc.
    // TODO - determine proper secret
    const secret = config.jwt_secret;
    const expiresIn = config.jwt_token_expiration;

    return jwt.sign(payload, secret, {
      algorithm: "HS256",
      issuer: config.jwt_issuer,
      expiresIn,
    });
  }

  function compute_access_token(user, { permissions = [], one_time = false }) {
    // eslint-disable-next-line no-param-reassign
    permissions = user?.permissions || permissions;
    // perms = user?.perms;
    logger.debug({ user, permissions }, "compute_access_token");
    if (!user || !user.id || !user.username) {
      logger.warn({ user, permissions }, "compute_access_token: Null user");
      return {};
    }
    // TODO - implement 'service-account'
    const payload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      token_id: nanocode(16),
      tokenExpiry: config.jwt_token_expiration,
      roles: user.roles,
      permissions,
    };
    if (one_time) {
      payload.one_time = one_time;
    }

    const token = sign(payload);
    const { tokenExpiry } = payload;
    return { accessToken: token, tokenExpiry };
  }

  async function compute_refresh_token({ user_id, rememberMe = false }) {
    const { token, delay, validityTimestamp } = await refreshToken_compute({
      user_id,
      rememberMe,
    });

    const cookieOptions = {
      expires: new Date(validityTimestamp * 1000),
      httpOnly: true,
      overwrite: true,
      secure: config.is_production,
      signed: true,
    };

    return {
      refreshToken: token?.id,
      refreshTokenExpiry: delay,
      cookieOptions,
    };
  }

  /**
   * Lookup a code
   * @param {{code}}
   * @return {prisma.PromoCode}
   */
  async function lookup_code(params) {
    const promoCode = await promoCode_findUnique(params);

    return promoCode;
  }

  /**
   * Lookup a user
   * @param {{username}}
   * @return {prisma.User}
   */
  async function lookup_user(params) {
    const user = await user_findUnique(params);
    // exclude if not enabled
    // return user?.auth?.enabled === true ? user : null;
    return user;
  }

  /**
   * Lookup and Create a new user
   * @param {{username}}
   * @return {prisma.User}
   */
  async function lookup_or_create_user(params) {
    let user = await user_findUnique({ name: params.email });
    if (user) {
      // user already exist and returned
      return user;
    } else {
      user = await user_upsert({
        name: params.email,
        auth: {
          method: params.auth_method,
          enabled: true,
          profile: params.auth_profile,
        },
        profile: {
          first_name: params.firstName,
          last_name: params.lastName,
          email: params.email,
          email_validated: true,
        },
      });

      if (user) {
        // user does not exist and created new user
        const role = "user";
        await user_setroles({ roles: role, user });
      }
      return user;
    }
  }

  function serialize_user(user, done) {
    return done(null, JSON.stringify({ id: user.id }));
  }

  function deserialize_user(userJson, done) {
    const { id } = JSON.parse(userJson);

    lookup_user({ id })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  }

  function get_authorization_header(req, kind) {
    const auth = req?.headers?.authorization;
    if (auth) {
      const h = auth.split(" ");
      if (h.length === 2 && kind === h[0]) {
        return h[1];
      }
      if (h.length === 1 && kind === null) {
        return h;
      }
    }
    return null;
  }

  function get_basic_auth(req) {
    const base64Credentials = get_authorization_header(req, "Basic") || "";
    let [username, password] = Buffer.from(base64Credentials, "base64")
      .toString("ascii")
      .split(":");
    let apikey;
    if (username && !password) {
      apikey = username;
      username = undefined;
      password = undefined;
    } else if (!username && password) {
      apikey = password;
      username = undefined;
      password = undefined;
    }
    return { username, password, apikey };
  }

  function get_api_key(req) {
    let { apikey } = get_basic_auth(req);

    apikey = req.query?.apiKey ? req.query.apiKey : apikey;
    apikey = req.body?.apiKey ? req.body.apiKey : apikey;
    apikey = get_authorization_header(req, null) || apikey;
    return apikey;
  }

  function get_access_token(req, socket) {
    let token = null;
    if (socket) {
      logger.warn("Socket Data was sent to Get Access Token");
    }

    token = req.query?.accessToken ? req.query.accessToken : token;
    token = socket?.handshake?.auth?.token;
    token = req.signedCookies ? req.signedCookies.accessToken || token : token;
    token = get_authorization_header(req, "Bearer") || token;
    return token;
  }

  async function verify_google_recaptcha(responseKey, logger = undefined) {
    const secret_key = config.google_recaptcha;
    if (secret_key) {
      // Hitting POST request to the URL, Google will
      // respond with success or error scenario.
      const url = "https://www.google.com/recaptcha/api/siteverify";
      logger?.warn({ url }, "Recaptcha Verify Url");
      // Make a request for a user with a given ID
      try {
        const response = await axios.post(
          url,
          new URLSearchParams({
            secret: secret_key,
            response: responseKey,
          })
        );
        logger?.warn({ response: response.data }, "Recaptcha Verify Response");
        return response?.data;
      } catch (e) {
        logger?.warn({ error: e }, "Recaptcha Verify Error");
        return { success: false, "error-codes": e };
      }
    }

    // If recaptcha is not configured, always succeed
    return { success: true };
  }

  async function init_superadmin() {
    const password = config.superadmin_password;
    const enabled = password && password != null;
    logger.debug({ password, enabled }, "init_superadmin");

    const user = await user_upsert({
      name: "support@thoughtcastowners.com",
      auth: {
        password,
        enabled,
        method: 1,
      },
      profile: {
        first_name: "Super",
        last_name: "Admin",
        email: "support@thoughtcastowners.com",
      },
    });
    if (user) {
      await user_setroles({ roles: "msp", user_id: user.id });
      logger.warn({ password, enabled }, "init_superadmin: initialized");
    } else {
      logger.warn(
        { password, enabled },
        "init_superadmin: failed to initialize"
      );
    }
  }
  // email validate //
  function validateEmail(email) {
    // eslint-disable-next-line no-useless-escape
    return !!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  }
  /**
   * confirm user and generate token
   * @param {{username}}
   * @return {prisma.User}
   */
  async function confirmUserAndGenerateToken(email) {
    try {
      const user = await user_findUnique({ name: email });
      if (user) {
        user.username = user.name;
        if (!user.auth.enabled) {
          // user is disabled -> return error
          const err = { error: "User is disabled!", code: 400 };
          throw err;
        }
        const token = compute_access_token(user, {});
        await oneTimeToken_compute({
          user_id: user.id,
          token: token.accessToken,
        });
        return { user, token };
      }
      // return error
      const err = { error: "User not found!", code: 400 };
      throw err;
    } catch (err) {
      // manual error handeling - err['error'] is a manual error
      if (!err.error) return { error: { message: err.message, code: 400 } };
      return { error: { message: err.error, code: err.code } };
    }
  }

  /**
   * confirm user and generate token
   * @param {{token, old password, new password}}
   * @return {prisma.User}
   */
  async function verifyTokenAndResetPassword(token, password, verifyToken) {
    const decodedToken = jwt_decode(token);
    try {
      const user = await user_findUnique({ name: decodedToken.username });

      if (user) {
        if (!user.auth.enabled) {
          // user is disabled -> return error
          const err = { error: "User is disabled!", code: 400 };
          throw err;
        } else if (user.auth.method === "SSO") {
          // user with sso method -> return error
          const err = {
            error:
              "User with SSO login method are not allowed to reset password!",
            code: 400,
          };
          throw err;
        }

        const result = await oneTimeToken_check({
          token,
          type: "PasswordReset",
        });

        if (result && result.error) {
          const err = { error: result.error, code: 400 };
          throw err;
        }

        if (verifyToken) {
          return user;
        }

        const modifiedUser = await user_upsert({
          name: decodedToken.username,
          auth: {
            password,
          },
        });

        await refreshToken_delete({ user_id: modifiedUser.id });
        // make invalid existing oneTimeToken for user
        await oneTimeToken_invalid({
          user_id: modifiedUser.id,
          type: "PasswordReset",
        });

        // password updated and return modified user
        return modifiedUser;
      }
      // return error
      const err = { error: "User not found!", code: 400 };
      throw err;
    } catch (err) {
      // manual error handeling - err['error'] is a manual error
      if (!err.error) return { error: { message: err.message, code: 400 } };
      return { error: { message: err.error, code: err.code } };
    }
  }

  return {
    compute_access_token,
    compute_refresh_token,
    get_access_token,
    get_api_key,
    get_basic_auth,
    init_superadmin,
    lookup_user,
    lookup_or_create_user,
    serialize_user,
    deserialize_user,
    verify_google_recaptcha,
    validateEmail,
    confirmUserAndGenerateToken,
    verifyTokenAndResetPassword,
    lookup_code,
    user_validateUser,
    user_setroles,
    user_setsubscriptions,
    user_setproducts,
    user_upsert,
    promoCode_update,
  };
};
