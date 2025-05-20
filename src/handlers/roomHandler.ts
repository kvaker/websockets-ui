import WebSocket from 'ws';
import { getSessionBySocket } from '../utils/session';
import { roomStore } from '../models/roomStore';
import { sessions } from '../db/inMemoryDb';

export function handleCreateRoom(ws: WebSocket, message: any) {
  const session = getSessionBySocket(ws);

  if (!session) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: JSON.stringify({ message: 'User not registered' }),
      id: 0,
    }));
  }

  const room = roomStore.createRoom({ name: session.name, index: session.index });

  session.lastCreatedRoomId = room.roomId;

  const availableRooms = roomStore.getAvailableRooms();

  for (const { socket } of sessions.values()) {
    socket.send(JSON.stringify({
      type: 'update_room',
      data: JSON.stringify(availableRooms),
      id: 0,
    }));
  }
}

  export function handleJoinRoom(ws: WebSocket, message: any) {
  const session = getSessionBySocket(ws);
  let roomId = message.data?.indexRoom;

  if (!session) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: JSON.stringify({ message: 'User not registered' }),
      id: 0,
    }));
  }

  if (!roomId && session.lastCreatedRoomId) {
    roomId = session.lastCreatedRoomId;
  }

  if (!roomId) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: JSON.stringify({ message: 'Room ID not provided and no recent room found' }),
      id: 0,
    }));
  }

  const room = roomStore.getRoom(roomId);

  if (!room) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: JSON.stringify({ message: 'Room not found' }),
      id: 0,
    }));
  }

  if (room.roomUsers.length >= 2) {
    return ws.send(JSON.stringify({
      type: 'error',
      data: JSON.stringify({ message: 'Room is full' }),
      id: 0,
    }));
  }

  roomStore.addUserToRoom(roomId, { name: session.name, index: session.index });

  const availableRooms = roomStore.getAvailableRooms();

  for (const { socket } of sessions.values()) {
    socket.send(JSON.stringify({
      type: 'update_room',
      data: JSON.stringify(availableRooms),
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
          data: JSON.stringify({ roomId, players: updatedRoom.roomUsers }),
          id: 0,
        }));
      }
    }
  }
}
