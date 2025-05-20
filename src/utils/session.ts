import { sessions } from '../db/inMemoryDb';
import WebSocket from 'ws';

export function getSessionBySocket(ws: WebSocket) {
  for (const session of sessions.values()) {
    if (session.socket === ws) {
      return session;
    }
  }
  return null;
}
