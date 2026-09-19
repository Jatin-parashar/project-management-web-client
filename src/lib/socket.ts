import { io, type Socket } from 'socket.io-client';
import { store } from '@/app/store';

// Socket.IO connects to the server's own origin — NestJS's global `/api/v1`
// REST prefix has no bearing on it, the gateway listens at the root.
const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');

let socket: Socket | null = null;

export function getSocket(): Socket {
  socket ??= io(SOCKET_URL, {
    autoConnect: false,
    // A function (not a static value) so a rotated access token is read
    // fresh on every (re)connection attempt, not just the first one.
    auth: (cb) => cb({ token: store.getState().auth.accessToken }),
  });
  return socket;
}
