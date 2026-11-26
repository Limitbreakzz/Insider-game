import { io } from 'socket.io-client';
const serverUrl = (import.meta.env.VITE_SERVER_URL || '').trim();
export const socket = io(serverUrl || undefined, {
    path: '/socket.io',
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800,
});
