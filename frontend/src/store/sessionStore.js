/**
 * Session Store (Zustand)
 * Manages session state: session ID, role (host/participant),
 * 1-hour countdown timer, and participant list
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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

                // Emit join_room event to backend
                socketService.emit('join_room', { roomId: sessionId });

                console.log('[SESSION] Created session:', sessionId);
                return sessionId;
            },

            /** Join an existing session (user becomes participant) */
            joinSession: (sessionId, userName) => {
                set({
                    sessionId,
                    role: 'participant',
                    userName: userName || 'Student',
                    isActive: true,
                    timeRemaining: SESSION_DURATION,
                }, false, 'joinSession');

                // Start the countdown timer
                get()._startTimer();

                // Emit join_room event to backend
                socketService.emit('join_room', { roomId: sessionId });

                console.log('[SESSION] Joined session:', sessionId);
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
        { name: 'SessionStore' }
    )
);

export default useSessionStore;
