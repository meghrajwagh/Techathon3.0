/**
 * useSocketConnection Hook
 * Manages Socket.IO connection lifecycle and integrates with stores.
 * Handles auto-rejoin on reconnect/refresh, timer sync, and room closure.
 */
import { useEffect, useRef } from 'react';
import socketService from '@/services/socketService';
import useSocketStore from '@/store/socketStore';
import useSessionStore from '@/store/sessionStore';
import useStudentStore from '@/store/studentStore';

export const useSocketConnection = () => {
    const { setConnected, resetReconnect, incrementReconnect } = useSocketStore();
    const { sessionId, role, userName, isActive, rejoinSession, endSession, receiveTimerSync } = useSessionStore();
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

        // ───── Timer sync from server (students receive host time) ─────
        socket.on('timer_sync', (data) => {
            console.log('[SOCKET] Timer sync received:', data.timeRemaining);
            receiveTimerSync(data.timeRemaining);
        });

        // ───── Room closed by host ─────
        socket.on('room_closed', (data) => {
            console.log('[SOCKET] Room closed by host:', data.message);
            // Alert the user and end the session
            alert(data.message || 'The host has ended the session.');
            endSession();
        });

        // Cleanup on unmount
        return () => {
            console.log('[SOCKET] Cleaning up connection');
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('reconnect_attempt');
            socket.off('reconnect');
            socket.off('role_assigned');
            socket.off('restore_code');
            socket.off('timer_sync');
            socket.off('room_closed');
            socketService.disconnect();
        };
    }, [setConnected, resetReconnect, incrementReconnect, sessionId, role, userName, isActive, rejoinSession, endSession, receiveTimerSync]);

    return socketService;
};
