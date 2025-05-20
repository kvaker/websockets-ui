import WebSocket from 'ws';
import { handleRegistration } from './regHandler.js';
import { handleCreateRoom } from './roomHandler';
import { handleJoinRoom } from './roomHandler';
import { handleAddShips } from './shipHandler';
import { handleAttack, handleRandomAttack } from './gameHandler';

export function handleMessage(ws: WebSocket, message: any) {
  switch (message.type) {
    case 'reg':
      return handleRegistration(ws, message);
    case 'create_room':
      return handleCreateRoom(ws, message);
    case 'add_user_to_room':
      return handleJoinRoom(ws, message);
    case 'add_ships':
      return handleAddShips(ws, message);
    case 'attack':
      return handleAttack(ws, message);
    case 'randomAttack':
      return handleRandomAttack(ws, message);
    default:
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Unknown command' },
        id: 0,
      }));
  }
}
