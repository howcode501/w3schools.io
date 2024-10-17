const asyncHandler = require("express-async-handler");
const { compose } = require("compose-middleware");
const moment = require("moment");

module.exports = async (app, helpers) => {
  const { lookup_code, verify_google_recaptcha } = helpers;
  const config = app.get("configuration");

  const checkCodeHandler = compose([
    asyncHandler(async (req, res) => {
      // extract credentials from POST body
      const code = req.body?.code || null;
      // getting site key from client side
      const recaptcha = req.body?.recaptcha || null;

      // if no code has been set, fail
      if (!code) {
        return res
          .status(200)
          .json({ error: "No Activation Code Provided", data: false })
          .send();
      }

      // if no Recaptcha authorization code has been provided, we fail
      if (config.google_recaptcha && (!recaptcha || recaptcha.length <= 30)) {
        return res
          .status(200)
          .json({ error: "No Recaptcha Provided", data: false })
          .send();
      }

      // if defined, check google captcha, else pass them through without validation
      if (config.google_recaptcha) {
        const recaptcha_res = await verify_google_recaptcha(
          recaptcha,
          req.logger
        );
        req.logger.warn("recaptcha resp:", recaptcha_res);
        if (recaptcha_res?.success !== undefined && !recaptcha_res?.success) {
          // temporally bypass suspicious action detect
          return res
            .status(401)
            .json({
              error: recaptcha_res["error-codes"]
                ? recaptcha_res["error-codes"].toString()
                : "unknown-error",
            })
            .send();
        }
      }

      // check if ocde exist in db //
      const checkCode = await lookup_code({ code: code });
      req.logger.warn({ checkCode }, "Check code: Code Returned");
      // Check to see if the code exists and is active, Not expired

      if (checkCode) {
        if (checkCode?.status === true && checkCode?.user_id == null) {
          if (
            checkCode?.expire_date_time !== null &&
            checkCode?.expire_date_time !== ""
          ) {
            if (!moment().isBefore(checkCode?.expire_date_time)) {
              return res
                .status(401)
                .json({
                  error:
                    "An activation code matching the information you entered is expired or already used. Please try again!",
                })
                .send();
            }
          }
          res.json(checkCode);
        } else {
          return res
            .status(401)
            .json({
              error:
                "An activation code matching the information you entered is expired or already used. Please try again!",
            })
            .send();
        }
      }

      // throw invalid code error //
      return res
        .status(401)
        .json({
          error:
            "We were unable to find an activation code matching the information you entered. Please try again!",
        })
        .send();
    }),
  ]);

  return { checkCodeHandler };
};
