const http = require('http');
const app = require('./app');
const { setupWebSocket } = require('./websocket/server');
const { PORT } = require('./config/env');

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
setupWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

