import { WebSocket } from 'ws';
import { registerUser } from '../db/userStore.js';
import { sessions } from '../db/inMemoryDb';

export function handleRegistration(ws: WebSocket, message: any) {
  const { name, password } = message.data;

  const { user, errorText } = registerUser(name, password);

  let payload;

  if (errorText) {
    payload = {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: null,
        error: true,
        errorText,
      }),
      id: 0,
    };
  } else if (user) {
    sessions.set(user.index, {
      name: user.name,
      index: user.index,
      socket: ws,
    });

    payload = {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: user.index,
        error: false,
        errorText: '',
      }),
      id: 0,
    };
  } else {
    payload = {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: null,
        error: true,
        errorText: 'Unknown error occurred.',
      }),
      id: 0,
    };
  }

  console.log('Sending to frontend:', payload);
  ws.send(JSON.stringify(payload));
}

