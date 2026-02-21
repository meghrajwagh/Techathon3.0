/**
 * useStudentSocket Hook
 * Handles Socket.IO events specific to student role
 */
import { useEffect } from 'react';
import socketService from '@/services/socketService';
import useStudentStore from '@/store/studentStore';
import useSessionStore from '@/store/sessionStore';

export const useStudentSocket = () => {
    const { setCode, setSharedCode, setControlled } = useStudentStore();
    const { role, sessionId, userName } = useSessionStore();

    useEffect(() => {
        // Only set up listeners if user is a student
        if (role !== 'participant') {
            console.log('[STUDENT_SOCKET] Not a participant, role:', role);
            return;
        }

        const socket = socketService.socket;
        if (!socket) {
            console.log('[STUDENT_SOCKET] Socket not initialized');
            return;
        }

        console.log('[STUDENT_SOCKET] Setting up student socket listeners');

        // Send code changes to backend
        const handleCodeChange = (code) => {
            if (sessionId) {
                socketService.emit('code_change', {
                    roomId: sessionId,
                    code: code
                });
            }
        };

        // Listen for teacher taking control
        const handleTeacherTakeControl = () => {
            console.log('[STUDENT] Teacher took control');
            setControlled(true);
        };

        // Listen for teacher releasing control
        const handleTeacherReleaseControl = () => {
            console.log('[STUDENT] Teacher released control');
            setControlled(false);
        };

        // Listen for shared code from teacher
        const handleSharedCode = (data) => {
            console.log('[STUDENT] Received shared code from teacher');
            setSharedCode(data.code, data.label || "Teacher's View");
        };

        // Listen for teacher code changes
        const handleTeacherCodeChange = (data) => {
            console.log('[STUDENT] Received teacher code change');
            setSharedCode(data.code, "Teacher's View");
        };

        // Listen for teacher output changes
        const handleTeacherOutput = (data) => {
            console.log('[STUDENT] Received teacher output');
            const { setSharedOutput } = useStudentStore.getState();
            setSharedOutput(data.output || '', data.error || null);
        };

        // Listen for teacher editing student's code directly
        const handleTeacherEditCode = (data) => {
            console.log('[STUDENT] Teacher edited my code');
            setCode(data.code);
        };

        // Register event listeners
        socket.on('teacher_take_control', handleTeacherTakeControl);
        socket.on('teacher_release_control', handleTeacherReleaseControl);
        socket.on('shared_code', handleSharedCode);
        socket.on('teacher_code_change', handleTeacherCodeChange);
        socket.on('teacher_output', handleTeacherOutput);
        socket.on('teacher_edit_code', handleTeacherEditCode);

        // Cleanup
        return () => {
            socket.off('teacher_take_control', handleTeacherTakeControl);
            socket.off('teacher_release_control', handleTeacherReleaseControl);
            socket.off('shared_code', handleSharedCode);
            socket.off('teacher_code_change', handleTeacherCodeChange);
            socket.off('teacher_output', handleTeacherOutput);
            socket.off('teacher_edit_code', handleTeacherEditCode);
        };
    }, [role, sessionId, userName, setCode, setSharedCode, setControlled]);

    return {
        sendCodeChange: (code) => {
            if (role === 'participant' && sessionId) {
                socketService.emit('code_change', {
                    roomId: sessionId,
                    code: code
                });
            }
        }
    };
};
