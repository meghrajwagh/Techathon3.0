/**
 * useCodeExecution Hook
 * Wraps the code executor service with React state management.
 * Supports interactive input/output streaming.
 *
 * @returns {{ runCode, output, error, isRunning, clearOutput, sendInput, stopExecution }}
 */
import { useState, useCallback, useRef } from 'react';
import { executeCodeInteractive, sendCodeInput, stopCodeExecution } from '@/services/codeExecutor';

export function useCodeExecution() {
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const cleanupRef = useRef(null);

    /**
     * Execute code interactively with streaming output
     * @param {string} code - Source code to run
     * @param {string} language - Language identifier
     */
    const runCode = useCallback((code, language) => {
        // Clean up any previous execution
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        setIsRunning(true);
        setOutput('');
        setError(null);

        const cleanup = executeCodeInteractive(code, language, {
            onOutput: (text, isError) => {
                if (isError) {
                    // Accumulate error output but also show in main output
                    setOutput((prev) => prev + text);
                } else {
                    setOutput((prev) => prev + text);
                }
            },
            onDone: (result) => {
                setIsRunning(false);
                cleanupRef.current = null;
                if (result.error) {
                    setError(result.error);
                }
            }
        });

        cleanupRef.current = cleanup;
    }, []);

    /**
     * Send input to the running process
     * @param {string} text - Input text
     */
    const sendInput = useCallback((text) => {
        if (isRunning) {
            sendCodeInput(text);
            // Echo the input in the output panel
            setOutput((prev) => prev + text + '\n');
        }
    }, [isRunning]);

    /**
     * Stop the running execution
     */
    const stopExecution = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        stopCodeExecution();
        setIsRunning(false);
    }, []);

    /** Clear the output console */
    const clearOutput = useCallback(() => {
        setOutput('');
        setError(null);
    }, []);

    return { runCode, output, error, isRunning, clearOutput, sendInput, stopExecution };
}
