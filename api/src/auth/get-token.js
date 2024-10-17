const { compose } = require("compose-middleware");
const asyncHandler = require("express-async-handler");
const passport_strategy = require("passport-strategy");
const util = require("util");

function Strategy(options, verify) {
  if (typeof options === "function") {
    // eslint-disable-next-line no-param-reassign
    verify = options;
    // eslint-disable-next-line no-param-reassign
    options = {};
  }
  if (!verify) {
    throw new TypeError("Strategy requires callback");
  }

  passport_strategy.Strategy.call(this);

  this.name = "thoughtcastowners-apikey";
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport_strategy.Strategy);

// eslint-disable-next-line consistent-return
Strategy.prototype.authenticate = function (req, options) {
  // eslint-disable-next-line no-param-reassign,no-unused-vars
  options = options || {};

  const credential = req.credential || null;

  if (!credential) {
    return this.fail(401, "No credentials provided");
  }

  // --
  const self = this;

  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      if (typeof info === "string") {
        // eslint-disable-next-line no-param-reassign
        info = { message: info };
      }
      // eslint-disable-next-line no-param-reassign
      info = info || {};
      return self.fail(401, info.message);
    }
    return self.success(user, info);
  }

  try {
    if (self._passReqToCallback) {
      this._verify(req, credential, verified);
    } else {
      this._verify(credential, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};

module.exports = async (app, passport, helpers) => {
  const { user_authenticate, user_normalize } = app.get("datastore");
  const {
    lookup_user,
    authenticate_apikey,
    compute_access_token,
    compute_refresh_token,
    get_basic_auth,
    get_api_key,
  } = helpers;

  // Harvest credential
  function getCredential(req, _res, next) {
    // check basic-auth
    let { username, password } = get_basic_auth(req);

    // check req.body
    if (!username) {
      username = req.body?.username || null;
      password = req.body?.password || null;
    }

    // check authorization header
    const apikey = get_api_key(req);

    // Set credential
    req.credential = null;
    if (username && password) {
      req.logger.debug(
        { username, password },
        "getCredential: Found username, password"
      );
      req.credential = { username, password };
    }
    if (!req.credential && apikey) {
      req.logger.debug({ apikey }, "getCredential: Found apikey");
      req.credential = { apikey };
    }
    next();
  }

  async function apikeyPassportVerifyAsync(credential) {
    const { username, password, apikey } = credential;

    // TODO - restrict to 'api-access' only
    // TODO - propage user and scope
    let user = null;
    if (username && password) {
      user = await lookup_user({ username });
      if (!user_authenticate(user, password)) {
        user = null;
      }
    }
    if (apikey) {
      const rv = await authenticate_apikey(apikey);
      user = rv?.user;
    }
    return user_normalize(user);
  }

  passport.use(
    "thoughtcastowners-apikey",
    new Strategy({}, (token, done) => {
      apikeyPassportVerifyAsync(token)
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false, { message: "Invalid credentials" });
        })
        .catch((err) => done(err));
    })
  );

  const apikeyHandler = compose([
    getCredential,
    passport.authenticate("thoughtcastowners-apikey", { session: false }),
    asyncHandler(async (req, res) => {
      // TODO - create with scope
      const { accessToken, tokenExpiry } = compute_access_token(req.user, {});
      const { refreshToken } = await compute_refresh_token({
        user_id: req.user?.id,
      });
      req.logger.info(
        { accessToken, refreshToken, tokenExpiry },
        "/auth/get-token"
      );
      res.json({ accessToken, refreshToken, tokenExpiry });
    }),
  ]);

  return { apikeyHandler };
};
