const express = require('express');
const asyncHandler = require('express-async-handler');

module.exports = async (app, helpers) => {
  const router = express.Router();

  const { onlyAdministrator } = helpers;

  const {
    app_validateAppName,
  } = app.get('datastore');

  function parse_body(body) {
    const data = { };
    if (body?.app_name) {
      data.app_name = body.app_name;
    }
    if (body?.app_id) {
      data.app_id = body.app_id;
    }
    if (body?.app_status === true || body?.app_status === false) {
      data.app_status = body.app_status;
    }
    if (body?.app_active_url) {
      data.app_active_url = body.app_active_url;
    }
    if (body?.app_inactive_url) {
      data.app_inactive_url = body.app_inactive_url;
    }
    if (body?.app_mailchimp_tag) {
      data.app_mailchimp_tag = body.app_mailchimp_tag;
    }
    if (body?.app_shopify_fulfill) {
      data.app_shopify_fulfill = body.app_shopify_fulfill;
    }
    if (body?.app_shopify_unfulfill) {
      data.app_shopify_unfulfill = body.app_shopify_unfulfill;
    }
    if (body?.search_string) {
      data.search_string = body.search_string;
    }

    return data;
  }

  // Endpoints
  // Validate apps name for new app
  router.post(
    '/app-validate',
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.debug('GET /api/apps/app-validate');

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, 'Parsed Body');
      const apps = await app_validateAppName(q);
      req.logger.debug({ apps }, "Apps's returned");

      if (apps.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    }),
  );

  return router;
};
