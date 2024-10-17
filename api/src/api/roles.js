const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  const { role_getList } = app.get("datastore");
  const { sortslice, onlyAdministrator } = helpers;

  // Endpoints

  router.get(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/roles");

      const msp_user = res.user.roles.includes("msp");
      const q = msp_user ? {} : { hidden: false };
      const roles = await role_getList(q);

      const total = roles.length;
      const filtered = sortslice(roles, req.query);

      res.set("X-Total-Count", total);
      res.json({ data: filtered });
    })
  );

  return router;
};
