/**
 * Socket Service
 * Real Socket.io connection to the backend server
 */
import { io } from 'socket.io-client';

// Backend URL - change this if your backend runs on a different port
const BACKEND_URL = 'http://192.168.137.1:8000';

class SocketService {
    constructor() {
        /** Socket.io instance */
        this.socket = null;
        /** Connection state */
        this.connected = false;

        console.log('[WS] Socket service initialized');
    }

    /**
     * Connect to the backend server
     */
    connect() {
        if (this.socket?.connected) {
            console.log('[WS] Already connected');
            return this.socket;
        }

        this.socket = io(BACKEND_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('[WS] Connected to server', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.log('[WS] Disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('[WS] Connection error:', error);
        });

        return this.socket;
    }

    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Handler function
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('[WS] Socket not initialized. Call connect() first.');
            return this;
        }
        this.socket.on(event, callback);
        return this;
    }

    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Handler to remove
     */
    off(event, callback) {
        if (!this.socket) return this;
        this.socket.off(event, callback);
        return this;
    }

    /**
     * Emit an event to the server
     * @param {string} event - Event name
     * @param {*} data - Event payload
     */
    emit(event, data) {
        if (!this.socket) {
            console.warn('[WS] Socket not initialized. Call connect() first.');
            return this;
        }
        console.log(`[WS] Emitting: ${event}`, data);
        this.socket.emit(event, data);
        return this;
    }

    /**
     * Disconnect from the server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.connected = false;
            console.log('[WS] Disconnected');
        }
        return this;
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.socket?.connected || false;
    }

    /**
     * Get socket ID
     */
    getSocketId() {
        return this.socket?.id || null;
    }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;

