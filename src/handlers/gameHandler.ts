import WebSocket from 'ws';
import { getSessionBySocket } from '../utils/session';
import { roomStore } from '../models/roomStore';
import { sessions } from '../db/inMemoryDb';
import type { Ship } from '../types/Ship';

function isHit(ship: Ship, x: number, y: number): boolean {
  for (let i = 0; i < ship.length; i++) {
    const sx = ship.direction === 'horizontal' ? ship.x + i : ship.x;
    const sy = ship.direction === 'vertical' ? ship.y + i : ship.y;
    if (sx === x && sy === y) return true;
  }
  return false;
}

export function handleAttack(ws: WebSocket, message: any) {
  const session = getSessionBySocket(ws);
  const { roomId, x, y } = message.data;

  if (!session) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'User not registered' },
      id: 0,
    }));
  }

  const room = roomStore.getRoom(roomId);
  if (!room) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Room not found' },
      id: 0,
    }));
  }

  const opponent = room.roomUsers.find(u => u.index !== session.index);
  if (!opponent) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Opponent not found' },
      id: 0,
    }));
  }

  const opponentShips = room.ships?.[opponent.index] || [];
  let hit = false;
  let status: 'miss' | 'shot' | 'killed' = 'miss';

  for (const ship of opponentShips) {
    if (isHit(ship, x, y)) {
      hit = true;
      if (isShipSunk(ship, opponentShips)) {
        status = 'killed';
      } else {
        status = 'shot';
      }
      break;
    }
  }

  for (const user of room.roomUsers) {
    const targetSession = sessions.get(user.index);
    if (targetSession) {
      targetSession.socket.send(JSON.stringify({
        type: 'attack',
        data: {
          position: { x, y },
          currentPlayer: session.index,
          status, // miss | shot | killed
        },
        id: 0,
      }));
    }
  }

  handleFinish(ws, { data: { roomId } });

  function isShipSunk(ship: Ship, ships: Ship[]): boolean {
    return ship.length === ships.filter(s => s === ship).length;
  }
}

export function handleRandomAttack(ws: WebSocket, message: any) {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);

  handleAttack(ws, {
    ...message,
    data: {
      ...message.data,
      x,
      y,
    },
  });
}

export function handleTurn(ws: WebSocket, message: any) {
  const session = getSessionBySocket(ws);
  const { roomId } = message.data;

  if (!session) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'User not registered' },
      id: 0,
    }));
  }

  const room = roomStore.getRoom(roomId);
  if (!room) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Room not found' },
      id: 0,
    }));
  }

  const opponent = room.roomUsers.find(u => u.index !== session.index);
  if (!opponent) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Opponent not found' },
      id: 0,
    }));
  }

  ws.send(JSON.stringify({
    type: 'turn',
    data: {
      currentPlayer: session.index,
    },
    id: 0,
  }));

  const opponentSession = sessions.get(opponent.index);
  if (opponentSession) {
    opponentSession.socket.send(JSON.stringify({
      type: 'turn',
      data: {
        currentPlayer: opponent.index,
      },
      id: 0,
    }));
  }
}

export function handleFinish(ws: WebSocket, message: any) {
  const session = getSessionBySocket(ws);
  const { roomId } = message.data;

  if (!session) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'User not registered' },
      id: 0,
    }));
  }

  const room = roomStore.getRoom(roomId);
  if (!room) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Room not found' },
      id: 0,
    }));
  }

  const opponent = room.roomUsers.find(u => u.index !== session.index);
  if (!opponent) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Opponent not found' },
      id: 0,
    }));
  }

  const opponentShips = room.ships?.[opponent.index] || [];
  const playerShips = room.ships?.[session.index] || [];

  if (opponentShips.length === 0) {
    const winnerIndex = session.index;
    return endGame(room, winnerIndex);
  }

  if (playerShips.length === 0) {
    const winnerIndex = opponent.index;
    return endGame(room, winnerIndex);
  }
  
  return ws.send(JSON.stringify({
    type: 'error',
    data: { message: 'Game is not finished yet' },
    id: 0,
  }));

  function endGame(room, winnerIndex) {
    room.roomUsers.forEach(user => {
      const socket = roomStore.getSocketByPlayerIndex(user.index);
      if (socket) {
        socket.send(JSON.stringify({
          type: 'finish',
          data: {
            winPlayer: winnerIndex,
          },
          id: 0,
        }));
      }
    });

    roomStore.removeRoom(room.roomId);
  }
}
