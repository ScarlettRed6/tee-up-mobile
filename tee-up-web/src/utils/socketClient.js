import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let socketInstance = null;
let lastToken = null;

export const getSocket = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No auth token available for websocket connection');
  }

  if (socketInstance && socketInstance.connected && lastToken === token) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    lastToken = null;
  }

  lastToken = token;

  let socketUrl = API_BASE_URL.replace('/api', '').replace(/\/$/, '');

  socketInstance = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  lastToken = null;
};

