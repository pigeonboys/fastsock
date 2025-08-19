const { publisher, subscriber } = require('./redis');
const { WebSocketServer } = require('ws');
const axios = require('axios');
const config = require('./config');
const logger = require('./logger');

const clients = new Map();

function onMessage(pattern, channel, message) {
    const parts = channel.split(':');
    const clientId = parts[parts.length - 1];
    const client = clients.get(clientId);

    if (client && client.readyState === client.OPEN) {
        client.send(message);
        logger.info(`Message sent to client`, { client_id: client.id, data: message.toString() });
    }
}

function startWebSocketServer() {
    subscriber.psubscribe(config.redisPrefix + ':client:*');
    subscriber.on('pmessage', onMessage);

    const server = new WebSocketServer({ port: config.websocketPort });
    logger.info(`WebSocket server running on ws://0.0.0.0:${config.websocketPort}`);

    server.on('connection', (client, request) => {
        const params = new URLSearchParams(request.url.replace('/', ''));
        const token = params.get('token');

        client.id = token;
        client.isAlive = true;
        clients.set(client.id, client);

        logger.info(`Client connected`, { client_id: client.id });
        publisher.hset(config.redisPrefix + ':clients', client.id, Date.now());

        client.on('message', async (msg) => {
            publisher.hset(config.redisPrefix + ':clients', client.id, Date.now());

            if (!config.remoteUrl) {
                logger.warn('Message forwarding skipped: no REMOTE_URL set', { client_id: client.id, data: msg.toString() });
                return;
            }

            try {
                await axios.post(config.remoteUrl, { client_id: client.id, data: msg.toString() }, { headers: config.remoteHeaders });
                logger.info('Forwarded message to remote', { client_id: client.id, data: msg.toString() });
            } catch (err) {
                logger.error('Failed to forward message to remote', { client_id: client.id, data: msg.toString(), error: err.message });
            }
        });

        client.on('pong', () => {
            client.isAlive = true;
            logger.debug(`Pong from client`, { client_id: client.id });
        });

        client.on('close', () => {
            logger.info(`Client disconnected`, { client_id: client.id });
            clients.delete(client.id);
            publisher.hdel(config.redisPrefix + ':clients', client.id);
        });
    });

    const interval = setInterval(() => {
        server.clients.forEach((client) => {
            if (!client.isAlive) {
                logger.info(`Client timeouted`, { client_id: client.id });
                return client.terminate();
            }
            client.isAlive = false;
            client.ping();
        });
    }, config.websocketPingInterval);

    server.on('close', () => clearInterval(interval));

    return server;
}

module.exports = startWebSocketServer;
