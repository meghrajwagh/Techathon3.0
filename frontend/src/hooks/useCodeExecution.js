/**
 * useCodeExecution Hook
 * Wraps the code executor service with React state management
 * Handles loading states, output capture, and error handling
 *
 * @returns {{ runCode: Function, output: string, error: string|null, isRunning: boolean, clearOutput: Function }}
 */
import { useState, useCallback } from 'react';
import { executeCode } from '@/services/codeExecutor';

export function useCodeExecution() {
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    /**
     * Execute code and capture output
     * @param {string} code - Source code to run
     * @param {string} language - Language identifier
     */
    const runCode = useCallback(async (code, language) => {
        setIsRunning(true);
        setError(null);

        try {
            const result = await executeCode(code, language);
            setOutput(result.output);
            if (result.error) setError(result.error);
        } catch (err) {
            setError(`Unexpected error: ${err.message}`);
        } finally {
            setIsRunning(false);
        }
    }, []);

    /** Clear the output console */
    const clearOutput = useCallback(() => {
        setOutput('');
        setError(null);
    }, []);

    return { runCode, output, error, isRunning, clearOutput };
}
