const express = require("express");
const asyncHandler = require("express-async-handler");
const moment = require("moment");

module.exports = async (app, helpers) => {
  const router = express.Router();
  // const config = app.get('configuration');

  const { onlyAdministrator, sortslice, anyUser } = helpers;

  const {
    promoCode_validateCodeName,
    promoCode_upsert,
    promoCode_normalize,
    promoCode_getList,
    promoCode_findUnique,
    promoCode_where,
    subscription_getList,
    product_getList,
    auditLog_insert,
    systemConfig_getList,
    app_getList,
    feature_getList,
    promoCode_deleteHard,
    user_getList,
    user_prepareSubscriptions,
    user_setsubscriptions,
    user_prepareProducts,
    user_setproducts,
    promoCode_update,
  } = app.get("datastore");

  function parse_body(body) {
    const data = {};
    if (body?.code) {
      data.code = body.code.toUpperCase();
    }
    if (body?.description) {
      data.description = body.description;
    }

    if (body?.expire_date_time) {
      data.expire_date_time = body.expire_date_time;
    }

    if (body?.status === true || body?.status === false) {
      data.status = body.status;
    }

    if (body?.products) {
      data.products = body.products;
    }

    if (body?.apps) {
      data.apps = body.apps;
    }

    if (body?.features) {
      data.features = body.features;
    }

    if (body?.subscriptions) {
      data.subscriptions = body.subscriptions;
    }

    if (body?.subscription_pricing_plan) {
      data.subscription_pricing_plan = body.subscription_pricing_plan;
    }

    if (body?.codes) {
      data.codes = body.codes;
    }

    if (body?.bulkCodes) {
      data.bulkCodes = body.bulkCodes;
    }

    if (body?.search_string) {
      data.search_string = body.search_string;
    }

    return data;
  }

  // Endpoints
  // Validate code name for new code
  router.post(
    "/code-validate",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /api/promo-codes/code-validate");

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, "Parsed Body");
      const code = await promoCode_validateCodeName(q);
      req.logger.debug({ code }, "Code's returned");

      if (code.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    })
  );

  // Get All promo codes Options for Edit and New Forms
  router.get(
    "/options",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/promo-codes/options");
      const dataReturn = {};

      // Get Products, Apps, Features List
      dataReturn.products = await product_getList({});

      dataReturn.subscriptions = await subscription_getList({});

      dataReturn.systemConfig = await systemConfig_getList({});

      res.json({ data: dataReturn });
    })
  );

  // Code activate user
  router.post(
    "/activate",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/promo-codes/activate");

      const code = req?.body?.data?.code;
      const user_id = req?.body?.data?.user_id;

      // if no code has been set, fail
      if (!code) {
        return res
          .status(200)
          .json({ error: "No Activation Code Provided", data: false })
          .send();
      }

      const checkCode = await promoCode_findUnique({ code });
      if (checkCode) {
        if (checkCode?.status === true && checkCode?.user_id == null) {
          if (
            checkCode?.expire_date_time !== null &&
            checkCode?.expire_date_time !== ""
          ) {
            if (!moment().isBefore(checkCode?.expire_date_time)) {
              return res
                .status(400)
                .json({
                  error:
                    "An activation code matching the information you entered is expired or already used. Please try again!",
                })
                .send();
            }
          }
          // Code all check completed // Process for activation

          const rec = await user_getList({ id: user_id });

          if (rec[0]) {
            // create user subscription
            if (checkCode?.subscriptions.length > 0) {
              // find subscription plan
              const userSubscriptions = await user_prepareSubscriptions(
                checkCode
              );

              if (userSubscriptions) {
                // Assign user subscriptions
                await user_setsubscriptions({
                  userSubscriptions,
                  user: rec[0],
                });
              }
            }
            const userProducts = await user_prepareProducts(checkCode);
            // Assign user products
            if (userProducts) {
              await user_setproducts({ userProducts, user: rec[0] });
            }

            // // Update code
            await promoCode_update(checkCode?.id, {
              user_id: rec[0].id,
              user_email: rec[0].name,
              activated_details:
                "Account is activated by user (application) using code",
            });
            res.json(checkCode);
          }
        } else {
          return res
            .status(400)
            .json({
              error:
                "An activation code matching the information you entered is expired or already used. Please try again!",
            })
            .send();
        }
      }

      // throw invalid code error //
      return res
        .status(400)
        .json({
          error:
            "We were unable to find an activation code matching the information you entered. Please try again!",
        })
        .send();
    })
  );

  // LIST
  router.get(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/promo-codes");
      const params = {};
      const promoCode = await promoCode_getList(params);

      const total = promoCode.length;
      const filtered = sortslice(promoCode, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // READ
  router.get(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/promo-codes/:id");

      const query = await promoCode_where(req.params);
      const promoCode_record = await promoCode_findUnique(query);
      const promoCode = await promoCode_normalize(promoCode_record);

      req.logger.debug(
        { promoCode_record, promoCode },
        "Grab promoCode's Information for Edit"
      );

      if (promoCode) {
        res.json({ data: { promoCode } });
      } else {
        res.status(400).json({ error: "no such promoCode" });
      }
    })
  );

  // CREATE
  router.put(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("PUT /api/promo-codes");

      // First we parse the incoming Data
      const data = parse_body(req.body.data);
      req.logger.info("promoCode data", req.body.data);

      // Now we create the record
      let rec;
      if (data?.bulkCodes === true) {
        for (let i = 0; i < data?.codes.length; i++) {
          const newData = {
            ...data,
            code: data?.codes[i],
          };
          rec = await promoCode_upsert(newData);

          // If there are no issues, then we move forward
          if (!rec.error) {
            // AuditLog new promoCode created
            auditLog_insert(
              { admin_user: req.user, data: { promoCodeName: rec.code } },
              "promoCode-created"
            );
          } else {
            // AuditLog if promoCode create error
            auditLog_insert(
              {
                admin_user: req.user,
                data: { promoCodeName: rec.code, error: "unable to create" },
              },
              "promoCode-create-error"
            );
          }
        }
        return res.json({ data: { data: true } });
      } else {
        rec = await promoCode_upsert(data);

        // If there are no issues, then we move forward
        if (!rec.error) {
          // AuditLog new promoCode created
          auditLog_insert(
            { admin_user: req.user, data: { promoCodeName: rec.code } },
            "promoCode-created"
          );
          const promoCodeReturn = await promoCode_normalize(rec);
          if (promoCodeReturn) {
            return res.json({ data: { promoCodeReturn } });
          }
        }

        // AuditLog if promoCode create error
        auditLog_insert(
          {
            admin_user: req.user,
            data: { promoCodeName: rec.code, error: "unable to create" },
          },
          "promoCode-create-error"
        );
      }

      return res.status(400).json({ error: "unable to create" });
    })
  );

  // UPDATE
  router.post(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/promo-codes/:id");

      const data = parse_body(req.body.data);

      data.id = req.params.id;
      req.logger.debug({ data }, "Parsed Data for promoCode");

      const rec = await promoCode_upsert(data);

      const promoCode = await promoCode_normalize(rec);
      if (promoCode) {
        // AuditLog promoCode updated
        auditLog_insert(
          { admin_user: req.user, data: { promoCodeName: rec.code } },
          "promoCode-updated"
        );
        res.json({ data: { promoCode } });
      } else {
        // AuditLog promoCode updated error
        auditLog_insert(
          {
            admin_user: req.user,
            data: { promoCodeName: rec.code, error: "unable to update" },
          },
          "promoCode-error"
        );
        res.status(400).json({ error: "unable to update" });
      }
    })
  );

  // Import Promo code
  router.put(
    "/import",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/promo-codes/import");

      const data = req?.body?.data;

      req.logger.debug({ data }, "data parsed csv");

      const responseData = {
        totalRows: data.length,
        totalInserted: 0,
        errorRows: [],
      };
      const errorRows = [];

      if (data && data.length > 0) {
        for (let i = 1; i < data.length; i++) {
          const csvRow = data[i];
          if (csvRow[0].trim() !== "") {
            const checkCodeExist = await promoCode_getList({
              code: csvRow[0].trim().toUpperCase(),
            });
            if (!checkCodeExist.length > 0) {
              try {
                const appsId = [];
                const featuresId = [];
                const subscriptionId = [];
                const subscriptionPlanId = [];

                // find apps
                if (csvRow[3] !== "") {
                  if (csvRow[3].indexOf(",") > -1) {
                    const appsArray = csvRow[3].spilt(",");

                    for (let j = 0; j < appsArray.length; j++) {
                      // find

                      const app = await app_getList({ app_name: appsArray[j] });

                      if (app.length > 0) {
                        appsId.push(app[0].id);
                      }
                    }
                  } else {
                    const app = await app_getList({ app_name: csvRow[3] });

                    if (app.length > 0) {
                      appsId.push({ id: app[0].id });
                    }
                  }
                }
                // find features
                if (csvRow[4] !== "") {
                  if (csvRow[4].indexOf(",") > -1) {
                    const featuresArray = csvRow[4].spilt(",");

                    for (let k = 0; k < featuresArray.length; k++) {
                      // find

                      const feature = await feature_getList({
                        feature_name: featuresArray[k],
                      });

                      if (feature.length > 0) {
                        featuresId.push(feature[0].id);
                      }
                    }
                  } else {
                    const feature = await feature_getList({
                      feature_name: csvRow[4],
                    });

                    if (feature.length > 0) {
                      featuresId.push({ id: feature[0].id });
                    }
                  }
                }
                // find subscription & plan id
                if (csvRow[5] !== "") {
                  const subscription = await subscription_getList({
                    subscription_name: csvRow[5],
                  });

                  if (subscription.length > 0) {
                    subscriptionId.push({ id: subscription[0].id });
                    // find subscription plan Id
                    if (subscription[0]?.subscription_pricing_plan) {
                      for (
                        let l = 0;
                        l < subscription[0].subscription_pricing_plan.length;
                        l++
                      ) {
                        const subscriptionPlan =
                          subscription[0]?.subscription_pricing_plan[l];

                        const planConcad =
                          subscriptionPlan?.time_option_date +
                          " " +
                          subscriptionPlan?.time_option_frequency;
                        if (csvRow[6] == planConcad) {
                          subscriptionPlanId.push({ id: subscriptionPlan.id });
                        }
                      }
                    }
                  }
                }

                if (
                  appsId.length > 0 ||
                  featuresId.length > 0 ||
                  subscriptionId.length > 0
                ) {
                  // proceed for insert
                  const insert = {
                    code: csvRow[0].trim().toUpperCase(),
                    description:
                      csvRow[1].trim() !== "" ? csvRow[1].trim() : "",
                    expire_date_time:
                      csvRow[2].trim() !== "" ? csvRow[1].trim() : "",
                    status: true,
                  };

                  if (
                    csvRow[7].trim().toLowerCase() == false ||
                    csvRow[7].trim().toLowerCase() == "false"
                  ) {
                    insert.status = false;
                  }

                  if (appsId.length > 0) {
                    insert.apps = appsId;
                  }

                  if (featuresId.length > 0) {
                    insert.features = featuresId;
                  }

                  if (
                    subscriptionId.length > 0 &&
                    subscriptionPlanId.length > 0
                  ) {
                    insert.subscriptions = subscriptionId;
                    insert.subscription_pricing_plan = subscriptionPlanId;
                  }

                  // insert data

                  const rec = await promoCode_upsert(insert);

                  if (rec) {
                    responseData.totalInserted = responseData.totalInserted + 1;
                  } else {
                    errorRows.push({
                      csvRow,
                      message: "Something went wrong",
                      id: i,
                    });
                  }
                }
              } catch (err) {
                errorRows.push({
                  csvRow,
                  message: err.message,
                  id: i,
                });
              }
            } else {
              // code already exist
              errorRows.push({
                csvRow,
                message: "Code is already exists",
                id: i,
              });
            }
          } else {
            // code is empty
            errorRows.push({ csvRow, message: "Code is empty", id: i });
          }
        }
        // responseData
        responseData.errorRows = errorRows;

        return res.status(200).json({ data: responseData });
      } else {
        return res.status(400).json({ error: "No Data in csv" });
      }
    })
  );

  // DELETE
  router.delete(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("DELETE /api/promo-codes/:id");

      const query = promoCode_where(req.params);
      const promoCode_record = await promoCode_findUnique(query);
      const recs = await promoCode_normalize(promoCode_record);
      const rec = await promoCode_deleteHard(recs);

      // AuditLog delete promo code
      auditLog_insert(
        { admin_user: req.user, data: { code: rec.code } },
        "promo-code-deleted"
      );

      res.json({ data: { rec } });
    })
  );

  return router;
};
