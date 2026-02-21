/**
 * Session Store (Zustand)
 * Manages session state: session ID, role (host/participant),
 * 1-hour countdown timer, and participant list
 * 
 * Uses localStorage persistence so sessions survive page refresh.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import socketService from '@/services/socketService';

/** Generate a short unique session ID (6 chars, like Google Meet) */
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

const useSessionStore = create(
    devtools(
        persist(
            (set, get) => ({
                // ---- State ----
                /** Current session ID (null = no session) */
                sessionId: null,
                /** Role of the current user: 'host' | 'participant' | null */
                role: null,
                /** Remaining session time in seconds */
                timeRemaining: SESSION_DURATION,
                /** Timer interval reference */
                _timerId: null,
                /** Whether session is active */
                isActive: false,
                /** Host display name */
                hostName: '',
                /** Participant display name */
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

                    // Start the countdown timer
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
                    const { _timerId } = get();
                    if (_timerId) clearInterval(_timerId);

                    set({
                        sessionId: null,
                        role: null,
                        isActive: false,
                        timeRemaining: SESSION_DURATION,
                        _timerId: null,
                        hostName: '',
                        userName: '',
                    }, false, 'endSession');

                    // Disconnect socket when ending session
                    socketService.disconnect();

                    console.log('[SESSION] Session ended');
                },

                /** Internal: start the 1-second countdown timer */
                _startTimer: () => {
                    const { _timerId } = get();
                    if (_timerId) clearInterval(_timerId);

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
