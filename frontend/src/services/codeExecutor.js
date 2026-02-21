/**
 * Code Executor Service
 * Executes code by sending it to the backend Socket.IO server
 */

import socketService from './socketService';

/** Maximum execution time in milliseconds */
const EXECUTION_TIMEOUT = 30000;

/**
 * Execute code on the backend server via Socket.IO
 *
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language identifier (currently only Python supported)
 * @returns {Promise<{output: string, error: string|null}>}
 */
export async function executeCode(code, language) {
    return new Promise((resolve) => {
        const socket = socketService.socket;

        if (!socket || !socket.connected) {
            resolve({
                output: '',
                error: '❌ Not connected to server. Please check your connection.',
            });
            return;
        }

        // Set a timeout
        const timeoutId = setTimeout(() => {
            socket.off('code_result', handleResult);
            resolve({
                output: '',
                error: '⏱ Execution timed out (30s limit)',
            });
        }, EXECUTION_TIMEOUT);

        // Listen for the result
        const handleResult = (data) => {
            clearTimeout(timeoutId);
            socket.off('code_result', handleResult);

            if (data.error) {
                resolve({
                    output: data.output || '',
                    error: `❌ ${data.error}`,
                });
            } else {
                resolve({
                    output: data.output || '',
                    error: data.exit_code !== 0 ? `Exit code: ${data.exit_code}` : null,
                });
            }
        };

        socket.on('code_result', handleResult);

        // Emit the code execution request
        socket.emit('run_code', {
            code,
            language,
            timeout: 10,
        });
    });
}

