const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { onlyAdministrator, onlyMSP, anyUser } = helpers;
  const {
    systemConfig_getList,
    systemConfig_update,
    auditLog_insert,
    product_getList,
    product_update,
  } = app.get("datastore");

  // Get All User Options for Edit and New Forms
  router.get(
    "/options",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/system-config/options");
      const dataReturn = {};

      dataReturn.systemConfig = await systemConfig_getList();

      dataReturn.products = await product_getList();

      res.json({ data: dataReturn });
    })
  );

  // Get All User Options for Edit and New Forms
  router.get(
    "/useroptions",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/system-config/useroptions");
      const dataReturn = {};

      dataReturn.systemConfig = await systemConfig_getList();

      res.json({ data: dataReturn });
    })
  );

  // Add OR update
  router.post(
    "/:id",
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/system-config/:id");

      const { newData, displayOrder } = req?.body;

      const systemConfig = await systemConfig_update(newData);

      // Update display order to product
      if (displayOrder) {
        let i = 0;
        displayOrder.forEach(async (row) => {
          i++;
          await product_update(row.id, { product_order: i });
        });
      }

      if (systemConfig) {
        // AuditLog user updated
        auditLog_insert(
          { admin_user: req.user, data: { systemConfig } },
          "system-config-updated"
        );
        res.json({ data: { systemConfig } });
      } else {
        // AuditLog system condif updated error
        auditLog_insert(
          {
            admin_user: req.user,
            data: { systemConfig, error: "unable to update" },
          },
          "system-config-update-error"
        );
        res.status(400).json({ error: "unable to update" });
      }
    })
  );

  return router;
};
