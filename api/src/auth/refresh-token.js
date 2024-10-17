const asyncHandler = require('express-async-handler');
const {compose} = require('compose-middleware');
const PassportStrategy = require('passport-strategy');
const util = require('util');

function Strategy(options, verify) {
  if (typeof options === 'function') {
    // eslint-disable-next-line no-param-reassign
    verify = options;
    // eslint-disable-next-line no-param-reassign
    options = {};
  }
  if (!verify) {
    throw new TypeError('RefreshToken strategy requires callback');
  }
  PassportStrategy.Strategy.call(this);
  this.name = 'refresh-token';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, PassportStrategy.Strategy);

// eslint-disable-next-line consistent-return
Strategy.prototype.authenticate = function authenticate(req) {
  const tokenId = req.refreshToken || null;
  if (!tokenId) {
    return this.fail(401, 'No RefreshToken');
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
        info = {message: info};
      }
      // eslint-disable-next-line no-param-reassign
      info = info || {};
      return self.fail(401, info.message);
    }
    return self.success(user, info);
  }

  try {
    if (self._passReqToCallback) {
      this._verify(req, tokenId, verified);
    } else {
      this._verify(tokenId, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};

module.exports = async (app, passport, helpers) => {
  const logger = app.get('logger');
  const config = app.get('configuration');
  const {refreshToken_getValid, user_normalize} = app.get('datastore');
  const {compute_access_token, lookup_user} = helpers;

  async function refreshTokenPassportVerifyAsync(tokenId) {
    const passport_strategy = 'refresh-token';
    logger.debug(
        {refreshToken: tokenId, passport_strategy},
        'Passport Verify',
    );
    const token = await refreshToken_getValid({token_id: tokenId});

    // TODO - implement 'scope'
    const user =
        token && token.user_id ? await lookup_user({id: token.user_id}) : null;

    return user_normalize(user);
  }

  // Add Passport Strategy
  passport.use(
      'refresh-token',
      new Strategy({}, (tokenId, done) => {
        refreshTokenPassportVerifyAsync(tokenId).then((user) => {
          if (user) {
            return done(null, user);
          }

          return done(null, false, {
            message: 'Expired or Invalid RefreshToken',
          });
        }).catch((err) => done(err));
      }),
  );

  // Harvest refresh token
  // Order of precedence: cookie, body, query
  function getRefreshToken(req, _res, next) {
    let token = null;
    // check in query string
    token = req.query?.refreshToken ? req.query.refreshToken : token;
    // check in body
    token = req.body?.refreshToken ? req.body.refreshToken : token;
    // check in cookie
    token = req.signedCookies
        ? req.signedCookies[config.refreshToken_name] || token
        : token;
    if (token === 'undefined') {
      token = null;
    }

    // Set refreshToken
    req.refreshToken = token;
    if (token) {
      req.logger.debug(
          {refreshToken: token},
          'getRefreshToken: Found refresh token',
      );
    }
    next();
  }

  // Define Route Middleware
  const refreshTokenHandler = compose([
    getRefreshToken,
    passport.authenticate('refresh-token', {session: false}),
    // eslint-disable-next-line no-unused-vars, prefer-arrow-callback
    asyncHandler(async function refreshTokenHandler(req, res, _next) {
      const {accessToken, tokenExpiry} = compute_access_token(req.user, {});
      req.logger.debug(
          {accessToken, refreshToken: req.refreshToken, tokenExpiry},
          '/auth/refresh-token',
      );
      res.json({accessToken, tokenExpiry});
    }),
  ]);

  async function getImplicitAccessToken(req, _res, next) {
    req.logger.debug('Implicit Access Token');
    let token = null;
    // check in query string
    token = req.query?.refreshToken ? req.query.refreshToken : token;
    // check in body
    token = req.body?.refreshToken ? req.body.refreshToken : token;
    // check in cookie
    token = req.signedCookies
        ? req.signedCookies[config.refreshToken_name] || token
        : token;
    if (token === 'undefined') {
      token = null;
    }

    if (token !== null) {
      // Set refreshToken
      req.refreshToken = token;
      const refreshToken = await refreshToken_getValid(
          {token_id: token});
      //
      let user = refreshToken && refreshToken?.user_id ? await lookup_user({ id: refreshToken.user_id }) : null;
      if (user) {
        user = await user_normalize(user);
        const {accessToken} = await compute_access_token(user,
            {one_time: true});
        req.user = user;
        req.accessToken = accessToken;
      } else {
        const accessToken = null;
        req.accessToken = accessToken;
      }

      next();
    } else {
      const now = new Date();
      const time = now.getTime();
      const expireTime = time + 1000 * 36000;

      const cookieOptions = {
        expires: new Date(expireTime),
        httpOnly: false,
        overwrite: true,
      };

      req.logger.debug({req}, 'Setting Redirect cookie');
      _res.cookie('open-redirect', encodeURI(req.originalUrl), cookieOptions);

      _res.redirect(`${config.base_uri}/login`);
    }
  }

  return {
    getImplicitAccessToken,
    getRefreshToken,
    refreshTokenHandler,
  };
};
