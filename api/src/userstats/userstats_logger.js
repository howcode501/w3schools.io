const asyncHandler = require('express-async-handler');
const { compose } = require('compose-middleware');

// eslint-disable-next-line no-unused-vars
module.exports = async (app, _passport, _helpers) => {
  const logger = app.get('logger');
  const { HyperstreamEventLog } = app.get('datastore');

  const userstatsLoggingHandler = compose([
    asyncHandler(async (req, res, _next) => {
      logger.warn({ req }, 'UserStats Logger');

      await HyperstreamEventLog.create({
        data: {
          event_type: req.params?.v1,
          event_data1: req.params?.v2,
          event_data2: req.params?.v3,
          event_data3: req.params?.v4,
        },
      });

      return res.status(200).json({ data: 'true' });
    }),
  ]);

  return { userstatsLoggingHandler };
};
