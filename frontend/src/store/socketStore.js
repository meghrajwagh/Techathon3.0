/**
 * Socket Store (Zustand)
 * Manages WebSocket connection state, status indicators, and reconnect logic
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useSocketStore = create(
    devtools(
        (set) => ({
            // ---- State ----
            /** Whether connected to the WebSocket server */
            isConnected: true, // Default true for mock mode
            /** Number of reconnection attempts */
            reconnectAttempts: 0,
            /** Last connection event message */
            lastEvent: 'Connected',
            /** Whether we are in mock mode (no real server) */
            isMockMode: true,

            // ---- Actions ----

            /** Set connection status */
            setConnected: (isConnected) =>
                set({ isConnected, lastEvent: isConnected ? 'Connected' : 'Disconnected' }, false, 'setConnected'),

            /** Increment reconnect attempts */
            incrementReconnect: () =>
                set((s) => ({ reconnectAttempts: s.reconnectAttempts + 1 }), false, 'incrementReconnect'),

            /** Reset reconnect counter on successful connection */
            resetReconnect: () =>
                set({ reconnectAttempts: 0, isConnected: true, lastEvent: 'Reconnected' }, false, 'resetReconnect'),

            /** Set last event message */
            setLastEvent: (lastEvent) =>
                set({ lastEvent }, false, 'setLastEvent'),
        }),
        { name: 'SocketStore' }
    )
);

export default useSocketStore;
