/**
 * useSocketConnection Hook
 * Manages Socket.IO connection lifecycle and integrates with stores
 */
import { useEffect } from 'react';
import socketService from '@/services/socketService';
import useSocketStore from '@/store/socketStore';
import useSessionStore from '@/store/sessionStore';

export const useSocketConnection = () => {
    const { setConnected, resetReconnect, incrementReconnect } = useSocketStore();
    const { sessionId, role } = useSessionStore();

    useEffect(() => {
        // Initialize socket connection
        const socket = socketService.connect();

        // Connection event handlers
        socket.on('connect', () => {
            console.log('[SOCKET] Connected');
            setConnected(true);
            resetReconnect();

            // If we have an active session, rejoin the room
            if (sessionId && role) {
                console.log('[SOCKET] Rejoining room:', sessionId);
                socketService.emit('join_room', { roomId: sessionId });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('[SOCKET] Disconnected:', reason);
            setConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('[SOCKET] Connection error:', error);
            incrementReconnect();
        });

        socket.on('reconnect_attempt', () => {
            console.log('[SOCKET] Reconnecting...');
            incrementReconnect();
        });

        socket.on('reconnect', () => {
            console.log('[SOCKET] Reconnected');
            resetReconnect();
        });

        // Cleanup on unmount
        return () => {
            console.log('[SOCKET] Cleaning up connection');
            socketService.disconnect();
        };
    }, [setConnected, resetReconnect, incrementReconnect, sessionId, role]);

    return socketService;
};
