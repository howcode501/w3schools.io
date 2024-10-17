const JwtStrategy = require('passport-jwt').Strategy;
const asyncHandler = require('express-async-handler');
const { compose } = require('compose-middleware');

module.exports = async (app, passport, helpers) => {
  const config = app.get('configuration');
  const logger = app.get('logger');
  const {
    user_normalize,
    user_authenticate,
    refreshToken_delete,
    refreshToken_getValid,
  } = app.get('datastore');

  const {
    lookup_user,
    compute_access_token,
    compute_refresh_token,
    get_basic_auth,
    get_api_key,
    get_access_token,
    authenticate_apikey,
  } = helpers;

  // convert accessToken into valid user
  async function jwtPassportVerifyAsync(payload) {
    const passport_strategy = 'access-token';
    logger.debug({ payload, passport_strategy }, 'Passport Verify');

    let user = null;
    if (payload?.id) {
      // reject accessToken if no current, matching RefreshToken for user
      // essentially this is an implicit invalidation check
      const token = await refreshToken_getValid({ user_id: payload.id });
      if (!token?.user_id) {
        return null;
      }

      if (payload.one_time) {
        // this is a one-time token, so immediately purge the refreshToken
        await refreshToken_delete({ id: token.id });
      }

      // TODO - implement 'service-account'
      user = await lookup_user({ id: payload.id });
    }
    return user_normalize(user);
  }

  // add Passport Strategy for JWT
  passport.use(
    'access-token',
    new JwtStrategy(
      {
        secretOrKey: config.jwt_secret,
        issuer: config.jwt_issuer,
        algorithms: ['HS256'],
        jsonWebTokenOptions: { expiresIn: config.jwt_token_expiration },
        jwtFromRequest: (req) => req.accessToken || null,
      },
      (payload, done) => {
        jwtPassportVerifyAsync(payload)
          .then((user) => {
            if (user) {
              return done(null, user);
            }

            return done(null, false, {
              message: 'Expired or Invalid AccessToken',
            });
          })
          .catch((err) => done(err));
      },
    ),
  );

  // Harvest accessToken
  // Order of precedence: header, cookie, query
  async function getAccessToken(req, _res, next, socket) {
    let token = null;

    req.logger.warn(
      { socket: socket?.handshake },
      'getAccessToken: Socket Data',
    );

    // first check for a username/password in basic-auth
    const { username, password } = get_basic_auth(req);
    if (username && password) {
      let user = await lookup_user({ username });
      if (user_authenticate(user, password)) {
        user = await user_normalize(user);
        const { accessToken } = compute_access_token(user, { one_time: true });
        await compute_refresh_token({ user_id: user?.id });
        token = accessToken;
      }
    }

    // override with a check for an apiKey
    const apiKey = get_api_key(req);
    if (apiKey) {
      const { user: user_raw, scope } = await authenticate_apikey(apiKey);
      if (user_raw) {
        const user = user_normalize(user_raw);
        const { accessToken } = compute_access_token(user, {
          scope,
          one_time: true,
        });
        await compute_refresh_token({ user_id: user?.id });
        token = accessToken;
      }
    }

    // override with a check for an explicit accessToken
    token = get_access_token(req, socket) || token;

    // Set accessToken
    req.accessToken = token;
    if (token) {
      req.logger.debug(
        { accessToken: token },
        'getAccessToken: Found access token',
      );
    }
    next();
  }

  const accessTokenMiddleware = compose([
    asyncHandler(getAccessToken),
    passport.authenticate('access-token', { session: false }),
  ]);

  return { getAccessToken, accessTokenMiddleware };
};
