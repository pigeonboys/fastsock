const setupGracefulShutdown = require('./shutdown');
const startWebSocketServer = require('./server');

const server = startWebSocketServer();
setupGracefulShutdown(server);
