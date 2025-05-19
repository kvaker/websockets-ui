import WebSocket from 'ws';
import { getSessionBySocket } from '../utils/session';
import { roomStore } from '../models/roomStore';
import { sessions } from '../db/inMemoryDb';

export function handleCreateRoom(ws: WebSocket, message: any) {
  const session = getSessionBySocket(ws);

  if (!session) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'User not registered' },
      id: 0,
    }));
  }

  roomStore.createRoom({ name: session.name, index: session.index });

  const availableRooms = roomStore.getAvailableRooms();

  for (const { socket } of sessions.values()) {
    socket.send(JSON.stringify({
      type: 'update_room',
      data: availableRooms,
      id: 0,
    }));
  }
}
  export function handleJoinRoom(ws: WebSocket, message: any) {
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

  if (room.roomUsers.length >= 2) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: { message: 'Room is full' },
      id: 0,
    }));
  }

  roomStore.addUserToRoom(roomId, { name: session.name, index: session.index });

  const availableRooms = roomStore.getAvailableRooms();
  for (const { socket } of sessions.values()) {
    socket.send(JSON.stringify({
      type: 'update_room',
      data: availableRooms,
      id: 0,
    }));
  }

  const updatedRoom = roomStore.getRoom(roomId);
  if (updatedRoom) {
    for (const user of updatedRoom.roomUsers) {
      const userSession = sessions.get(user.index);
      if (userSession) {
        userSession.socket.send(JSON.stringify({
          type: 'create_game',
          data: { roomId, players: updatedRoom.roomUsers },
          id: 0,
        }));
      }
    }
  }
}
