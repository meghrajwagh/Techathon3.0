/**
 * Code Executor Service
 * Executes code by sending it to the backend Socket.IO server.
 * Supports interactive input/output streaming.
 */

import socketService from './socketService';

/** Maximum execution time in milliseconds */
const EXECUTION_TIMEOUT = 30000;

/**
 * Execute code interactively on the backend server via Socket.IO.
 * Output is streamed line-by-line via onOutput callback.
 *
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language identifier
 * @param {Object} callbacks
 * @param {Function} callbacks.onOutput - Called with each line of output (text, isError)
 * @param {Function} callbacks.onDone - Called when execution finishes (result)
 * @returns {Function} cleanup function to remove listeners
 */
export function executeCodeInteractive(code, language, { onOutput, onDone }) {
    const socket = socketService.socket;

    if (!socket || !socket.connected) {
        if (onDone) {
            onDone({
                output: '',
                error: '❌ Not connected to server. Please check your connection.',
                exit_code: 1
            });
        }
        return () => { };
    }

    // Set a timeout
    const timeoutId = setTimeout(() => {
        cleanup();
        if (onDone) {
            onDone({
                output: '',
                error: '⏱ Execution timed out (30s limit)',
                exit_code: 1
            });
        }
    }, EXECUTION_TIMEOUT);

    // Handle streaming output
    const handleOutput = (data) => {
        if (onOutput) {
            onOutput(data.text, data.isError);
        }
    };

    // Handle execution complete
    const handleDone = (data) => {
        clearTimeout(timeoutId);
        cleanup();
        if (onDone) {
            onDone({
                output: data.output || '',
                error: data.error || null,
                exit_code: data.exit_code || 0
            });
        }
    };

    // Register listeners
    socket.on('code_output', handleOutput);
    socket.on('code_done', handleDone);

    // Emit the code execution request
    socket.emit('run_code', {
        code,
        language,
        timeout: 30,
    });

    // Cleanup function
    const cleanup = () => {
        socket.off('code_output', handleOutput);
        socket.off('code_done', handleDone);
    };

    return cleanup;
}

/**
 * Send input to a running interactive process.
 * @param {string} text - Input text to send
 */
export function sendCodeInput(text) {
    const socket = socketService.socket;
    if (socket && socket.connected) {
        socket.emit('code_input', { text });
    }
}

/**
 * Stop a running code execution.
 */
export function stopCodeExecution() {
    const socket = socketService.socket;
    if (socket && socket.connected) {
        socket.emit('stop_code', {});
    }
}
