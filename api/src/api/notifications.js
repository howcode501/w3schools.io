const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { sortslice, onlyAdministrator } = helpers;
  const {
    notification_getList,
    notification_update,
    notification_batchUpdate,
  } = app.get("datastore");

  function parse_body(params) {
    const query = {};

    if (params.ids) {
      query.ids = params.ids;
    }

    return query;
  }

  // Endpoints

  // LIST
  router.get(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/notifications");
      const notifications = await notification_getList({
        user_id: req.user_id,
      });

      const total = notifications.length;
      const filtered = sortslice(notifications, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // LIST
  router.get(
    "/mark-archive/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/notifications/mark-archive");
      const notifications = await notification_update({ user_id: req.user_id });

      const total = notifications.length;
      const filtered = sortslice(notifications, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // LIST
  router.get(
    "/mark-read/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/notifications/mark-read");
      const notifications = await notification_update({ user_id: req.user_id });

      const total = notifications.length;
      const filtered = sortslice(notifications, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // Read All
  router.post(
    "/read-many",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/notifications/read-many", req.body);

      const { ids } = parse_body(req.body.data);

      req.logger.debug({ ids }, "Parsed Body");
      const notifications = await notification_batchUpdate(ids, {
        is_read: true,
      });

      const total = notifications.length;
      const filtered = sortslice(notifications, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  // Archive All
  router.post(
    "/archive-many",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/notifications/archive-many", req.body);

      const { ids } = parse_body(req.body.data);

      req.logger.debug({ ids }, "Parsed Body");
      const notifications = await notification_batchUpdate(ids, {
        is_archive: true,
      });

      const total = notifications.length;
      const filtered = sortslice(notifications, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  return router;
};
