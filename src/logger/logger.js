const pino = require('pino');
const { NODE_ENV, LOG_LEVEL } = require('../config/env');

const isDev = NODE_ENV !== 'production';

const logger = pino({
  level: LOG_LEVEL || 'info',

  base: {
    service: 'chat-service',
    env: NODE_ENV,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

module.exports = logger;
