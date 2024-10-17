const express = require('express');
const asyncHandler = require('express-async-handler');

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { anyUser } = helpers;
  const { about_getBuildInfo } = app.get('datastore');

  // Endpoints

  // LIST
  router.get(
    '/',
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info('GET /api/about');
      const buildInfo = await about_getBuildInfo();
      if (buildInfo) {
        res.json({ data: { buildInfo } });
      } else {
        res.status(200).json({ error: 'Unable to obtain all the build information' });
      }
    }),
  );
  return router;
};
