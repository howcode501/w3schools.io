const asyncHandler = require('express-async-handler');
const { compose } = require('compose-middleware');
// const axios = require('axios');
// const util = require('util');

module.exports = async (app, helpers) => {
  const { confirmUserAndGenerateToken, verifyTokenAndResetPassword } = helpers;
  const config = app.get('configuration');
  const notify = app.get('notify');

  const forgetPasswordHandler = compose([
    asyncHandler(async (req, res) => {
      // extract credentials from POST body
      const username = req.body?.username || null;
      // if no username has been set, fail
      if (!username || username.length <= 3) {
        // fail silently.  We do not notify them the account wasn't found!
        return res.status(200).json({});
      }

      // Make a request for a user with a given ID
      // Make sure we have at least 1
      // TODO Should not be sending to an IP here.
      try {
        const result = await confirmUserAndGenerateToken(username);

        notify.send_password_reset({
          email: result.user.profile.email,
          firstName: result.user.profile.first_name,
          resetLink: `${config.base_uri}/password/reset-password/${result.token.accessToken}`,
        });
        return res.status(200).json({});
      } catch (err) {
        // Fail silently, we do not notify on errors!
        return res.status(200).json({});
      }
    }),
  ]);

  const resetPasswordHandler = compose([
    asyncHandler(async (req, res) => {
      const { token } = req.params;
      // extract credentials from POST body
      const password = req.body?.password || null;

      // if no password has been provided, fail
      if (!password) {
        return res.status(400).json({ error: 'No Password Provided' }).send();
      }

      try {
        const user = await verifyTokenAndResetPassword(token, password, false);
        if (user.error) throw { error: user.error.message, code: user.error.code };
        return res
          .status(200)
          .json({ message: `${user.name}'s Password updated successfully!` });
      } catch (err) {
        if (err.error) return res.status(err.code).json(err).send();
        return res
          .status(401)
          .json({
            error: { message: 'Token is invalid or expired!', code: 401 },
          })
          .send();
      }
    }),
  ]);

  const resetPasswordVerifyHandler = compose([
    asyncHandler(async (req, res) => {
      const { token } = req.params;
      try {
        const user = await verifyTokenAndResetPassword(token, null, true);
        if (user.error) {
          return res
            .status(401)
            .json({ error: { message: user.error.message, code: 401 } })
            .send();
        }
        return res.status(200).json({ message: 'Token is valid!' });
      } catch (err) {
        if (err.error) {
          return res
            .status(401)
            .json({ error: { message: err.error, code: 401 } })
            .send();
        }
        return res
          .status(401)
          .json({
            error: { message: 'Token is invalid or expired!', code: 401 },
          })
          .send();
      }
    }),
  ]);

  return {
    forgetPasswordHandler,
    resetPasswordHandler,
    resetPasswordVerifyHandler,
  };
};
