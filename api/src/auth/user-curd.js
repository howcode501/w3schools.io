const asyncHandler = require("express-async-handler");
const { compose } = require("compose-middleware");

module.exports = async (app, helpers) => {
  const {
    lookup_user,
    verify_google_recaptcha,
    user_validateUser,
    user_upsert,
    user_setroles,
    user_setsubscriptions,
    user_setproducts,
    promoCode_update,
    user_prepareSubscriptions,
    user_prepareProducts,
  } = helpers;
  const config = app.get("configuration");

  const checkUsernameHandler = compose([
    asyncHandler(async (req, res) => {
      // extract credentials from POST body
      const username = req.body?.username || null;
      // getting site key from client side
      const recaptcha = req.body?.recaptcha || null;

      // if no username has been set, fail
      if (!username || username.length <= 3) {
        return res
          .status(200)
          .json({ error: "No Username Provided", data: false })
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

      // check if user exist in db //
      const user = await lookup_user({ name: username });
      req.logger.warn({ user }, "Check Username: User Returned");
      // Check to see if the user exists and is enabled
      if (
        user &&
        user.auth?.enabled &&
        user.auth.auth_method.name === "password"
      ) {
        // The user exists in the database, so allow them to move forward
        return res.json({
          username: user.name,
          method: user.auth?.auth_method.name,
          valid: user.auth?.enabled,
        });
        // eslint-disable-next-line no-else-return
      }

      // If the user exists, but is not enabled
      if (user && !user.auth?.enabled) {
        return res
          .status(401)
          .json({
            error:
              "We were unable to find an account matching the information you entered. Please try again!",
          })
          .send();
      }
      // throw invalid user error //
      return res
        .status(401)
        .json({
          error:
            "We were unable to find an account matching the information you entered. Please try again!",
        })
        .send();
    }),
  ]);

  const validateUseremailHandler = compose([
    asyncHandler(async (req, res) => {
      // extract credentials from POST body
      const email = req.body?.email || null;

      // if no email  has been set, fail
      if (!email || email.length <= 3) {
        return res
          .status(200)
          .json({ error: "No email Provided", data: false })
          .send();
      }

      const user = await user_validateUser({ name: email });
      req.logger.debug({ user }, "User's returned");

      if (user.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    }),
  ]);

  const createUser = compose([
    asyncHandler(async (req, res) => {
      // extract credentials from POST body
      const email = req.body?.email || null;
      const code = req.body?.code || null;
      const first_name = req.body?.first_name || null;
      const last_name = req.body?.last_name || null;
      const password = req.body?.password || null;

      // if no email  has been set, fail
      if (
        (!email || email.length <= 3) &&
        !code?.code &&
        !first_name &&
        !last_name &&
        !password
      ) {
        return res
          .status(401)
          .json({ error: "No required fields Provided", data: false })
          .send();
      }

      if (code?.user_id !== null && code?.user_id !== "") {
        return res
          .status(401)
          .json({ error: "Code already used", data: false })
          .send();
      }

      const user = await user_validateUser({ name: email });
      req.logger.debug({ user }, "User's returned");

      if (user.length > 0) {
        return res
          .status(401)
          .json({
            error:
              "A user with the same email already exists. Please choose another email.",
            data: false,
          })
          .send();
      }
      // Finally create user

      const userData = { profile: {}, auth: {} };
      userData.auth.enabled = true;

      const roles = "user";

      if (email) {
        userData.profile.email = email;
        userData.profile.email_validated = true;
        userData.name = email.toString().toLowerCase().trim();
      }
      if (first_name) {
        userData.profile.first_name = first_name;
      }
      if (last_name) {
        userData.profile.last_name = last_name;
      }
      if (password) {
        userData.auth.password = password;
        userData.auth.method = 1;
      }

      const rec = await user_upsert(userData);

      // If there are no issues, then we move forward
      if (!rec.error) {
        // Assign user role
        if (roles) {
          await user_setroles({ roles, user: rec });
        }

        // create user subscription
        if (code?.subscriptions.length > 0) {
          // find subscription plan
          const userSubscriptions = await user_prepareSubscriptions(code);

          if (userSubscriptions) {
            // Assign user subscriptions
            await user_setsubscriptions({ userSubscriptions, user: rec });
          }
        }
        const userProducts = await user_prepareProducts(code);
        // Assign user products
        if (userProducts) {
          await user_setproducts({ userProducts, user: rec });
        }

        // // Update code
        await promoCode_update(code?.id, {
          user_id: rec.id,
          user_email: rec.name,
          activated_details: "Account is activated by signup form using code",
        });

        return res.json({ data: { status: "success" } });
      } else {
        return res.status(400).json(rec);
      }
    }),
  ]);

  return { checkUsernameHandler, validateUseremailHandler, createUser };
};
