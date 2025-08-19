const { publisher, subscriber } = require('./redis');
const logger = require('./logger');

function setupGracefulShutdown({ server }) {
    let isShuttingDown = false;

    async function cleanup(exitCode) {
        if (isShuttingDown) return;
        isShuttingDown = true;

        logger.warn(`Shutdown initiated... Exit code: ${exitCode}`);

        try {
            if (server) {
                logger.warn('Closing WebSocket connections...');
                server.clients.forEach((client) => {
                    try {
                        client.terminate();
                    } catch (err) {
                        logger.error('Error closing WebSocket client:', err);
                    }
                });
            }

            try {
                logger.warn('Disconnecting Redis clients...');
                await publisher.quit();
                await subscriber.quit();
            } catch (err) {
                logger.error('Error disconnecting Redis clients:', err);
                try {
                    publisher.disconnect();
                    subscriber.disconnect();
                } catch {}
            }
        } catch (err) {
            logger.error('Error during shutdown:', err);
        }

        logger.warn('Shutdown complete.');
        setTimeout(() => process.exit(exitCode), 1000);
    }

    process.on('SIGINT', () => cleanup(0));
    process.on('SIGTERM', () => cleanup(0));

    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err);
        cleanup(1);
    });

    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled Rejection:', reason);
        cleanup(1);
    });

    return cleanup;
}

module.exports = setupGracefulShutdown;
