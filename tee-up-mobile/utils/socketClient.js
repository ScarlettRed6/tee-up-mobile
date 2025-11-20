import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

let socketInstance = null;
let lastToken = null; // Store last token to detect changes

export const getSocket = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    
    if (!token) {
        throw new Error('No access token available');
    }

    // Always get fresh token and reconnect if token changed or socket not connected
    if (socketInstance) {
        // Check if socket is connected and token hasn't changed
        if (socketInstance.connected && lastToken === token) {
            return socketInstance;
        }
        // Disconnect old socket if token changed or not connected
        console.log('Disconnecting old socket (token changed or not connected)');
        socketInstance.disconnect();
        socketInstance = null;
        lastToken = null;
    }
    
    // Store current token
    lastToken = token;

    // Extract base URL (remove /api if present)
    const socketUrl = API_BASE_URL.replace('/api', '');

    console.log('Creating new Socket.IO connection with token');
    
    socketInstance = io(socketUrl, {
        auth: {
            token: token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
        console.log('Socket.IO connected');
    });

    socketInstance.on('disconnect', () => {
        console.log('Socket.IO disconnected');
    });

    socketInstance.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
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

