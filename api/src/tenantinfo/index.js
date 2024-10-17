const express = require("express");
const Passport = require("passport");

module.exports = async (app) => {
  const tenantInfoRouter = express.Router();
  const passport = new Passport.Passport();

  const { tenantInfoHandler, tenantInstanceNameHandler } =
    await require("./tenantinfo")(app, passport);

  // Call the Tenantinfo System
  tenantInfoRouter.get("/", tenantInfoHandler);
  tenantInfoRouter.get("/instanceName", tenantInstanceNameHandler);

  return { passport, tenantInfoRouter };
};
