const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  // const config = app.get('configuration');

  const { onlyAdministrator, sortslice } = helpers;

  const {
    subscription_validateSubscriptionName,
    subscription_upsert,
    subscription_normalize,
    subscription_getList,
    subscription_findUnique,
    subscription_where,
    product_getList,
    auditLog_insert,
    subscription_deleteHard,
    userSubscription_getList,
  } = app.get("datastore");

  function parse_body(body) {
    const data = {};
    if (body?.subscription_name) {
      data.subscription_name = body.subscription_name;
    }
    if (body?.subscription_description) {
      data.subscription_description = body.subscription_description;
    }
    if (body?.mailchimp_tag) {
      data.mailchimp_tag = body.mailchimp_tag;
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

    if (body?.subscriptionPricingPlan) {
      data.subscriptionPricingPlan = body.subscriptionPricingPlan;
    }

    if (body?.subscription_icon_id) {
      data.subscription_icon_id = body?.subscription_icon_id;
    }

    if (body?.search_string) {
      data.search_string = body.search_string;
    }

    return data;
  }

  // Endpoints
  // Validate subscription name for new subscription
  router.post(
    "/subscription-validate",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /api/subscriptions/subscription-validate");

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, "Parsed Body");

      const subscription = await subscription_validateSubscriptionName(q);
      req.logger.debug({ subscription }, "Subsciption's returned");

      if (subscription.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    })
  );

  // Get All subscription Options for Edit and New Forms
  router.get(
    "/options",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/subscriptions/options");
      const dataReturn = {};

      // Get Products, Apps, Features List
      dataReturn.products = await product_getList({});

      res.json({ data: dataReturn });
    })
  );

  // LIST
  router.get(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/subscriptions");
      const params = {};
      const subscriptions = await subscription_getList(params);

      const total = subscriptions.length;
      const filtered = sortslice(subscriptions, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // READ
  router.get(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/subscriptions/:id");

      const query = await subscription_where(req.params);
      const subscription_record = await subscription_findUnique(query);
      const subscription = await subscription_normalize(subscription_record);

      req.logger.debug(
        { subscription_record, subscription },
        "Grab Subscription's Information for Edit"
      );

      if (subscription) {
        res.json({ data: { subscription } });
      } else {
        res.status(400).json({ error: "no such subscription" });
      }
    })
  );

  // CREATE
  router.put(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("PUT /api/subscriptions");

      // First we parse the incoming Data
      const data = parse_body(req.body.data);
      req.logger.info("subscription data", req.body.data);

      // Now we create the record
      const rec = await subscription_upsert(data);

      // If there are no issues, then we move forward
      if (!rec.error) {
        // AuditLog new subscription created
        auditLog_insert(
          {
            admin_user: req.user,
            data: { subscriptionName: rec.subscription_name },
          },
          "subscription-created"
        );
        const subscriptionReturn = await subscription_normalize(rec);
        if (subscriptionReturn) {
          return res.json({ data: { subscriptionReturn } });
        }
      }

      // AuditLog if subscription create error
      auditLog_insert(
        {
          admin_user: req.user,
          data: {
            subscriptionName: rec.subscription_name,
            error: "unable to create",
          },
        },
        "subscription-create-error"
      );
      return res.status(400).json({ error: "unable to create" });
    })
  );

  // UPDATE
  router.post(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/subscriptions/:id");

      const data = parse_body(req.body.data);

      data.id = req.params.id;
      req.logger.debug({ data }, "Parsed Data for Subscription");

      const rec = await subscription_upsert(data);

      const subscription = await subscription_normalize(rec);
      if (subscription) {
        // AuditLog subscription updated
        auditLog_insert(
          {
            admin_user: req.user,
            data: { subscriptionName: rec.subscription_name },
          },
          "subscription-updated"
        );
        res.json({ data: { subscription } });
      } else {
        // AuditLog subscription updated error
        auditLog_insert(
          {
            admin_user: req.user,
            data: {
              subscriptionName: rec.subscription_name,
              error: "unable to update",
            },
          },
          "user-subscription-error"
        );
        res.status(400).json({ error: "unable to update" });
      }
    })
  );

  // DELETE
  router.delete(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("DELETE /api/subscriptions/:id");

      // check if user has subscription
      const checkUserSubscription = await userSubscription_getList({
        subscription_id: req.params.id,
      });
      if (checkUserSubscription.length > 0) {
        res.status(400).json({
          error: "Unable to delete subscription as it in use by user.",
        });
      }
      const query = subscription_where(req.params);
      const subscription_record = await subscription_findUnique(query);
      const recs = await subscription_normalize(subscription_record);
      const rec = await subscription_deleteHard(recs);

      // AuditLog delete subscription
      auditLog_insert(
        { admin_user: req.user, data: { rec } },
        "subscription-deleted"
      );

      res.json({ data: { rec } });
    })
  );

  return router;
};
