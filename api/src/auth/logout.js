const asyncHandler = require("express-async-handler");
const { compose } = require("compose-middleware");

// eslint-disable-next-line no-unused-vars
module.exports = async (app, _passport, _helpers) => {
  const config = app.get("configuration");
  const { refreshToken_delete } = app.get("datastore");

  const logoutHandler = compose([
    // eslint-disable-next-line no-unused-vars
    asyncHandler(async (req, res, _next) => {
      if (req.refreshToken) {
        await refreshToken_delete({ id: req.refreshToken });
        res.cookie(config.refreshToken_name, null, {
          expires: new Date(Date.now() - 1),
        });
      }
      req.logger.debug("/auth/logout");
      req.logout((err) => { if (err) { return next(err); } });
      res.json({ message: "logout" });
    }),
  ]);

  return { logoutHandler };
};
