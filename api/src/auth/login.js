const { compose } = require('compose-middleware');
const asyncHandler = require('express-async-handler');
const passport_strategy = require('passport-strategy');
const util = require('util');

function Strategy(options, verify) {
  if (typeof options === 'function') {
    // eslint-disable-next-line no-param-reassign
    verify = options;
    // eslint-disable-next-line no-param-reassign
    options = {};
  }
  if (!verify) {
    throw new TypeError('LocalLogin Strategy requires callback');
  }

  passport_strategy.Strategy.call(this);

  this.name = 'thoughtcastowners-local-login';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport_strategy.Strategy);

// eslint-disable-next-line consistent-return
Strategy.prototype.authenticate = function (req, options) {
  // eslint-disable-next-line no-param-reassign,no-unused-vars
  options = options || {};

  // extract credentials from POST body
  const username = req.body?.username || null;
  const password = req.body?.password || null;

  // hoist 'rememberMe' if set
  req.rememberMe = req.body?.rememberMe || false;

  if (!username || !password) {
    return this.fail(401, 'No credentials provided');
  }

  // --
  const self = this;

  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      if (typeof info === 'string') {
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
      this._verify(req, { username, password }, verified);
    } else {
      this._verify({ username, password }, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};

module.exports = async (app, passport, helpers) => {
  const config = app.get('configuration');
  const { user_authenticate, user_normalize } = app.get('datastore');
  const { lookup_user, compute_access_token, compute_refresh_token } = helpers;

  async function localLoginPassportVerifyAsync({ username, password }) {
    let user = await lookup_user({ username });
    if (user && !user_authenticate(user, password)) {
      user = null;
    }
    return user_normalize(user);
  }

  passport.use(
    'thoughtcastowners-local-login',
    new Strategy({}, (params, done) => {
      localLoginPassportVerifyAsync(params)
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false, { message: 'Invalid credentials' });
        })
        .catch((err) => done(err));
    }),
  );

  const loginHandler = compose([
    passport.authenticate('thoughtcastowners-local-login', { session: false }),
    asyncHandler(async (req, res) => {
      const { accessToken, tokenExpiry } = compute_access_token(req.user, {});
      const { refreshToken, cookieOptions } = await compute_refresh_token({
        user_id: req.user?.id,
        rememberMe: req.rememberMe || false,
      });
      req.logger.debug(
        { accessToken, refreshToken, tokenExpiry },
        '/auth/login',
      );
      res.cookie(config.refreshToken_name, refreshToken, cookieOptions);
      res.json({ accessToken, tokenExpiry });
    }),
  ]);

  return { loginHandler };
};
