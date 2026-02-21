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
    const { sessionId, role, userName } = useSessionStore();

    useEffect(() => {
        // Initialize socket connection
        const socket = socketService.connect();

        // Connection event handlers
        socket.on('connect', () => {
            console.log('[SOCKET] Connected');
            setConnected(true);
            resetReconnect();

            // Note: join_room is handled by sessionStore.createSession/joinSession
            // We don't emit it here to avoid duplicate joins
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

        // Handle role assignment from backend
        socket.on('role_assigned', (data) => {
            console.log('[SOCKET] Role assigned from backend:', data.role);
            // Backend sends 'teacher' or 'student', but we don't need to change our role
            // since we already set it when creating/joining the session
        });

        // Cleanup on unmount
        return () => {
            console.log('[SOCKET] Cleaning up connection');
            socketService.disconnect();
        };
    }, [setConnected, resetReconnect, incrementReconnect, sessionId, role, userName]);

    return socketService;
};

