import { sessions } from '../db/inMemoryDb';

type PlayerInfo = {
  name: string;
  index: number | string;
  ships?: any[];
};

type Room = {
  roomId: number | string;
  roomUsers: PlayerInfo[];
};

let rooms: Room[] = [];
let nextRoomId = 1;

export const roomStore = {
  createRoom(player: PlayerInfo): Room {
    const room: Room = {
      roomId: nextRoomId++,
      roomUsers: [player],
    };
    rooms.push(room);
    return room;
  },

  getAvailableRooms(): Room[] {
    return rooms.filter(room => room.roomUsers.length === 1);
  },

    getRoom(roomId: number | string): Room | undefined {
    return rooms.find(room => room.roomId === roomId);
  },

  addUserToRoom(roomId: number | string, player: PlayerInfo): boolean {
    const room = rooms.find(r => r.roomId === roomId);
    if (room && room.roomUsers.length < 2) {
      room.roomUsers.push(player);
      return true;
    }
    return false;
  },

  getRoomById(roomId: number | string): Room | undefined {
  return rooms.find(room => room.roomId === roomId);
  },

  getSocketByPlayerIndex(index: number | string): WebSocket | null {
  return sessions.get(index)?.socket || null;
  },
  
  removeRoom(roomId: number | string): void {
    rooms = rooms.filter(room => room.roomId !== roomId);
  },

  getAll(): Room[] {
    return rooms;
  },
};
