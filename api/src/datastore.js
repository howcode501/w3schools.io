// const fs = require("fs");
const { PrismaClient } = require('@prisma/client');
const redis = require('redis');
const retryStrategy = require('node-redis-retry-strategy');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

const SQLModels = require('./models');

// eslint-disable-next-line no-unused-vars
module.exports = async (config, logger, utilities) => {
  let _prisma = null;
  let _redis = null;
  let session_store = null;
  let sql_models = {};

  // Connect to database
  if (config.database) {
    const levels = ['trace', 'debug', 'info', 'warn', 'error'];
    const logemit = [
      { emit: 'event', level: 'query' }, // Don't use this unless you're just jonesing for some output!
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ];
    const log = logemit.slice(levels.indexOf(config.loglevel));

    _prisma = new PrismaClient({ log });

    _prisma.$on('query', (e) => {
      const {
        query, params, duration, target,
      } = e;
      logger.trace({ prisma: { params, duration, target } }, query);
    });
    _prisma.$on('info', (e) => {
      const { message, target } = e;
      logger.info({ prisma: { target } }, message);
    });
    _prisma.$on('warn', (e) => {
      const { message, target } = e;
      logger.info({ prisma: { target } }, message);
    });
    _prisma.$on('error', (e) => {
      const { message, target } = e;
      logger.info({ prisma: { target } }, message);
    });

    // configure session-store when enabled
    logger.warn('Session Storeage should start up right here.');
    if (config.session_store) {
      session_store = new PrismaSessionStore(_prisma, {
        checkPeriod: 30000,
        sessionModelName: 'WebSession',
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      });

      // logger.warn({ session_store }, 'Session Storeage is enabled');
    }
  } else {
    logger.warn('No SQL connection parameters provided');
  }

  // Connect to redis
  if (config.redis) {
    try {
      _redis = redis.createClient({
        socket: { host: config.redis.host, port: config.redis.port },
        password: config.redis.password,
        retry_strategy: retryStrategy({
          allow_to_start_without_connection: false,
          number_of_retry_attempts: 10,
          delay_of_retry_attempts: 10000,
          wait_time: 600000,
        }),
      });

      _redis.on('connect', () => {
        logger.warn('Yo man, Redis connected!');
      });
      _redis.on('end', () => {
        logger.warn('redis connection has closed');
      });
      _redis.on('reconnecting', (o) => {
        logger.warn({ o }, 'redis client reconnecting');
      });
      _redis.on('error', (error) => {
        logger.warn({ error }, 'redis connection was lost');
      });

      // TODO Redis Retry strategy //
      await _redis.connect();
      logger.info(`Is redis connected? ${await _redis.ping()}`);
    } catch (e) {
      logger.error('Could not connect to Redis');
      logger.error(e);
    }
  } else {
    logger.warn('No Redis connection parameters provided');
  }

  // Load SQL Models and Queries
  if (_prisma) {
    sql_models = await SQLModels(_prisma, config, logger, utilities);
  } else {
    logger.warn('Could not load SQL Models');
  }

  logger.debug('Datastores initialized');
  return {
    _prisma, _redis, session_store, ...sql_models,
  };
};
