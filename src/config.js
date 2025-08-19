require('dotenv').config(); // optional, if using a .env file

module.exports = {
    logLevel: process.env.LOG_LEVEL || 'debug',
    websocketPort: parseInt(process.env.WEBSOCKET_PORT || 3000, 10),
    websocketPingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL || 30000, 10),
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: parseInt(process.env.REDIS_PORT || 6379, 10),
    redisDb: parseInt(process.env.REDIS_DB || 0, 10),
    redisPrefix: process.env.REDIS_PREFIX || 'fastsock',
    remoteUrl: process.env.REMOTE_URL || null,
    remoteHeaders: process.env.REMOTE_HEADERS ? JSON.parse(process.env.REMOTE_HEADERS) : {},
};
