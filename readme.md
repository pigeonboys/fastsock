# Fastsock

Fastsock is a lightweight, high-performance WebSocket → Redis → HTTP bridge designed for real-time IoT and device messaging. It keeps track of active client connections, forwards messages between devices and a remote API, and ensures reliable message delivery via Redis pub/sub.

## Features

-   🔌 **WebSocket server** for devices or clients
-   📡 **Redis Pub/Sub** for distributed message delivery
-   🔄 **Automatic forwarding** of messages to a remote HTTP endpoint
-   ⏱ **Last seen tracking** with Redis `HSET`
-   💓 **Heartbeat / Ping-Pong** to detect dead connections
-   📜 **Detailed JSON logging** via Winston
-   ⚡ **24/7 runtime** optimized for low latency

## How It Works

1. Devices connect to **Fastsock** over WebSocket using a unique token.
2. Fastsock stores each device’s ID and last-seen timestamp in Redis.
3. Messages published to Redis channels (`<redis_prefix>:client:*`) are automatically routed to the corresponding connected WebSocket device.
4. Messages sent from WebSockets can be forwarded to a remote API via HTTP.
5. Idle or disconnected clients are cleaned up automatically after a timeout.

## Requirements

-   Node.js 20+
-   Redis 6+
-   npm

## Configuration

Fastsock is configured via environment variables:
| Variable | Default | Description |
| --- | --- | --- |
| `WEBSOCKET_PORT` | `3000` | WebSocket server port |
| `WEBSOCKET_PING_INTERVAL` | `30000` | Ping interval in milliseconds |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_DB` | `0` | Redis database |
| `REDIS_PREFIX` | `fastsock` | Redis prefix |
| `REMOTE_URL` | _(none)_ | Remote API endpoint to forward device messages |
| `REMOTE_HEADERS` | _(none)_ | JSON object of HTTP headers to include when forwarding |
| `LOG_LEVEL` | `debug` | Minimum log level for [Winston](https://github.com/winstonjs/winston) |

### Example

```bash
WEBSOCKET_PORT=3000
WEBSOCKET_PING_INTERVAL=30000
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PREFIX=fastsock
REMOTE_URL=https://example.com/api/v1/message
REMOTE_HEADERS='{"Authorization":"Bearer xxxxxx"}'
LOG_LEVEL=info
```

## Running

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker

```bash
docker build -t fastsock .
docker run -p 3000:3000 --env-file .env fastsock
```

## Redis Pub/Sub Format

-   Messages to clients are published to channels named `<redis_prefix>:client:<client_id>`
-   Fastsock listens to all channels matching `<redis_prefix>:client:*` and forwards messages to the corresponding connected WebSocket device.

## Logging

-   Logs are stored in `logs/fastsock.log` and also printed to the console.
-   Log level is configured via Winston (level: info by default).
-   Supports structured JSON logging for easy monitoring and analysis.

## TDB

-   Handle SIGINT and SIGTERM signals
-   Clean up WebSocket connections and Redis clients before exiting
