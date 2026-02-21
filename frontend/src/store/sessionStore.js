/**
 * Session Store (Zustand)
 * Manages session state: session ID, role (host/participant),
 * 1-hour countdown timer, and participant list
 * 
 * Timer sync: The teacher is the source of truth for the timer.
 * Every 10 seconds the teacher broadcasts its time to the backend,
 * which relays it to all students so everyone stays in sync.
 * 
 * Uses localStorage persistence so sessions survive page refresh.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import socketService from '@/services/socketService';

/** Generate a short unique session ID (9 chars, like Google Meet) */
const generateSessionId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [];
    for (let s = 0; s < 3; s++) {
        let seg = '';
        for (let i = 0; i < 3; i++) {
            seg += chars[Math.floor(Math.random() * chars.length)];
        }
        segments.push(seg);
    }
    return segments.join('-'); // e.g. "abc-x2f-9kp"
};

/** Session duration: 1 hour in seconds */
const SESSION_DURATION = 60 * 60;

/** How often the teacher syncs its timer to students (ms) */
const TIMER_SYNC_INTERVAL = 10_000;

const useSessionStore = create(
    devtools(
        persist(
            (set, get) => ({
                // ---- State ----
                sessionId: null,
                role: null,
                timeRemaining: SESSION_DURATION,
                _timerId: null,
                _syncTimerId: null,
                isActive: false,
                hostName: '',
                userName: '',

                // ---- Actions ----

                /** Create a new session (user becomes host) */
                createSession: (hostName) => {
                    const sessionId = generateSessionId();
                    console.log('[SESSION] createSession called - hostName:', hostName);

                    set({
                        sessionId,
                        role: 'host',
                        hostName: hostName || 'Host',
                        userName: hostName || 'Host',
                        isActive: true,
                        timeRemaining: SESSION_DURATION,
                    }, false, 'createSession');

                    // Start the countdown timer
                    get()._startTimer();

                    // Wait for socket to be connected before emitting
                    const waitForSocketAndEmit = () => {
                        if (socketService.isConnected()) {
                            const payload = {
                                roomId: sessionId,
                                userName: hostName || 'Host'
                            };
                            console.log('[SESSION] Socket connected, emitting join_room with payload:', payload);
                            socketService.emit('join_room', payload);
                        } else {
                            console.log('[SESSION] Socket not connected yet, waiting...');
                            setTimeout(waitForSocketAndEmit, 100);
                        }
                    };

                    setTimeout(waitForSocketAndEmit, 100);

                    console.log('[SESSION] Created session:', sessionId, 'as host with name:', hostName);
                    return sessionId;
                },

                /** Join an existing session (user becomes participant) */
                joinSession: (sessionId, userName) => {
                    console.log('[SESSION] joinSession called - sessionId:', sessionId, 'userName:', userName);

                    set({
                        sessionId,
                        role: 'participant',
                        userName: userName || 'Student',
                        isActive: true,
                        timeRemaining: SESSION_DURATION,
                    }, false, 'joinSession');

                    // Start the countdown timer (will be overridden by server sync)
                    get()._startTimer();

                    // Wait for socket to be connected before emitting
                    const waitForSocketAndEmit = () => {
                        if (socketService.isConnected()) {
                            const payload = {
                                roomId: sessionId,
                                userName: userName || 'Student'
                            };
                            console.log('[SESSION] Socket connected, emitting join_room with payload:', payload);
                            socketService.emit('join_room', payload);
                        } else {
                            console.log('[SESSION] Socket not connected yet, waiting...');
                            setTimeout(waitForSocketAndEmit, 100);
                        }
                    };

                    setTimeout(waitForSocketAndEmit, 100);

                    console.log('[SESSION] Joined session:', sessionId, 'as participant with name:', userName);
                },

                /** Rejoin the current session after page refresh */
                rejoinSession: () => {
                    const { sessionId, role, userName, isActive } = get();
                    if (!sessionId || !role || !isActive) return;

                    console.log('[SESSION] Rejoining session:', sessionId, 'as', role);

                    // Restart the timer
                    get()._startTimer();

                    // Wait for socket to be connected before emitting
                    const waitForSocketAndEmit = () => {
                        if (socketService.isConnected()) {
                            const payload = {
                                roomId: sessionId,
                                userName: userName || (role === 'host' ? 'Host' : 'Student')
                            };
                            console.log('[SESSION] Rejoining room with payload:', payload);
                            socketService.emit('join_room', payload);
                        } else {
                            console.log('[SESSION] Socket not connected yet, waiting for rejoin...');
                            setTimeout(waitForSocketAndEmit, 100);
                        }
                    };

                    setTimeout(waitForSocketAndEmit, 200);
                },

                /** Leave / end the current session */
                endSession: () => {
                    const { _timerId, _syncTimerId } = get();
                    if (_timerId) clearInterval(_timerId);
                    if (_syncTimerId) clearInterval(_syncTimerId);

                    // Notify the backend that we're explicitly leaving
                    if (socketService.isConnected()) {
                        socketService.emit('leave_room', {});
                    }

                    set({
                        sessionId: null,
                        role: null,
                        isActive: false,
                        timeRemaining: SESSION_DURATION,
                        _timerId: null,
                        _syncTimerId: null,
                        hostName: '',
                        userName: '',
                    }, false, 'endSession');

                    socketService.disconnect();
                    console.log('[SESSION] Session ended');
                },

                /** Receive timer sync from server (students only) */
                receiveTimerSync: (serverTimeRemaining) => {
                    const { role } = get();
                    if (role !== 'participant') return; // Only students sync from server
                    console.log('[TIMER_SYNC] Received server time:', serverTimeRemaining);
                    set({ timeRemaining: serverTimeRemaining }, false, 'timerSync');
                },

                /** Internal: start the 1-second countdown timer */
                _startTimer: () => {
                    const { _timerId, _syncTimerId } = get();
                    if (_timerId) clearInterval(_timerId);
                    if (_syncTimerId) clearInterval(_syncTimerId);

                    // Countdown every second
                    const timerId = setInterval(() => {
                        const { timeRemaining } = get();
                        if (timeRemaining <= 0) {
                            clearInterval(timerId);
                            set({ isActive: false, _timerId: null }, false, 'timerExpired');
                            console.log('[SESSION] Session time expired');
                            return;
                        }
                        set({ timeRemaining: timeRemaining - 1 }, false, 'tick');
                    }, 1000);

                    set({ _timerId: timerId }, false, '_startTimer');

                    // If this user is the host, broadcast timer to students every 10s
                    const { role } = get();
                    if (role === 'host') {
                        const syncTimerId = setInterval(() => {
                            const { timeRemaining, isActive } = get();
                            if (!isActive) {
                                clearInterval(syncTimerId);
                                return;
                            }
                            if (socketService.isConnected()) {
                                socketService.emit('sync_timer', { timeRemaining });
                            }
                        }, TIMER_SYNC_INTERVAL);

                        set({ _syncTimerId: syncTimerId }, false, '_startTimerSync');
                    }
                },
            }),
            {
                name: 'orca-session',  // localStorage key
                partialize: (state) => ({
                    // Only persist these fields (not timerId or internal state)
                    sessionId: state.sessionId,
                    role: state.role,
                    isActive: state.isActive,
                    hostName: state.hostName,
                    userName: state.userName,
                    timeRemaining: state.timeRemaining,
                }),
            }
        ),
        { name: 'SessionStore' }
    )
);

export default useSessionStore;
