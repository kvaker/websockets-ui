import { WebSocket } from 'ws';
import { registerUser } from '../db/userStore.js';
import { sessions } from '../db/inMemoryDb';

export function handleRegistration(ws: WebSocket, message: any) {
  const { name, password } = message.data;

  const { user, errorText } = registerUser(name, password);

  let response;

  if (errorText) {
    response = {
      type: 'reg',
      data: {
        name,
        index: null,
        error: true,
        errorText: errorText,
      },
      id: 0,
    };
  } else if (user) {
    sessions.set(user.index, {
      name: user.name,
      index: user.index,
      socket: ws,
    });

    response = {
      type: 'reg',
      data: {
        name,
        index: user.index,
        error: false,
        errorText: '',
      },
      id: 0,
    };
  } else {
    response = {
      type: 'reg',
      data: {
        name,
        index: null,
        error: true,
        errorText: 'Unknown error occurred.',
      },
      id: 0,
    };
  }

  console.log('Sending registration response:', JSON.stringify(response));

  ws.send(JSON.stringify(response));
}
