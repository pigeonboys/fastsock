const config = require('./config');
const logger = require('./logger');
const redis = require('ioredis');

const publisher = new redis({
    host: config.redisHost,
    port: config.redisPort,
    db: config.redisDb,
});

publisher.on('connect', () => logger.info('Connected to Redis as publisher'));
publisher.on('error', (err) => logger.error('Redis error for publisher', { error: err }));

const subscriber = new redis({
    host: config.redisHost,
    port: config.redisPort,
    db: config.redisDb,
});

subscriber.on('connect', () => logger.info('Connected to Redis as subscriber'));
subscriber.on('error', (err) => logger.error('Redis error for subscriber', { error: err }));

module.exports = { publisher, subscriber };
