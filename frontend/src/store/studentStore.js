/**
 * Student Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CODE_TEMPLATES } from '@/utils/mockData';
import socketService from '@/services/socketService';

const useStudentStore = create(
    devtools(
        (set) => ({
            code: CODE_TEMPLATES.javascript,
            language: 'javascript',
            output: '',
            isRunning: false,
            error: null,
            sharedCode: CODE_TEMPLATES.javascript,
            sharedLabel: "Teacher's View",
            isSharedMinimized: false,

            // 🔥 NEW
            isControlledByTeacher: false,

            setCode: (code) => set({ code }),
            setLanguage: (language) =>
                set({
                    language,
                    code: CODE_TEMPLATES[language] || CODE_TEMPLATES.javascript,
                }),

            setOutput: (output) => set({ output, error: null }),
            setIsRunning: (isRunning) => set({ isRunning }),
            setError: (error) => set({ error, isRunning: false }),
            clearOutput: () => set({ output: '', error: null }),

            setSharedCode: (sharedCode, sharedLabel) =>
                set({ sharedCode, sharedLabel }),

            toggleSharedMinimized: () =>
                set((s) => ({ isSharedMinimized: !s.isSharedMinimized })),

            setControlled: (val) => set({ isControlledByTeacher: val }),
        }),
        { name: 'StudentStore' }
    )
);

// 🔥 SOCKET LISTENERS (Mock)
socketService.on('teacher_take_control', () => {
    useStudentStore.getState().setControlled(true);
});

socketService.on('teacher_release_control', () => {
    useStudentStore.getState().setControlled(false);
});

export default useStudentStore;