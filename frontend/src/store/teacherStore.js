/**
 * Teacher Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MOCK_STUDENTS } from '@/utils/mockData';
import socketService from '@/services/socketService';

const useTeacherStore = create(
    devtools(
        (set, get) => ({
            students: MOCK_STUDENTS,
            isPanelOpen: false,
            promotedStudentId: null,
            selectedStudent: null,
            isEditMode: false,
            sortBy: 'name',

            // NEW
            controlledStudentId: null,

            openPanel: () => set({ isPanelOpen: true }),
            closePanel: () => set({ isPanelOpen: false }),

            selectStudent: (student) =>
                set({ selectedStudent: student, isEditMode: false }),

            clearSelectedStudent: () =>
                set({ selectedStudent: null, isEditMode: false }),

            promoteStudent: (studentId) => {
                const current = get().promotedStudentId;
                set({ promotedStudentId: current === studentId ? null : studentId });
            },

            updateStudentCode: (studentId, code) => {
                set((s) => ({
                    students: s.students.map((stu) =>
                        stu.id === studentId ? { ...stu, code } : stu
                    ),
                    selectedStudent:
                        s.selectedStudent?.id === studentId
                            ? { ...s.selectedStudent, code }
                            : s.selectedStudent,
                }));
            },

            // 🔥 TAKE CONTROL
            takeControl: (studentId) => {
                set({ controlledStudentId: studentId });
                socketService.emit('teacher_take_control', { studentId });
            },

            releaseControl: () => {
                const { controlledStudentId } = get();
                socketService.emit('teacher_release_control', { studentId: controlledStudentId });
                set({ controlledStudentId: null });
            },
        }),
        { name: 'TeacherStore' }
    )
);

export default useTeacherStore;