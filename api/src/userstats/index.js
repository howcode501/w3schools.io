const express = require('express');
const Passport = require('passport');

module.exports = async (app) => {
  const userstatsLoggingRouter = express.Router();
  const passport = new Passport.Passport();

  const {userstatsLoggingHandler} = await require('./userstats_logger')(app, passport);

  // Call the userstats Logging System
  userstatsLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6/:v7/:v8', userstatsLoggingHandler);
  userstatsLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6/:v7', userstatsLoggingHandler);
  userstatsLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6', userstatsLoggingHandler);
  userstatsLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5', userstatsLoggingHandler);
  userstatsLoggingRouter.get('/:v1/:v2/:v3/:v4', userstatsLoggingHandler);
  userstatsLoggingRouter.get('/:v1/:v2/:v3', userstatsLoggingHandler);
  userstatsLoggingRouter.get('/:v1/:v2', userstatsLoggingHandler);
  userstatsLoggingRouter.get('/:v1', userstatsLoggingHandler);

  return {passport, userstatsLoggingRouter};
};
