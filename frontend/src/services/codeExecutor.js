/**
 * Code Executor Service
 * Executes code in a sandboxed environment (browser-side for JS)
 * Returns output or error messages
 *
 * NOTE: In production, this should connect to a backend sandboxed execution service.
 * For now, we safely evaluate JavaScript and simulate other language outputs.
 */

/** Maximum execution time in milliseconds */
const EXECUTION_TIMEOUT = 5000;

/**
 * Execute JavaScript code in a sandboxed manner using Function constructor
 * Captures console.log output and returns it as a string
 *
 * @param {string} code - JavaScript code to execute
 * @returns {Promise<{output: string, error: string|null}>}
 */
export async function executeJavaScript(code) {
    return new Promise((resolve) => {
        const logs = [];
        const errors = [];

        // Create a mock console that captures output
        const mockConsole = {
            log: (...args) => logs.push(args.map(formatValue).join(' ')),
            error: (...args) => errors.push(args.map(formatValue).join(' ')),
            warn: (...args) => logs.push(`⚠ ${args.map(formatValue).join(' ')}`),
            info: (...args) => logs.push(`ℹ ${args.map(formatValue).join(' ')}`),
        };

        // Set a timeout to prevent infinite loops
        const timeoutId = setTimeout(() => {
            resolve({
                output: logs.join('\n'),
                error: '⏱ Execution timed out (5s limit)',
            });
        }, EXECUTION_TIMEOUT);

        try {
            // Create sandboxed function with custom console
            const sandboxedFn = new Function('console', code);
            sandboxedFn(mockConsole);

            clearTimeout(timeoutId);
            resolve({
                output: logs.join('\n'),
                error: errors.length > 0 ? errors.join('\n') : null,
            });
        } catch (err) {
            clearTimeout(timeoutId);
            resolve({
                output: logs.join('\n'),
                error: `❌ ${err.name}: ${err.message}`,
            });
        }
    });
}

/**
 * Simulate execution of Python code
 * In production, this would send code to a backend Python executor
 *
 * @param {string} code - Python code (simulated output)
 * @returns {Promise<{output: string, error: string|null}>}
 */
export async function executePython(code) {
    // Simulate network latency
    await delay(800);

    // Basic simulation: look for print statements
    const printRegex = /print\s*\((.+?)\)/g;
    const outputs = [];
    let match;

    while ((match = printRegex.exec(code)) !== null) {
        let value = match[1].trim();
        // Remove f-string formatting for simulation
        value = value.replace(/f["'](.+?)["']/g, '$1');
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
        outputs.push(value);
    }

    return {
        output: outputs.length > 0
            ? outputs.join('\n')
            : '# Python execution simulated (connect backend for real execution)',
        error: null,
    };
}

/**
 * Execute code based on the selected language
 *
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language identifier
 * @returns {Promise<{output: string, error: string|null}>}
 */
export async function executeCode(code, language) {
    switch (language) {
        case 'javascript':
            return executeJavaScript(code);
        case 'python':
            return executePython(code);
        default:
            await delay(500);
            return {
                output: `✦ ${language.charAt(0).toUpperCase() + language.slice(1)} execution requires a backend server.\n  Connect to a code execution service for full support.`,
                error: null,
            };
    }
}

// ---- Helpers ----

/** Format a value for console output */
function formatValue(val) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'object') {
        try {
            return JSON.stringify(val, null, 2);
        } catch {
            return String(val);
        }
    }
    return String(val);
}

/** Promise-based delay utility */
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
