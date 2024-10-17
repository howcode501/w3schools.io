const express = require('express');
const asyncHandler = require('express-async-handler');

module.exports = async (app, helpers) => {
  const router = express.Router();

  const { onlyAdministrator } = helpers;

  const {
    feature_validateFeatureName,
  } = app.get('datastore');

  function parse_body(body) {
    const data = { };
    if (body?.feature_name) {
      data.feature_name = body.feature_name;
    }
    if (body?.feature_id) {
      data.feature_id = body.feature_id;
    }
    if (body?.feature_status === true || body?.feature_status === false) {
      data.feature_status = body.feature_status;
    }
    if (body?.feature_active_url) {
      data.feature_active_url = body.feature_active_url;
    }
    if (body?.feature_inactive_url) {
      data.feature_inactive_url = body.feature_inactive_url;
    }
    if (body?.feature_mailchimp_tag) {
      data.feature_mailchimp_tag = body.feature_mailchimp_tag;
    }
    if (body?.feature_shopify_fulfill) {
      data.feature_shopify_fulfill = body.feature_shopify_fulfill;
    }
    if (body?.feature_shopify_unfulfill) {
      data.feature_shopify_unfulfill = body.feature_shopify_unfulfill;
    }
    if (body?.search_string) {
      data.search_string = body.search_string;
    }

    return data;
  }

  // Endpoints
  // Validate features name for new feature
  router.post(
    '/feature-validate',
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.debug('GET /api/features/feature-validate');

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, 'Parsed Body');
      const features = await feature_validateFeatureName(q);
      req.logger.debug({ features }, "Feature's returned");

      if (features.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    }),
  );

  return router;
};
