import { User } from '../models/User';
import { PlayerSession } from '../models/PlayerSession';

export const users = new Map<string, { name: string; password: string }>();
export const sessions = new Map<string | number, {
  socket: WebSocket;
  name: string;
  index: number;
  lastCreatedRoomId?: number;
}>();
export const sockets = new Map<string, WebSocket>();
export const rooms = new Map<string, { id: string; users: string[] }>();
export const games = new Map<string, Game>();
export const winners: { name: string; wins: number }[] = [];
