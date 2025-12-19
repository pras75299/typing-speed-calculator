const WebSocket = require('ws');
const { verifyToken } = require('../utils/jwt');
const { handleWebSocketMessage } = require('../services/websocketService');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({
    server,
    path: '/ws',
  });

  wss.on('connection', (ws, req) => {
    // Authenticate via JWT token in query string
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        ws.close(1008, 'Invalid token');
        return;
      }

      ws.userId = decoded.userId;
      ws.username = decoded.username;

      ws.send(
        JSON.stringify({
          type: 'connected',
          data: { message: 'WebSocket connected' },
        })
      );

      console.log(`WebSocket client connected: ${ws.username} (${ws.userId})`);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1008, 'Invalid token');
      return;
    }

    // Handle messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        await handleWebSocketMessage(ws, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            data: { message: 'Invalid message format' },
          })
        );
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${ws.username || 'Unknown'}`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

module.exports = { setupWebSocket };

