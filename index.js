import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';

const HTTP_PORT = 8181;
const server = http.createServer((req, res) => {
  const __dirname = path.resolve(path.dirname(''));
  const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
  fs.readFile(file_path, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    try {
      const message = JSON.parse(msg.toString());
      console.log('Received:', message);
    } catch (err) {
      console.error('Invalid JSON:', msg);
    }
  });

  ws.on('close', () => console.log('Connection closed'));
});

server.listen(HTTP_PORT, () => {
  console.log(`Server running on http://localhost:${HTTP_PORT} for HTTP and ws://localhost:${HTTP_PORT} for WebSocket`);
});
