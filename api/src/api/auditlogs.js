const express = require('express');
const asyncHandler = require('express-async-handler');

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { sortslice, onlyAdministrator } = helpers;
  const { auditLog_getList } = app.get('datastore');

  // Endpoints

  // LIST
  router.get(
    '/',
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info('GET /api/auditlogs');
      const audit_logs = await auditLog_getList();

      const total = audit_logs.length;
      const filtered = sortslice(audit_logs, req.query);

      res.set('X-Total-Count', total);
      res.json({ data: filtered });
    }),
  );
  return router;
};
