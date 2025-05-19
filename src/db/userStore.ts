import { User } from '../models/User.js';

const users = new Map<string, User>();
let nextIndex = 1;

export function registerUser(name: string, password: string): { user?: User; errorText?: string } {
  if (users.has(name)) {
    return { errorText: 'User already exists' };
  }

  const user: User = { name, password, index: nextIndex++ };
  users.set(name, user);
  return { user };
}

export function getWinners() {
  return Array.from(users.values()).map(u => ({ name: u.name, wins: 0 }));
}
