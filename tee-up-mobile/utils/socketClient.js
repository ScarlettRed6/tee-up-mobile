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
    let socketUrl = API_BASE_URL.replace('/api', '');
    
    // Ensure URL doesn't end with slash
    socketUrl = socketUrl.replace(/\/$/, '');
    
    console.log('=== Socket.IO Connection Debug ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Socket URL:', socketUrl);
    console.log('Token present:', !!token);
    console.log('Token length:', token ? token.length : 0);
    
    socketInstance = io(socketUrl, {
        auth: {
            token: token
        },
        transports: ['polling', 'websocket'], // Try polling first (more reliable), then upgrade to websocket
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: false,
        upgrade: true,
    });

    socketInstance.on('connect', () => {
        console.log('✅ Socket.IO connected successfully!');
        console.log('Socket ID:', socketInstance.id);
        console.log('Transport:', socketInstance.io?.engine?.transport?.name || 'unknown');
    });

    socketInstance.on('disconnect', (reason) => {
        console.log('❌ Socket.IO disconnected. Reason:', reason);
    });

    socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error!');
        console.error('Error message:', error.message);
        console.error('Error type:', error.type);
        console.error('Attempted URL:', socketUrl);
        console.error('Full error:', error);
    });
    
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Socket.IO reconnection attempt ${attemptNumber}/10`);
    });
    
    socketInstance.on('reconnect', (attemptNumber) => {
        console.log(`✅ Socket.IO reconnected after ${attemptNumber} attempts`);
    });
    
    socketInstance.on('reconnect_error', (error) => {
        console.error('❌ Socket.IO reconnection error:', error.message);
    });
    
    socketInstance.on('reconnect_failed', () => {
        console.error('❌ Socket.IO reconnection failed after all attempts');
        console.error('Check:');
        console.error('1. Server is running');
        console.error('2. URL is correct:', socketUrl);
        console.error('3. Firewall/antivirus is not blocking connections');
        console.error('4. Both devices are on the same network');
    });
    
    socketInstance.io.on('error', (error) => {
        console.error('Socket.IO IO error:', error);
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

