const asyncHandler = require("express-async-handler");
const { compose } = require("compose-middleware");

// eslint-disable-next-line no-unused-vars
module.exports = async (app, _passport, _helpers) => {
  const {
    user_findUnique,
    variant_where,
    variant_findUniqueForGuac,
    variant_normalize,
    variant_checkUserExist,
  } = app.get("datastore");

  const config = app.get("configuration");

  const guacHelpers = await require("../api/helpers")(app);

  const openHandler = compose([
    asyncHandler(async (req, res, _next) => {
      /* const { refreshToken_getValid, user_normalize } = app.get("datastore");
      const { compute_access_token, lookup_user, get_access_token } = _helpers; */

      const urlVars = req.query;

      const user = await user_findUnique({ id: req.user?.id });
      // req.logger.info('Lookup User', {req, user});

      const query = await variant_where(req.params);
      const variant_record = await variant_findUniqueForGuac(query, req.group);
      const variant = await variant_normalize(variant_record);

      const redirectUrl = config.base_uri || config.frontend_url;

      if (!variant) {
        return res.redirect(`${redirectUrl}/invalid-access`);
      }

      const isUserAuthorized = await variant_checkUserExist(
        req.user.id,
        variant.id
      );

      if (!isUserAuthorized) {
        return res.redirect(`${redirectUrl}/invalid-access`);
      }

      // TODO -- if 'user' not authorized for 'variant', return error
      // TODO -- if 'user' authorized but ambigous, return error

      const guacUrl = await guacHelpers.getHyperstreamUrl(
        variant,
        user,
        urlVars
      );

      if (guacUrl) {
        res.redirect(guacUrl);
        // TODO  None of this code get's executed because if the cookie doesn't exist the getImplicitToken catches it.
      } else {
        const now = new Date();
        const time = now.getTime();
        const expireTime = time + 1000 * 36000;

        const cookieOptions = {
          expires: new Date(expireTime),
          httpOnly: true,
          overwrite: true,
        };

        // If the person was trying to open a direct link, write it into a cookie, and then re-direct them back to it once they login.
        res.cookie(
          "open-redirect",
          { vid: variant.id, gid: parseInt(req.group, (radix = 10)) },
          cookieOptions
        );

        return res.status(200).json({ error: "unauthorized" });
      }
    }),
  ]);

  return { openHandler };
};
