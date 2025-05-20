import WebSocket from 'ws';

export interface PlayerSession {
  name: string;
  index: string;
  socket: WebSocket;
}
