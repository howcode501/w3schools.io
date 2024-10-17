const express = require('express');
const Passport = require('passport');

module.exports = async (app, logger) => {
  const sessionLoggingRouter = express.Router();
  const passport = new Passport.Passport();

  const {sessionLoggingHandler} = await require('./session_logger')(app, logger, passport);

  // Call the session Logging System
  sessionLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6/:v7/:v8/:v9/:v10', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6/:v7/:v8/:v9', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6/:v7/:v8', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6/:v7', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5/:v6', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2/:v3/:v4/:v5', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2/:v3/:v4', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2/:v3', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1/:v2', sessionLoggingHandler);
  sessionLoggingRouter.get('/:v1', sessionLoggingHandler);

  return {passport, sessionLoggingRouter};
};
