/**
 * Student Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CODE_TEMPLATES } from '@/utils/mockData';
import socketService from '@/services/socketService';

const useStudentStore = create(
    devtools(
        (set, get) => ({
            code: CODE_TEMPLATES.javascript,
            language: 'javascript',
            output: '',
            isRunning: false,
            error: null,
            sharedCode: CODE_TEMPLATES.javascript,
            sharedLabel: "Teacher's View",
            sharedOutput: '',
            sharedError: null,
            isSharedMinimized: false,

            // Tracks the teacher's own code separately (so we can revert after unshare)
            teacherCode: CODE_TEMPLATES.javascript,

            // Whether the teacher has locked this student's editor
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

            // Update teacher's code (always saved as teacherCode too)
            setTeacherCode: (code) => {
                set({ teacherCode: code, sharedCode: code, sharedLabel: "Teacher's View" });
            },

            setSharedCode: (sharedCode, sharedLabel) => {
                console.log('[STUDENT_STORE] setSharedCode called with:', sharedCode, sharedLabel);
                set({ sharedCode, sharedLabel });
            },

            setSharedOutput: (output, error) => {
                console.log('[STUDENT_STORE] setSharedOutput called with output:', output, 'error:', error);
                set({ sharedOutput: output, sharedError: error });
            },

            // Revert shared view back to teacher's code
            revertToTeacherCode: () => {
                const { teacherCode } = get();
                set({ sharedCode: teacherCode, sharedLabel: "Teacher's View", sharedOutput: '', sharedError: null });
            },

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