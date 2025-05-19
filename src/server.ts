import WebSocket, { WebSocketServer } from 'ws';
import { handleMessage } from './handlers/messageRouter';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    try {
      const message = JSON.parse(msg.toString());
      console.log('Received:', message);
      handleMessage(ws, message);
    } catch (err) {
      console.error('Invalid JSON:', msg);
    }
  });

  ws.on('close', () => console.log('Connection closed'));
});

console.log('WebSocket server running on ws://localhost:3000');
