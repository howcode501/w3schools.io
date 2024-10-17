const bcrypt = require("bcrypt");

// const drupalHash = require('drupal-hash');

module.exports = async (models, config, logger, helpers) => {
  const {
    User,
    UserProfile,
    AuthProfile,
    Role,
    RoleOption,
    RefreshToken,
    OneTimeToken,
    UserProductAppFeature,
    UserSubscription,
    AuditLog,
  } = models;

  // Define the data to be returned
  const userDetailedDataReturn = {
    auth: {
      include: {
        auth_method: true,
      },
    },
    profile: true,
    roles: true,
    user_subscriptions: true,
    user_products_apps_features: true,
    payment_method: true,
    attachments: true,
  };

  const userNoDetailDataReturn = {
    auth: {
      include: {
        auth_method: true,
      },
    },
    profile: true,
    roles: true,
    user_subscriptions: true,
    user_products_apps_features: true,
    payment_method: true,
    attachments: true,
  };

  /**
   * Encrypt a cleartext password
   * @param {String} password           Cleartext password, or bcrypted password
   * @return {String}                   Return NULL if hashing fails, else return hashed password
   */
  async function encrypt(password) {
    let encrypted = null;
    try {
      if (bcrypt.getRounds(password) > 0) {
        encrypted = password;
      }
    } catch (ex) {
      if (password.slice(0, 3) === "$S$") {
        encrypted = password;
      } else {
        encrypted = await bcrypt.hash(password, 10);
      }
    }
    return encrypted;
  }

  // Construct a query object for user lookups
  // TODO Come back and account for Hidden and Disabled Users
  function user_where({
    id,
    user_id,
    name,
    user_name,
    username,
    actions_api_token,
    search_string,
  }) {
    const query = {};
    if (id || user_id) {
      query.id = id || user_id;
    }
    if (actions_api_token) {
      query.actions_api_token = actions_api_token;
    }
    if (name || user_name || username) {
      query.name = name || user_name || username;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique user profile based on query params
  async function userProfile_findUnique(params) {
    const manyUserProfile = UserProfile.findMany({
      where: params,
      include: {
        user: true,
      },
    });
    return manyUserProfile;
  }

  // Find a unique user based on query params
  async function user_findUnique(params) {
    const query = user_where(params);

    logger.warn({ query }, "user_findUnique");
    const userFound = await User.findUnique({
      where: { ...query },
      include: userDetailedDataReturn,
    });
    return userFound;
  }

  // Find a unique username based on query params, but return very little information for security
  async function user_validateUser(params) {
    const query = user_where(params);

    // If they are searching by username, let's add some wildcard features
    if (query.name) {
      const { name } = query;

      query.name = {
        equals: name,
        mode: "insensitive",
      };
    }
    logger.warn({ query }, "user_validateUsername");
    const userMany = User.findMany({
      where: query,
    });
    return userMany;
  }

  // Get list of users
  async function user_getList(params = {}) {
    const query = user_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    if (params.role === "administrator") {
      query.NOT = {
        roles: {
          some: {
            name: "msp",
          },
        },
      };
    }

    if (params.role === "user") {
      query.roles = {
        some: {
          name: "user",
        },
      };
    }

    const userMany = User.findMany({
      where: query,
      orderBy: {
        name: "asc",
      },
      include: userNoDetailDataReturn,
    });
    return userMany;
  }

  // Get Small List for SearchBoxes
  async function user_getSmallList(params) {
    // Build the Query
    let query = user_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't included deleted
      query.deleted = null;
    }

    // If they are searching by name, let's add some wildcard features
    if (query.search_string) {
      const { search_string } = query;

      query = {
        OR: [
          { name: { contains: search_string, mode: "insensitive" } },
          { id: { contains: search_string, mode: "insensitive" } },
          {
            profile: {
              OR: [
                {
                  first_name: {
                    contains: search_string,
                    mode: "insensitive",
                  },
                },
                {
                  last_name: { contains: search_string, mode: "insensitive" },
                },
                { email: { contains: search_string, mode: "insensitive" } },
              ],
            },
          },
        ],
      };
    }
    // Not show deleted ones //
    query.deleted = null;

    // Only allow enabled user for search
    query.auth = {
      enabled: true,
    };

    if (params.role === "administrator") {
      query.NOT = {
        roles: {
          some: {
            name: "msp",
          },
        },
      };
    }

    // Grab the data from the database and return it.
    const userMany = User.findMany({
      where: query,
      include: userNoDetailDataReturn,
    });
    return userMany;
  }

  async function user_update_connections(
    cmd,
    model,
    attr,
    names,
    { user, ...params }
  ) {
    logger.debug(
      {
        cmd,
        model,
        attr,
        names,
        user,
        params,
      },
      "user_update_connections"
    );
    if (!["set", "add", "remove", "purge"].includes(cmd)) {
      logger.warn({ cmd }, "user_update_connections: unknown cmd");
      return;
    }
    // canonicalize
    let items = null;
    let newnames;

    if (names) {
      newnames = typeof names === "string" ? [names] : names;
      items = await model.findMany({ where: { name: { in: newnames } } });
    }

    const u = user || (await user_findUnique(user_where(params)));

    if (!u || (cmd !== "purge" && !items)) {
      logger.warn(
        {
          cmd,
          model,
          names,
          user,
          params,
        },
        `user_update_connections: could not lookup user or ${attr}`
      );
    }

    // generate connect/disconnect sets
    const current = u[attr];
    let connect = [];
    let disconnect = [];
    switch (cmd) {
      case "purge":
        disconnect = current.map((a) => ({ id: a.id }));
        break;
      case "set":
        disconnect = current.reduce((acc, obj) => {
          if (!items.map((a) => a.id).includes(obj.id)) {
            acc.push({ id: obj.id });
          }
          return acc;
        }, []);
        connect = items?.map((a) => ({ id: a.id }));
        break;
      case "add":
        connect = items?.reduce((acc, obj) => {
          if (!current.map((a) => a.id).includes(obj.id)) {
            acc.push({ id: obj.id });
          }
          return acc;
        }, []);
        break;
      case "remove":
        disconnect = items?.reduce((acc, obj) => {
          if (current.map((a) => a.id).includes(obj.id)) {
            acc.push({ id: obj.id });
          }
          return acc;
        }, []);
        break;
      default:
        logger.warn(
          {
            cmd,
            model,
            names,
            user,
            params,
          },
          "user_update_connections: unreachable code"
        );
        break;
    }
    const update = { [attr]: { connect, disconnect } };
    await User.update({ where: { id: u.id }, data: update });
    // TODO - mark User as dirty, schedule a resync
    // TODO - mark `attr` as dirty, schedule a resync
    logger.debug(
      {
        cmd,
        model,
        attr,
        names,
        user,
        params,
      },
      "user_update_connections: done"
    );
  }

  async function user_purgeroles({ ...rest }) {
    return user_update_connections("purge", Role, "roles", null, rest);
  }

  async function user_setroles({ roles, ...rest }) {
    logger.debug({ roles }, "user_set Roles");
    return user_update_connections("set", Role, "roles", roles, rest);
  }

  async function user_addroles({ roles, ...rest }) {
    return user_update_connections("add", Role, "roles", roles, rest);
  }

  async function user_removeroles({ roles, ...rest }) {
    return user_update_connections("remove", Role, "roles", roles, rest);
  }

  async function user_setsubscriptions({ userSubscriptions, ...rest }) {
    const { user } = rest;
    const userSubscriptionsData = [];
    userSubscriptions.forEach(async (subscription) => {
      // delete if subscription is deleted
      if (subscription?.deleted) {
        await UserSubscription.delete({
          where: {
            id: subscription?.id,
          },
        });
      }
      // if (subscription?.id !== undefined && subscription?.id !== "") {
      //   // TODO
      // } else {
      userSubscriptionsData.push({
        activated_by: subscription.activated_by,
        auto_subscription: subscription.auto_subscription,
        stripe_current_period_end: subscription.stripe_current_period_end,
        user_id: user.id,
        subscription_id: subscription.subscription_id,
        subscription_plan_id: subscription.subscription_pricing_plan_id,
        stripe_plan_amount: subscription?.subscription_pricing_plan_price
          ? subscription?.subscription_pricing_plan_price.toString()
          : subscription?.stripe_plan_amount.toString(),
        subscription_name: subscription.subscription_name,
        time_option_date: subscription?.subscription_pricing_plan_time_option
          ? parseInt(
              subscription.subscription_pricing_plan_time_option.split("/")[0]
            )
          : subscription?.time_option_date,
        time_option_frequency:
          subscription?.subscription_pricing_plan_time_option
            ? subscription?.subscription_pricing_plan_time_option.split("/")[1]
            : subscription?.time_option_frequency,
      });
      //}
    });
    if (userSubscriptionsData.length > 0) {
      const subs = await UserSubscription.createMany({
        data: userSubscriptionsData,
      });
      return subs;
    } else {
      // delete existing subscription
    }

    return true;
  }

  async function user_setproducts({ userProducts, ...rest }) {
    const { user } = rest;
    const userProductsData = [];
    userProducts.forEach(async (userProduct) => {
      if (userProduct !== null) {
        const productObj = {
          user_id: user.id,
          product_id: userProduct?.product_id.includes("_product")
            ? parseInt(userProduct?.product_id.replace("_product", ""))
            : parseInt(userProduct?.product_id),
          activated_by: userProduct?.activated_by,
          data_type: userProduct?.data_type,
          status: true,
          visible_status:
            userProduct?.product_visible_status !== undefined &&
            userProduct?.product_visible_status !== ""
              ? userProduct?.product_visible_status
              : "Global",
        };
        // push
        if (userProduct?.id !== undefined && userProduct?.id !== "") {
          await UserProductAppFeature.update({
            where: {
              id: userProduct?.id,
            },
            data: productObj,
          });
        } else {
          userProductsData.push(productObj);
          await UserProductAppFeature.createMany({
            data: [productObj],
          });
        }

        // apps
        if (userProduct?.apps) {
          userProduct?.apps.forEach(async (app) => {
            if (app !== null) {
              const appObj = {
                user_id: user?.id,
                product_id: userProduct?.product_id.includes("_product")
                  ? parseInt(userProduct?.product_id.replace("_product", ""))
                  : parseInt(userProduct?.product_id),
                app_id: app?.app_id.includes("_app")
                  ? parseInt(app?.app_id.replace("_app", ""))
                  : parseInt(app?.app_id),
                activated_by: app?.app_activated_by,
                data_type: app?.data_type,
                status: app?.app_status ? app?.app_status : false,
                visible_status:
                  app?.app_visible_status !== undefined &&
                  app?.app_visible_status !== ""
                    ? app?.app_visible_status
                    : "Global",
                description: app?.app_description,
              };
              // push
              if (app?.id !== undefined && app?.id !== "") {
                await UserProductAppFeature.update({
                  where: {
                    id: app.id,
                  },
                  data: appObj,
                });
              } else {
                userProductsData.push(appObj);
                await UserProductAppFeature.createMany({
                  data: [appObj],
                });
              }
            }
          });
        }

        // features
        if (userProduct?.features) {
          userProduct?.features.forEach(async (feature) => {
            if (feature !== null) {
              const featureObj = {
                user_id: user?.id,
                product_id: userProduct?.product_id.includes("_product")
                  ? parseInt(userProduct?.product_id.replace("_product", ""))
                  : parseInt(userProduct?.product_id),
                feature_id: feature?.feature_id.includes("_feature")
                  ? parseInt(feature?.feature_id.replace("_feature", ""))
                  : parseInt(feature?.feature_id),
                activated_by: feature?.feature_activated_by,
                data_type: feature?.data_type,
                status: feature?.feature_status
                  ? feature?.feature_status
                  : false,
                visible_status:
                  feature?.feature_visible_status !== undefined &&
                  feature?.feature_visible_status !== ""
                    ? feature?.feature_visible_status
                    : "Global",
                description: feature?.feature_description,
              };

              // push
              if (feature?.id !== undefined && feature?.id !== "") {
                await UserProductAppFeature.update({
                  where: {
                    id: feature?.id,
                  },
                  data: featureObj,
                });
              } else {
                userProductsData.push(featureObj);
                await UserProductAppFeature.createMany({
                  data: [featureObj],
                });
              }
            }
          });
        }
      }
    });

    // if (userProductsData.length > 0) {
    //   const products = await UserProductAppFeature.createMany({
    //     data: userProductsData,
    //   });
    //   return products;
    // }

    return true;
  }

  async function user_upsert({
    name,
    user_icon_id,
    auth = {},
    actions_api_token,
    profile = {},
    deleted = null,
  }) {
    if (!name) logger.debug({ name }, "Upsert User");
    let user = await user_findUnique({ name });

    logger.debug({ auth }, "Users Auth Info");

    // Setup the user for Local Password Auth
    if (auth?.password) {
      // eslint-disable-next-line no-param-reassign
      auth.password = await encrypt(auth.password);
      // eslint-disable-next-line no-param-reassign
      auth.enabled = auth?.enabled;
      auth.profile = null;
    }

    // Password can be null while creating a new user
    // Should set auth method to password mode as default
    auth.method = auth.method ? auth.method : 1;

    if (user === null) {
      logger.debug({ name }, "No such user, creating..");

      // stripe create customer
      let stripe_customer_id = "";
      try {
        const customer = await helpers.stripe_createCustomer({
          email: profile.email,
          name: `${profile.first_name}  ${profile.last_name}`,
        });
        stripe_customer_id = customer.id;
      } catch (err) {
        logger.debug(
          { err },
          "Unable to create stripe customer in create user"
        );
      }

      actions_api_token = helpers.randomString();
      user = await User.create({
        data: {
          user_icon_id,
          actions_api_token,
          name: profile.email,
          profile: {
            create: { ...profile, stripe_customer_id },
          },
          auth: {
            create: {
              password: auth.password,
              enabled: auth.enabled,
              profile:
                auth.profile != null
                  ? {
                      connect: { id: auth.profile },
                    }
                  : undefined,
              auth_method: {
                // FIXME This is a temporary fix in order to allow local account creation,
                // this will need to be fixed in orderto handle SSO Accounts as well.
                // Balkishan Bush 9-1-2022
                connect: { id: parseInt(auth.method, 10) },
              },
            },
          },
        },
        include: userDetailedDataReturn,
      });
    } else {
      logger.debug({ name }, "User exists, updating..");
      logger.warn("User profile exists, updating..", { ...profile });
      // stripe update customer
      try {
        if (user.profile.stripe_customer_id) {
          await helpers.stripe_updateCustomer(user.profile.stripe_customer_id, {
            email: profile.email,
            name: `${profile.first_name}  ${profile.last_name}`,
          });
        }
      } catch (err) {
        logger.debug(
          { err },
          "Unable to update stripe customer in update user"
        );
      }
      user = await User.update({
        where: { id: user.id },
        data: {
          name,
          user_icon_id,
          actions_api_token,
          deleted,
          auth: {
            update: {
              id: auth.id,
              auth_method_id: auth.method,
              enabled: auth.enabled,
              password: auth.password,
            },
          },
          profile: {
            update: {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email,
              email_validated: profile.email_validated,
              avatar: profile.avatar,
            },
          },
        },
        include: userDetailedDataReturn,
      });
    }

    logger.debug({ user }, "User Upserted");
    return user;
  }

  async function role_compute_account_permissions(role_names) {
    // initialize all account permissions values
    const role_options = await RoleOption.findMany({
      where: { enabled: true },
      select: { name: true },
    });
    const permissions =
      role_options
        ?.map((r) => r.name)
        .reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {}) || {};

    // update permissions with grants from each role in role_names
    let new_role_names;
    if (role_names) {
      new_role_names =
        typeof role_names === "string" ? [role_names] : role_names;
      const roles = await Role.findMany({
        where: { name: { in: new_role_names } },
        include: { option_values: true },
      });
      roles.forEach((r) => {
        r.option_values.forEach((opt) => {
          if (opt.option?.name) {
            permissions[opt.option.name] = opt.value;
          }
        });
        // TODO -- hack -- remove once we have a good set of account permissions
        permissions[`role:${r.name}`] = true;
      });
      // TODO -- hack -- remove once we have a good set of account permissions
      permissions.console_access = true;
    }

    // reduce active permissions to array
    return Object.entries(permissions).reduce((acc, obj) => {
      if (obj[1]) {
        acc.push(obj[0]);
      }
      return acc;
    }, []);
  }

  // Normalize user into a structure for transport over REST
  async function user_normalize(user) {
    if (!user) {
      return null;
    }

    logger.debug(user, "User Normalize Data In");

    const d = {};

    if (user.id) {
      d.id = user.id;
    }
    if (user.name) {
      d.username = user.name;
    }
    if (user.actions_api_token) {
      d.actions_api_token = user.actions_api_token;
    }

    // Profile
    if (user?.profile) {
      if (user?.profile?.stripe_customer_id) {
        d.stripe_customer_id = user.profile.stripe_customer_id;
      }
      if (user?.profile?.email) {
        d.email = user.profile.email;
      }
      if (user?.profile?.email_validated) {
        d.email_validated = user.profile.email_validated;
      }
      if (user?.profile?.first_name) {
        d.first_name = user.profile.first_name;
      }
      if (user?.profile?.last_name) {
        d.last_name = user.profile.last_name;
      }
      if (user?.profile?.id) {
        d.profile_id = user.profile.id;
      }
      if (d?.first_name && d?.last_name) {
        d.full_name = `${d.first_name} ${d.last_name || ""}`;
      }
    }

    // user
    if (user?.auth) {
      d.auth = user.auth;
    }
    if (user?.user_subscriptions) {
      d.userSubscriptions = user.user_subscriptions;
    }
    if (user?.user_products_apps_features) {
      d.userProducts = user.user_products_apps_features;
    }
    if (user?.attachments) {
      d.attachments = user.attachments;
    }

    // derive account_permission from union of roles;
    const role_names = user.roles?.map((r) => r.name);
    const permissions = await role_compute_account_permissions(role_names);

    d.roles = role_names;
    d.permissions = permissions;
    d.selected_roles = user.roles;

    return d;
  }

  function refreshToken_where({ id, token_id, user_id }) {
    const query = {};
    if (id || token_id) {
      query.id = id || token_id;
    }
    if (user_id) {
      query.user_id = user_id;
    }
    return query;
  }

  async function refreshToken_delete(params) {
    const query = refreshToken_where(params);

    logger.debug({ query }, "Lookup RefreshToken");
    const token = await RefreshToken.findUnique({ where: query });
    if (token) {
      await RefreshToken.delete({ where: query });
      logger.debug({ refreshtoken: token }, "RefreshToken deleted");
    }
    return token;
  }

  // Soft Delete a named user
  async function user_delete(params) {
    logger.debug({ ...params }, "Deleting User");
    const user = await user_findUnique(params);
    if (user) {
      logger.debug({ user }, "Found user..");

      // remove onetimetokens
      await OneTimeToken.deleteMany({
        where: {
          user_id: user.id,
        },
      });

      // remove tokens
      await refreshToken_delete({ user_id: user.id });

      // remove profile
      if (user.profile?.id) {
        // await UserProfile.delete({ where: { user_id: user.id } });
      }

      // remove auth
      if (user.auth?.id) {
        await AuthProfile.update({
          where: { user_id: user.id },
          data: { enabled: false },
        });
      }

      // finally, delete the user record
      // await User.delete({ where: { id: user.id } });

      await user_upsert({
        name: user.name,
        auth: {},
        profile: {},
        deleted: new Date(),
      });
    }

    logger.debug({ user }, "Delete complete");
    return user;
  }

  // Hard Delete a named user
  async function user_deleteHard(user) {
    logger.debug({ user }, "Found user..");
    // remove onetimetokens
    await OneTimeToken.deleteMany({
      where: {
        user_id: user.id,
      },
    });

    // remove tokens
    await refreshToken_delete({ user_id: user.id });

    // remove profile
    if (user.profile_id) {
      await UserProfile.delete({ where: { id: user.profile_id } });
    }

    if (user.auth?.id) {
      await AuthProfile.delete({ where: { user_id: user.id } });
    }

    if (user?.userSubscriptions) {
      await UserSubscription.deleteMany({ where: { user_id: user.id } });
    }

    if (user?.userProducts) {
      await UserProductAppFeature.deleteMany({ where: { user_id: user.id } });
    }
    // delete audit log
    await AuditLog.deleteMany({ where: { user_id: user.id } });

    // delete stripe customer
    try {
      if (user.stripe_customer_id) {
        await helpers.stripe_deleteCustomer(user.stripe_customer_id);
      }
    } catch (err) {
      logger.debug({ err }, "Unable to delete stripe customer in delete hard");
    }

    // delete user attachment
    if (user?.attachments) {
      // delete it from s3
      const path = user?.attachments?.public_url.replace(
        `${config.amazon.s3_bucket_base_url}/`,
        ""
      );
      await helpers.amazon_deleteImage(path);
      // delete if from our db
      await helpers.attachment_delete(user?.attachments?.id);
    }

    // delete user payment methods
    const userPaymentMethods = await helpers.userPaymentMethod_getList({
      user_id: user.id,
    });
    if (userPaymentMethods.length > 0) {
      for (const userPaymentMethod of userPaymentMethods) {
        // eslint-disable-next-line no-await-in-loop
        await helpers.userPaymentMethod_delete({
          id: userPaymentMethod.id,
        });
      }
    }

    // delete user app device id
    const userAppDeviceIds = await helpers.userAppDeviceId_getList({
      user_id: user.id,
    });
    if (userAppDeviceIds.length > 0) {
      for (const userAppDeviceId of userAppDeviceIds) {
        // eslint-disable-next-line no-await-in-loop
        await helpers.userAppDeviceId_deleteHard(userAppDeviceId);
      }
    }

    // finally, delete the user record
    await User.delete({ where: { id: user.id } });

    logger.debug({ user }, "Hard delete complete");

    return user;
  }

  async function oneTimeToken_invalid(params) {
    const tokens = await OneTimeToken.findMany({ where: params });
    if (Array.isArray(tokens) && tokens.length) {
      await Promise.all(
        tokens.map(async (token) => {
          await OneTimeToken.update({
            where: { id: token.id },
            data: {
              valid: false,
            },
          });
        })
      );
    }
  }

  // one time token check//
  async function oneTimeToken_check(params) {
    const tokens = await OneTimeToken.findMany({ where: params });
    if (Array.isArray(tokens) && tokens.length) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (tokens[0].valid_until < currentTimestamp) {
        return { error: "This link is expired!", code: 400 };
      }

      if (tokens[0].valid === false) {
        return {
          error: "This link is one time use only. This link is expired!",
          code: 400,
        };
      }
      return { success: "Token valid", code: 200 };
    }
    return { error: "Invalid Token", code: 400 };
  }

  // one time compute //
  async function oneTimeToken_compute({
    user_id,
    token,
    type = "PasswordReset",
  }) {
    const delay = config.jwt_onetime_token_expiration;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const validityTimestamp = currentTimestamp + delay;

    if (!user_id) {
      logger.warn({ user_id }, "compute_one_time_token: User undefined");
      return {};
    }

    // make invalid existing oneTimeToken for user
    await oneTimeToken_invalid({ user_id, type });

    // create new oneTimeToken
    const id = await OneTimeToken.create({
      data: {
        user_id,
        valid_until: validityTimestamp,
        token,
      },
    });

    if (!id) {
      logger.warn(
        { user_id },
        "compute_one_time_token: Token creation problem"
      );
      return {};
    }

    return { token, delay, validityTimestamp };
  }

  // Authenticate user
  function user_authenticate(user, cleartext) {
    if (user.auth.password.slice(0, 3) === "$S$") {
      // TODO - mark user as needing password update
    } else if (!bcrypt.compareSync(cleartext, user.auth.password)) {
      logger.warn(
        { username: user.name },
        "user_authenticate: invalid credential (bcrypt)"
      );
      return false;
    }
    return true;
  }

  // -- refresh tokens --

  async function refreshToken_compute({ user_id, rememberMe = false }) {
    const delay = rememberMe
      ? config.refreshToken_remember_expiration
      : config.refreshToken_expiration;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const validityTimestamp = currentTimestamp + delay;

    if (!user_id) {
      logger.warn(
        { user_id, rememberMe },
        "compute_refresh_token: User undefined"
      );
      return {};
    }

    // delete existing refreshToken for user
    await refreshToken_delete({ user_id });

    // create new refreshToken
    const token = await RefreshToken.create({
      data: {
        user_id,
        valid_until: validityTimestamp,
        remember_me: rememberMe,
      },
    });

    if (!token) {
      logger.warn(
        { user_id, rememberMe },
        "compute_refresh_token: Token creation problem"
      );
      return {};
    }

    return { token, delay, validityTimestamp };
  }

  async function refreshToken_getValid(params) {
    const query = refreshToken_where(params);

    const currentTimestamp = Math.floor(Date.now() / 1000);
    let token = null;
    if (query) {
      // TODO - how to handle login from multiple browsers concurrently
      token = await RefreshToken.findUnique({ where: query });
      if (token?.valid_until < currentTimestamp) {
        await refreshToken_delete(query);
        token = null;
      }
    }
    return token;
  }

  async function authProfile_changePassword(userDetails, password) {
    const updatedUser = await user_upsert({
      name: userDetails.name,
      auth: {
        password,
      },
    });
    return updatedUser;
  }

  async function user_prepareSubscriptions(code) {
    const userSubscriptions = [];
    // find subscription plan
    const subscriptionPlanIndex = code?.subscription_pricing_plan.findIndex(
      (p) => p.subscription_id == code?.subscriptions[0].id
    );
    userSubscriptions.push({
      subscription_id: code?.subscriptions[0].id,
      subscription_name: code?.subscriptions[0].subscription_name,
      subscription_pricing_plan_id:
        code?.subscription_pricing_plan[subscriptionPlanIndex].id,
      subscription_pricing_plan_price:
        code?.subscription_pricing_plan[subscriptionPlanIndex].price,
      subscription_pricing_plan_time_option:
        code?.subscription_pricing_plan[subscriptionPlanIndex]
          .time_option_date +
        "/" +
        code?.subscription_pricing_plan[subscriptionPlanIndex]
          .time_option_frequency,
      activated_by: "Code",
      auto_subscription: false,
      stripe_current_period_end: "1997-07-16T19:20:30.451Z",
    });

    return userSubscriptions;
  }

  async function user_prepareProducts(code) {
    const userProducts = [];

    if (code?.products) {
      code?.products.forEach(async (product) => {
        // find apps and features index
        const apps = [];
        const features = [];
        code?.apps.forEach(async (app) => {
          if (app.product_id === product.id) {
            apps.push({
              data_type: "app",
              activated_by: "Code",
              app_activated_by: "Code",
              app_id: app?.id + "_app",
              app_status: true,
              app_activated_date_time: new Date(),
            });
          }
        });

        code?.features.forEach(async (feature) => {
          if (feature.product_id === product.id) {
            features.push({
              data_type: "feature",
              activated_by: "Code",
              feature_activated_by: "Code",
              feature_id: feature?.id + "_feature",
              feature_status: true,
              feature_activated_date_time: new Date(),
            });
          }
        });

        userProducts.push({
          data_type: "product",
          product_id: product?.id + "_product",
          activated_by: "code",
          apps,
          features,
        });
      });

      return userProducts;
    }
  }

  async function user_update(id, params) {
    const user = await User.update({
      where: { id },
      data: { ...params },
    });

    return user;
  }

  return {
    user_where,
    user_findUnique,
    user_getList,
    user_getSmallList,
    user_upsert,
    user_delete,
    user_deleteHard,
    user_purgeroles,
    user_setroles,
    user_addroles,
    user_removeroles,
    user_normalize,
    user_authenticate,
    refreshToken_where,
    refreshToken_delete,
    refreshToken_compute,
    refreshToken_getValid,
    oneTimeToken_compute,
    oneTimeToken_invalid,
    oneTimeToken_check,
    userProfile_findUnique,
    user_validateUser,
    authProfile_changePassword,
    user_setsubscriptions,
    user_setproducts,
    user_prepareSubscriptions,
    user_prepareProducts,
    user_update,
  };
};
