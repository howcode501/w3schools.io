// const { parentPort } = require("worker_threads");
const config = require("./config");
const Logger = require("./logger");
const Utilities = require("./utilities");
const Datastore = require("./datastore");
const Notify = require("./notify");

module.exports = async () => {
  const { logger, middlewareLogger } = Logger(config);
  const utilities = Utilities(config, logger);
  const datastore = await Datastore(config, logger, utilities);
  const notify = await Notify(config, logger, datastore, utilities);

  async function shutdown() {
    const { _prisma } = datastore;

    logger.info("Closing DB connections..");
    await _prisma.$disconnect();
  }

  // better stack trace formatting for observability platforms
  if (process.env.CONTAINERIZE_LOGS) {
    Error.prepareStackTrace = (err, stack) =>
      JSON.stringify({
        message: err.message,
        stack: stack.map((frame) => ({
          file: frame.getFileName(),
          column: frame.getColumnNumber(),
          line: frame.getLineNumber(),
          functionName: frame.getFunctionName(),
        })),
      });
  }

  return {
    config,
    shutdown,
    logger,
    middlewareLogger,
    utilities,
    datastore,
    notify,
    ...utilities,
    ...datastore,
    ...notify,
  };
};
