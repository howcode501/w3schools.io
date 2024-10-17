const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers, validations) => {
  const { authProfile_changePassword } = app.get("datastore");
  const router = express.Router();
  const config = app.get("configuration");
  const notify = app.get("notify");
  const { confirmUserAndGenerateToken } = await require("../auth/helpers")(app);
  const {
    sortslice,
    onlyAdministrator,
    anyUser,
    canCreateUsers,
    canReadUsers,
    canUpdateUsers,
    canDeleteUsers,
  } = helpers;

  const {
    user_where,
    user_findUnique,
    user_setroles,
    user_setsubscriptions,
    user_setproducts,
    user_upsert,
    user_deleteHard,
    user_getList,
    user_getSmallList,
    user_normalize,
    auditLog_insert,
    user_validateUser,
    role_getList,
    subscription_getList,
    product_getList,
  } = app.get("datastore");

  const { user_validateSchema, password_validateSchema } = validations;

  function parse_body(body) {
    const data = { profile: {}, auth: {} };
    if (body?.email) {
      data.profile.email = body.email;
      data.profile.email_validated = true;
    }
    if (body?.first_name) {
      data.profile.first_name = body.first_name;
    }
    if (body?.last_name) {
      data.profile.last_name = body.last_name;
    }
    if (body?.avatar) {
      data.profile.avatar = body.avatar;
    }
    if (body?.password) {
      data.auth.password = body.password;
      data.auth.method = 1;
    }
    if (body?.auth_method) {
      data.auth.method = body.auth_method;
    }
    if (body?.enabled === true || body?.enabled === false) {
      data.auth.enabled = body.enabled;
    }
    if (body?.username || body?.name || body?.email) {
      data.name = // eslint-disable-next-line no-nested-ternary
        (body?.username ? body.username : body?.name ? body.name : body.email)
          .toString()
          .toLowerCase()
          .trim();
    }
    if (body?.user_icon_id) {
      data.user_icon_id = body?.user_icon_id;
    }
    if (body?.actions_api_token) {
      data.actions_api_token = body?.actions_api_token;
    }
    if (body?.search_string) {
      data.search_string = body.search_string;
    }

    if (body?.userSubscriptions) {
      data.userSubscriptions = body.userSubscriptions;
    }

    if (body?.userProducts) {
      data.userProducts = body.userProducts;
    }

    return data;
  }

  // Endpoints

  // Get User Profile Data
  router.get(
    "/profile",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/users/profile");

      const query = await user_where({ id: req.user.id });
      req.logger.debug({ query }, "Profile Query");

      const user_record = await user_findUnique(query);
      const user = await user_normalize(user_record);

      req.logger.debug(
        { user_record, user },
        "Grab User's Profile Information for Edit"
      );

      if (user) {
        res.json({ data: { user } });
      } else {
        res.status(400).json({ error: "no such user" });
      }
    })
  );

  // LIST
  router.get(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/users");

      const params = {};

      const msp_user = req.user.permissions.includes("role:msp");
      const admin_user = req.user.permissions.includes("role:administrator");

      req.logger.info({ msp_user, admin_user }, "Roles");

      if (msp_user) {
        // Don't do anything, they should be able to get all records
        params.role = "msp";
      }

      if (admin_user) {
        params.role = "user";
      }

      const users = await user_getList(params);

      const total = users.length;
      const filtered = sortslice(users, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // Get All User Options for Edit and New Forms
  router.get(
    "/options",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/users/options");
      const dataReturn = {};
      const params = {};

      const admin_user = req.user.permissions.includes("role:administrator");

      if (admin_user) {
        params.role = "administrator";
      }

      // Get Roles
      const roles = await role_getList(params);

      // Get Subscriptions
      const subscriptions = await subscription_getList({});

      // Get Products (App, Features)
      const products = await product_getList({});

      dataReturn.roles = roles;
      dataReturn.subscriptions = subscriptions;
      dataReturn.products = products;

      res.json({ data: dataReturn });
    })
  );

  // Validate username for new account
  router.post(
    "/user-validate",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /api/users/username-validate");

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, "Parsed Body");
      const user = await user_validateUser(q);
      req.logger.debug({ user }, "User's returned");

      if (user.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    })
  );

  // SEARCH Users
  router.post(
    "/search",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /api/users/search");

      const params = parse_body(req.body.data);

      const msp_user = req.user.permissions.includes("role:msp");
      const admin_user = req.user.permissions.includes("role:administrator");

      req.logger.info({ msp_user, admin_user }, "Roles");

      if (msp_user) {
        // Don't do anything, they should be able to get all records
        params.role = "msp";
      }
      if (admin_user) {
        params.role = "administrator";
      }

      req.logger.debug({ params }, "Parsed Body");
      const users = await user_getSmallList(params);

      const total = users.length;
      const filtered = sortslice(users, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // READ
  router.get(
    "/:id",
    anyUser,
    canReadUsers,
    asyncHandler(async (req, res) => {
      req.logger.info("GET User Search");
      req.logger.info("GET /api/users/:id");

      const query = await user_where(req.params);
      const user_record = await user_findUnique(query);
      const user = await user_normalize(user_record);

      req.logger.debug(
        { user_record, user },
        "Grab User's Information for Edit"
      );

      if (user) {
        res.json({ data: { user } });
      } else {
        res.status(400).json({ error: "no such user" });
      }
    })
  );

  // CREATE
  router.put(
    "/",
    onlyAdministrator,
    canCreateUsers,
    user_validateSchema,
    asyncHandler(async (req, res) => {
      req.logger.info("PUT /api/users");

      // First we parse the incoming Data
      const data = parse_body(req.body.data);
      req.logger.info("user data", req.body.data);
      const { roles, sendMailchecked, userProducts, userSubscriptions } =
        req.body.data;

      // Now we create the record
      const rec = await user_upsert(data);

      // If there are no issues, then we move forward
      if (!rec.error) {
        // Assign user role
        if (roles) {
          await user_setroles({ roles, user: rec });
        }

        // Assign user subscriptions
        if (userSubscriptions) {
          await user_setsubscriptions({ userSubscriptions, user: rec });
        }

        // Assign user products
        if (userProducts) {
          await user_setproducts({ userProducts, user: rec });
        }

        const userReturn = await user_normalize(rec);
        if (userReturn) {
          // Send mail when checked //
          if (sendMailchecked) {
            try {
              const result = await confirmUserAndGenerateToken(data.name);
              await notify.send_welcome_mail({
                email: result.user.profile.email,
                firstName: result.user.profile.first_name,
                createPasswordLink: `${config.base_uri}/password/reset-password/${result.token.accessToken}`,
              });
            } catch (err) {
              req.logger.debug({ err }, "Error sending welcome mail");
              // Fail silently, we do not notify on errors!
              return res.status(200).json({});
            }
          }
          // AuditLog new user created
          auditLog_insert(
            { admin_user: req.user, data: { userName: rec.name } },
            "user-created"
          );
          return res.json({ data: { userReturn } });
        }
      } else {
        return res.status(400).json(rec);
      }
      // AuditLog if user create error
      auditLog_insert(
        {
          admin_user: req.user,
          data: { userName: rec.name, error: "unable to create" },
        },
        "user-create-error"
      );
      return res.status(400).json({ error: "unable to create" });
    })
  );

  // UPDATE
  router.post(
    "/:id",
    onlyAdministrator,
    canUpdateUsers,
    user_validateSchema,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/users/:id");

      const data = parse_body(req.body.data);
      data.id = req.body.id;
      req.logger.debug({ data }, "Parsed Data for User");
      const { roles, userProducts, userSubscriptions } = req.body.data;
      const rec = await user_upsert(data);
      if (roles) {
        await user_setroles({ roles, user: rec });
      }

      // Assign user subscriptions
      if (userSubscriptions) {
        await user_setsubscriptions({ userSubscriptions, user: rec });
      }

      // Assign user products
      if (userProducts) {
        await user_setproducts({ userProducts, user: rec });
      }
      const user = await user_normalize(rec);
      if (user) {
        // AuditLog user updated
        auditLog_insert(
          { admin_user: req.user, data: { userName: rec.name } },
          "user-updated"
        );
        res.json({ data: { user } });
      } else {
        // AuditLog user updated error
        auditLog_insert(
          {
            admin_user: req.user,
            data: { userName: rec.name, error: "unable to update" },
          },
          "user-update-error"
        );
        res.status(400).json({ error: "unable to update" });
      }
    })
  );

  // DELETE
  router.delete(
    "/:id",
    onlyAdministrator,
    canDeleteUsers,
    asyncHandler(async (req, res) => {
      req.logger.info("DELETE /api/users/:id");

      const query = user_where(req.params);
      const user_record = await user_findUnique(query);
      const recs = await user_normalize(user_record);
      const rec = await user_deleteHard(recs);

      // AuditLog new user created
      auditLog_insert(
        { admin_user: req.user, data: { userName: rec.name } },
        "user-deleted"
      );

      res.json({ data: { rec } });
    })
  );

  // Change Password
  router.patch(
    "/change-password",
    password_validateSchema,
    async (req, res) => {
      // Extract data from POST body
      const password = req.body?.password;
      const confirmPassword = req.body?.passwordVerify;
      // Check if insufficient data
      if (!password || !confirmPassword) {
        return res.status(400).json({ error: "No Password Provided" }).send();
      }
      // Check if both values are equal
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ error: "Password does not match" })
          .send();
      }

      // Extracting unique name
      const users = await user_findUnique({ id: req.user.id });

      // Restricting SSO user for changing password
      if (users.auth.method === "SSO") {
        return res
          .status(400)
          .json({
            message:
              "User with SSO login method are not allowed to change password!",
          })
          .send();
      }
      // Update password
      const user = await authProfile_changePassword(users, password);
      if (user) {
        // AuditLog user password updated
        auditLog_insert(
          { admin_user: req.user, data: { userName: user.name } },
          "user-password-updated"
        );
        return res
          .status(200)
          .json({ message: "Password Updated Successfully" })
          .send();
      }
      // AuditLog user password update error
      auditLog_insert(
        {
          admin_user: req.user,
          data: { userName: user.name, error: "Password Updation Failed" },
        },
        "user-password-update-error"
      );
      return res
        .status(400)
        .json({ message: "Password Updation Failed" })
        .send();
    }
  );
  return router;
};
