/**
 * Socket Service (Mock)
 * Simulates WebSocket functionality for development.
 * In production, replace with actual Socket.io connection.
 *
 * Provides event emission and listener patterns matching Socket.io API
 */

class MockSocketService {
    constructor() {
        /** Event listeners map */
        this._listeners = new Map();
        /** Connection state */
        this.connected = true;
        /** Mock latency in ms */
        this.latency = 100;

        console.log('[WS] Mock socket service initialized');
    }

    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Handler function
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event).push(callback);
        return this;
    }

    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Handler to remove
     */
    off(event, callback) {
        if (!this._listeners.has(event)) return this;
        const listeners = this._listeners.get(event).filter((fn) => fn !== callback);
        this._listeners.set(event, listeners);
        return this;
    }

    /**
     * Emit an event (simulates sending to server)
     * @param {string} event - Event name
     * @param {*} data - Event payload
     */
    emit(event, data) {
        console.log(`[WS] Emitting: ${event}`, data);

        // Simulate server echo with latency
        setTimeout(() => {
            this._trigger(event, data);
        }, this.latency);

        return this;
    }

    /**
     * Trigger all listeners for an event
     * @param {string} event - Event name
     * @param {*} data - Event payload
     */
    _trigger(event, data) {
        const listeners = this._listeners.get(event) || [];
        listeners.forEach((fn) => fn(data));
    }

    /** Simulate disconnect */
    disconnect() {
        this.connected = false;
        this._trigger('disconnect', { reason: 'client disconnect' });
        console.log('[WS] Disconnected');
    }

    /** Simulate reconnect */
    reconnect() {
        this.connected = true;
        this._trigger('connect', {});
        console.log('[WS] Reconnected');
    }
}

// Singleton instance
const socketService = new MockSocketService();
export default socketService;
