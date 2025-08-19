const config = require('./config');
const winston = require('winston');

const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'logs/fastsock.log' })],
});

module.exports = logger;
