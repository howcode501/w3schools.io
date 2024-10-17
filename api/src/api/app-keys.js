const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { onlyMSP, sortslice } = helpers;
  const {
    apiKeys_getList,
    apiKeys_validateEmail,
    auditLog_insert,
    apiKeys_normalize,
    apiKeys_upsert,
    apiKeys_where,
    apiKeys_findUnique,
    apiKeys_deleteHard,
    systemConfig_getList,
  } = app.get("datastore");

  function parse_body(body) {
    const data = {};
    if (body?.email) {
      data.email = body.email.toString().toLowerCase().trim();
    }
    if (body?.key) {
      data.key = body.key;
    }
    if (body?.routes) {
      data.routes = body.routes;
    }
    if (body?.status === true || body?.status === false) {
      data.status = body.status;
    }
    return data;
  }

  // Get All User Options for Edit and New Forms
  router.get(
    "/options",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/app-keys/options");

      const dataReturn = {};

      dataReturn.systemConfig = await systemConfig_getList({});
      // static options
      dataReturn.options = [
        {
          id: 9000,
          name: "get-app-deviceid",
          value: true,
        },
        {
          id: 9001,
          name: "get-active-products",
          value: true,
        },
        {
          id: 9002,
          name: "getresetactionapiurl",
          value: true,
        },
        {
          id: 9003,
          name: "app-listening",
          value: true,
        },
        {
          id: 9004,
          name: "edit-app-details",
          value: true,
        },
        {
          id: 9005,
          name: "verify-user",
          value: true,
        },

        {
          id: 9006,
          name: "check-subscription",
          value: true,
        },
        {
          id: 9007,
          name: "send-password-reset-email",
          value: true,
        },
        {
          id: 9008,
          name: "books",
          value: true,
        },
      ];

      res.json({ data: dataReturn });
    })
  );

  // Validate email for new api key
  router.post(
    "/email-validate",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /api/app-keys/email-validate");

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, "Parsed Body");
      const apiKey = await apiKeys_validateEmail(q);
      req.logger.debug({ apiKey }, "API's returned");

      if (apiKey.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    })
  );

  // LIST
  router.get(
    "/",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/app-keys");
      const params = {};
      const apiKeys = await apiKeys_getList(params);

      const total = apiKeys.length;
      const filtered = sortslice(apiKeys, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // READ
  router.get(
    "/:id",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/app-keys/:id");

      const query = await apiKeys_where(req.params);
      const apiKey_record = await apiKeys_findUnique(query);
      const apiKey = await apiKeys_normalize(apiKey_record);

      req.logger.debug({ apiKey }, "Grab Api Key Information for Edit");

      if (apiKey) {
        res.json({ data: { apiKey } });
      } else {
        res.status(400).json({ error: "no such api key" });
      }
    })
  );

  // CREATE
  router.put(
    "/",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info("PUT /api/app-keys");

      // First we parse the incoming Data
      const data = parse_body(req.body.data);
      req.logger.info("api key data", req.body.data);

      // Now we create the record
      const rec = await apiKeys_upsert(data);

      // If there are no issues, then we move forward
      if (!rec.error) {
        const apiKeyReturn = await apiKeys_normalize(rec);
        if (apiKeyReturn) {
          // AuditLog new api key created
          auditLog_insert(
            { admin_user: req.user, data: { email: rec.email } },
            "api-key-created"
          );
          return res.json({ data: { apiKeyReturn } });
        }
      } else {
        return res.status(400).json(rec);
      }
      // AuditLog if api key create error
      auditLog_insert(
        {
          admin_user: req.user,
          data: { email: rec.email, error: "unable to create" },
        },
        "api-ey-create-error"
      );
      return res.status(400).json({ error: "unable to create" });
    })
  );

  // UPDATE
  router.post(
    "/:id",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/app-keys/:id");

      const data = parse_body(req.body.data);
      data.id = req.body.id;
      req.logger.debug({ data }, "Parsed Data for Api Key");
      const rec = await apiKeys_upsert(data);

      const apiKeyReturn = await apiKeys_normalize(rec);
      if (apiKeyReturn) {
        // AuditLog Api key updated
        auditLog_insert(
          { admin_user: req.user, data: { email: rec.email } },
          "api-key-updated"
        );
        res.json({ data: { apiKeyReturn } });
      } else {
        // AuditLog Api key updated error
        auditLog_insert(
          {
            admin_user: req.user,
            data: { email: rec.email, error: "unable to update" },
          },
          "api-key-update-error"
        );
        res.status(400).json({ error: "unable to update" });
      }
    })
  );

  // DELETE
  router.delete(
    "/:id",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info("DELETE /api/app-keys/:id");

      const query = apiKeys_where(req.params);
      const apiKey_record = await apiKeys_findUnique(query);
      const recs = await apiKeys_normalize(apiKey_record);
      const rec = await apiKeys_deleteHard(recs);

      // AuditLog new user created
      auditLog_insert(
        { admin_user: req.user, data: { email: rec.email } },
        "api-key-deleted"
      );

      res.json({ data: { rec } });
    })
  );

  return router;
};
