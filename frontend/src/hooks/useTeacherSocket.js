/**
 * useTeacherSocket Hook
 * Handles Socket.IO events specific to teacher role
 */
import { useEffect } from 'react';
import socketService from '@/services/socketService';
import useTeacherStore from '@/store/teacherStore';
import useSessionStore from '@/store/sessionStore';

export const useTeacherSocket = () => {
    const { setStudents, updateStudent, updateStudentCode, updateStudentOutput, removeStudent } = useTeacherStore();
    const { role } = useSessionStore();

    useEffect(() => {
        // Only set up listeners if user is a teacher
        if (role !== 'host') return;

        const socket = socketService.socket;
        if (!socket) return;

        // Handle student list updates from backend
        const handleStudentListUpdate = (data) => {
            console.log('[TEACHER] Student list update:', data);

            // Convert backend student format to frontend format
            const students = Object.entries(data.students || {}).map(([id, student]) => ({
                id,
                name: student.name || 'Anonymous',
                code: student.code || '',
                output: student.output || '',
                error: student.error || null,
                outputPreview: student.output ? student.output.substring(0, 50) + '...' : 'No output yet',
                isOnline: true,
                lastActivity: 'Just now',
                language: 'python', // Default to python since backend executes Python
            }));

            setStudents(students);
        };

        // Handle code updates from students
        const handleCodeUpdate = (data) => {
            console.log('[TEACHER] Code update from student:', data.studentId);
            updateStudentCode(data.studentId, data.code);
        };

        // Handle output updates from students
        const handleStudentOutput = (data) => {
            console.log('[TEACHER] Output from student:', data.studentId, data);
            updateStudentOutput(data.studentId, data.output || '', data.error || null);
        };

        // Handle role assignment
        const handleRoleAssigned = (data) => {
            console.log('[TEACHER] Role assigned:', data.role);
        };

        // Register event listeners
        socket.on('student_list_update', handleStudentListUpdate);
        socket.on('code_update', handleCodeUpdate);
        socket.on('student_output', handleStudentOutput);
        socket.on('role_assigned', handleRoleAssigned);

        // Cleanup
        return () => {
            socket.off('student_list_update', handleStudentListUpdate);
            socket.off('code_update', handleCodeUpdate);
            socket.off('student_output', handleStudentOutput);
            socket.off('role_assigned', handleRoleAssigned);
        };
    }, [role, setStudents, updateStudent, updateStudentCode, updateStudentOutput, removeStudent]);
};
