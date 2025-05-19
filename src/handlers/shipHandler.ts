import WebSocket from 'ws';
import { IncomingMessage } from '../models/Message';
import { roomStore } from '../models/roomStore';
import { getSessionBySocket } from '../utils/session';

export function handleAddShips(ws: WebSocket, message: IncomingMessage) {
  console.log('Handling add_ships for ws:', ws);

  const session = getSessionBySocket(ws);
  const { ships, gameId, indexPlayer } = message.data;

  if (!session) {
    console.log('Session not found for ws:', ws);
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'User not registered' },
      id: 0,
    }));
  }

  if (!ships || !gameId) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Missing ships or gameId' },
      id: 0,
    }));
  }

  console.log(`Adding ships to room ${gameId}:`, ships);

  const room = roomStore.getRoomById(gameId);
  if (!room) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Room not found' },
      id: 0,
    }));
  }

  const player = room.roomUsers.find(u => u.index === indexPlayer);
  if (!player) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Player not in room' },
      id: 0,
    }));
  }

  const transformedShips = ships.map((ship: any) => ({
    x: ship.position.x,
    y: ship.position.y,
    length: ship.length,
    direction: ship.direction ? 'horizontal' : 'vertical',
  }));

  player.ships = transformedShips;

  ws.send(JSON.stringify({
    type: 'add_ships',
    data: { success: true },
    id: 0,
  }));

  const allReady = room.roomUsers.length === 2 && room.roomUsers.every(u => u.ships);
  if (allReady) {
    room.roomUsers.forEach(u => {
      const socket = roomStore.getSocketByPlayerIndex(u.index);
      socket?.send(JSON.stringify({
        type: 'game_ready',
        data: {
          roomId: room.roomId,
          message: 'Both players added ships. Game is ready to start!',
        },
        id: 0,
      }));
    });
  }

  console.log('Received add_ships:', JSON.stringify(message, null, 2));
}
