import { IncomingMessage } from '../models/Message';
import { users, sessions } from '../db/inMemoryDb';
import { generateId } from '../utils/id';
import WebSocket from 'ws';

export function handleRegistration(ws: WebSocket, message: IncomingMessage) {
  const { name, password } = message.data;

  if (!name || !password) {
    return ws.send(JSON.stringify({
      type: 'reg',
      data: {
        name,
        index: null,
        error: true,
        errorText: 'Missing name or password',
      },
      id: 0,
    }));
  }

  const existingUser = users.get(name);

  if (existingUser) {
    if (existingUser.password !== password) {
      return ws.send(JSON.stringify({
        type: 'reg',
        data: {
          name,
          index: null,
          error: true,
          errorText: 'Invalid password',
        },
        id: 0,
      }));
    }
  } else {
    users.set(name, { name, password });
  }

  const index = generateId();
  sessions.set(index, { name, index, socket: ws });

  ws.send(JSON.stringify({
    type: 'reg',
    data: {
      name,
      index,
      error: false,
      errorText: '',
    },
    id: 0,
  }));
}
