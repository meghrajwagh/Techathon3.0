/**
 * useSocketConnection Hook
 * Manages Socket.IO connection lifecycle and integrates with stores.
 * Handles auto-rejoin on reconnect/refresh.
 */
import { useEffect, useRef } from 'react';
import socketService from '@/services/socketService';
import useSocketStore from '@/store/socketStore';
import useSessionStore from '@/store/sessionStore';
import useStudentStore from '@/store/studentStore';

export const useSocketConnection = () => {
    const { setConnected, resetReconnect, incrementReconnect } = useSocketStore();
    const { sessionId, role, userName, isActive, rejoinSession } = useSessionStore();
    const hasRejoined = useRef(false);

    useEffect(() => {
        // Initialize socket connection
        const socket = socketService.connect();

        // Connection event handlers
        socket.on('connect', () => {
            console.log('[SOCKET] Connected');
            setConnected(true);
            resetReconnect();

            // Auto-rejoin if we have an active session (e.g. after page refresh)
            if (isActive && sessionId && role && !hasRejoined.current) {
                hasRejoined.current = true;
                console.log('[SOCKET] Auto-rejoining session after connect:', sessionId);
                rejoinSession();
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('[SOCKET] Disconnected:', reason);
            setConnected(false);
            hasRejoined.current = false;  // Allow rejoin on next connect
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
        });

        // Handle code restoration (for students rejoining)
        socket.on('restore_code', (data) => {
            console.log('[SOCKET] Restoring code from server:', data);
            const { setCode } = useStudentStore.getState();
            if (data.code) {
                setCode(data.code);
            }
        });

        // Cleanup on unmount
        return () => {
            console.log('[SOCKET] Cleaning up connection');
            socketService.disconnect();
        };
    }, [setConnected, resetReconnect, incrementReconnect, sessionId, role, userName, isActive, rejoinSession]);

    return socketService;
};

