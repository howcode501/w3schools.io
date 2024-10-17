const asyncHandler = require('express-async-handler');
const { compose } = require('compose-middleware');

// eslint-disable-next-line no-unused-vars
module.exports = async (app, _passport, _helpers) => {
  const logger = app.get('logger');
  const { GuacSessionLog } = app.get('datastore');

  const sessionLoggingHandler = compose([
    asyncHandler(async (req, res, _next) => {
      logger.warn({ req }, 'Session Logger');

      await GuacSessionLog.create({
        data: {
          session_id: req.params?.v1,
          username: req.params?.v2,
          nid: req.params?.v3,
          disposition: req.params?.v4,
          error_id: req.params?.v5,
          error_message: req.params?.v6,
          server_id: req.params?.v7,
          user_id: req.params?.v8,
        },
      });

      return res.status(200).json({ data: 'true' });
    }),
  ]);

  return { sessionLoggingHandler };
};
