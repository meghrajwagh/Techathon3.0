/**
 * Teacher Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import socketService from '@/services/socketService';

const useTeacherStore = create(
    devtools(
        (set, get) => ({
            students: [], // Start with empty array - will be populated from backend
            isPanelOpen: false,
            promotedStudentId: null,
            selectedStudent: null,
            isEditMode: false,
            sortBy: 'name',

            // NEW
            controlledStudentId: null,

            // Update students list from backend
            setStudents: (students) => set({ students }),

            // Add or update a student
            updateStudent: (studentId, studentData) => {
                set((s) => {
                    const existingIndex = s.students.findIndex(stu => stu.id === studentId);
                    if (existingIndex >= 0) {
                        // Update existing student
                        const updated = [...s.students];
                        updated[existingIndex] = { ...updated[existingIndex], ...studentData };
                        return { students: updated };
                    } else {
                        // Add new student
                        return { students: [...s.students, { id: studentId, ...studentData }] };
                    }
                });
            },

            // Remove a student
            removeStudent: (studentId) => {
                set((s) => ({
                    students: s.students.filter(stu => stu.id !== studentId),
                    selectedStudent: s.selectedStudent?.id === studentId ? null : s.selectedStudent,
                }));
            },

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

            updateStudentOutput: (studentId, output, error) => {
                set((s) => ({
                    students: s.students.map((stu) =>
                        stu.id === studentId
                            ? { ...stu, output, error, outputPreview: output ? output.substring(0, 50) + '...' : 'No output yet' }
                            : stu
                    ),
                    selectedStudent:
                        s.selectedStudent?.id === studentId
                            ? { ...s.selectedStudent, output, error }
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