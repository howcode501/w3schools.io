const express = require('express');
const Passport = require('passport');

module.exports = async (app) => {
  const openRouter = express.Router();
  const passport = new Passport.Passport();
  const authhelpers = await require('../auth/helpers')(app);
  const {getImplicitAccessToken} =
      await require('../auth/refresh-token')(app, passport, authhelpers);
  const {getAccessToken, accessTokenMiddleware} =
      await require('../auth/access-token')(app, passport, authhelpers);

  const {openHandler} = await require('./open')(app, passport, authhelpers);

  // Open App Directly

  openRouter.get('/:groupid/:id', getImplicitAccessToken, openHandler);

  return {passport, openRouter, accessTokenMiddleware};
};
