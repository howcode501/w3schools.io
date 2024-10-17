const Server = require('./server');

async function main() {
  const {
   app, config, logger, http,
  } = await Server();

  // ------ HTTP Listener ------
  const server = http.listen(config.port, () => {
    logger.info({ serverPort: config.port }, 'Server started');
  });

  // ------ Graceful Shutdown ------
  async function gracefulStop() {
    logger.error('Beginning Graceful Shutdown');

    logger.error('Stopping HTTP Listener...');
    server.close(() => {
      logger.error('Stopped HTTP Listener');
    });

    logger.error('Stop');
  }

  // ------ Exit Signals and Unhandled Errors ------
  const errorTypes = ['unhandledRejection', 'uncaughtException'];
  const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  // eslint-disable-next-line array-callback-return
  errorTypes.map((type) => {
    process.on(type, async (err) => {
      try {
        logger.error(err);
        await gracefulStop();
        process.exit(0);
      } catch (_) {
        process.exit(1);
      }
    });
  });

  // eslint-disable-next-line array-callback-return
  signalTraps.map((type) => {
    process.once(type, async () => {
      try {
        await gracefulStop();
      } finally {
        process.kill(process.pid, type);
      }
    });
  });
}

// run main
main()
  .then((text) => {
    if (text) {
      console.log(text); // eslint-disable-line no-console
    }
  })
  .catch((err) => {
    console.log('---------------------------------------'); // eslint-disable-line no-console
    console.log('    Exception while starting server!   '); // eslint-disable-line no-console
    console.log('---------------------------------------'); // eslint-disable-line no-console
    console.error(err); // eslint-disable-line no-console
    console.log('---------------------------------------'); // eslint-disable-line no-console
    console.log('            Server Failed.             '); // eslint-disable-line no-console
    console.log('---------------------------------------'); // eslint-disable-line no-console
  });
