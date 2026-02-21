/**
 * CodeEditor Component
 * Monaco Editor wrapper with Antigravity dark theme, configurable options,
 * and language-specific IntelliSense (autocomplete) for Python and JavaScript.
 *
 * @param {Object} props
 * @param {string} props.value - Code content
 * @param {Function} props.onChange - Callback when code changes
 * @param {string} props.language - Programming language
 * @param {boolean} props.readOnly - Whether editor is read-only
 * @param {number} props.fontSize - Font size in pixels
 * @param {boolean} props.showMinimap - Show minimap
 * @param {string} props.className - Additional wrapper classes
 */
import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '@/utils/cn';

/** Monaco editor options matching Antigravity aesthetic */
const DEFAULT_OPTIONS = {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontLigatures: true,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderLineHighlight: 'all',
    padding: { top: 16, bottom: 16 },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    bracketPairColorization: { enabled: true },
    guides: {
        bracketPairs: true,
        indentation: true,
    },
    // IntelliSense settings
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: 'currentDocument',
    suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
        showClasses: true,
        preview: true,
        insertMode: 'insert',
    },
};

// ──────────────────────────────────────────────────────────
// Python autocomplete definitions
// ──────────────────────────────────────────────────────────

const PYTHON_KEYWORDS = [
    // Keywords
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
    'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
    'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
    'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
    'try', 'while', 'with', 'yield',
];

const PYTHON_BUILTINS = [
    // Built-in functions
    { label: 'print', insertText: 'print(${1})', detail: 'print(*objects, sep, end, file, flush)', doc: 'Print objects to the text stream file.' },
    { label: 'input', insertText: 'input(${1:prompt})', detail: 'input([prompt])', doc: 'Read a line from input. Returns a string.' },
    { label: 'int', insertText: 'int(${1})', detail: 'int(x, base=10)', doc: 'Convert a number or string to an integer.' },
    { label: 'float', insertText: 'float(${1})', detail: 'float(x)', doc: 'Convert a string or number to a floating point number.' },
    { label: 'str', insertText: 'str(${1})', detail: 'str(object)', doc: 'Return a string version of object.' },
    { label: 'bool', insertText: 'bool(${1})', detail: 'bool(x)', doc: 'Convert a value to a Boolean.' },
    { label: 'len', insertText: 'len(${1})', detail: 'len(s)', doc: 'Return the number of items in a container.' },
    { label: 'range', insertText: 'range(${1})', detail: 'range(stop) / range(start, stop, step)', doc: 'Return a sequence of numbers.' },
    { label: 'list', insertText: 'list(${1})', detail: 'list([iterable])', doc: 'Create a new list.' },
    { label: 'dict', insertText: 'dict(${1})', detail: 'dict(**kwargs)', doc: 'Create a new dictionary.' },
    { label: 'tuple', insertText: 'tuple(${1})', detail: 'tuple([iterable])', doc: 'Create a new tuple.' },
    { label: 'set', insertText: 'set(${1})', detail: 'set([iterable])', doc: 'Create a new set.' },
    { label: 'type', insertText: 'type(${1})', detail: 'type(object)', doc: 'Return the type of an object.' },
    { label: 'isinstance', insertText: 'isinstance(${1:obj}, ${2:type})', detail: 'isinstance(object, classinfo)', doc: 'Check if object is an instance of classinfo.' },
    { label: 'abs', insertText: 'abs(${1})', detail: 'abs(x)', doc: 'Return the absolute value of a number.' },
    { label: 'max', insertText: 'max(${1})', detail: 'max(iterable) / max(a, b, ...)', doc: 'Return the largest item.' },
    { label: 'min', insertText: 'min(${1})', detail: 'min(iterable) / min(a, b, ...)', doc: 'Return the smallest item.' },
    { label: 'sum', insertText: 'sum(${1})', detail: 'sum(iterable, start=0)', doc: 'Sum the items of an iterable.' },
    { label: 'sorted', insertText: 'sorted(${1})', detail: 'sorted(iterable, key, reverse)', doc: 'Return a new sorted list.' },
    { label: 'reversed', insertText: 'reversed(${1})', detail: 'reversed(seq)', doc: 'Return a reverse iterator.' },
    { label: 'enumerate', insertText: 'enumerate(${1})', detail: 'enumerate(iterable, start=0)', doc: 'Return an enumerate object.' },
    { label: 'zip', insertText: 'zip(${1})', detail: 'zip(*iterables)', doc: 'Iterate over several iterables in parallel.' },
    { label: 'map', insertText: 'map(${1:func}, ${2:iterable})', detail: 'map(function, iterable)', doc: 'Apply function to every item of iterable.' },
    { label: 'filter', insertText: 'filter(${1:func}, ${2:iterable})', detail: 'filter(function, iterable)', doc: 'Filter items for which function returns True.' },
    { label: 'open', insertText: 'open(${1:filename}, ${2:mode})', detail: 'open(file, mode)', doc: 'Open a file and return a file object.' },
    { label: 'round', insertText: 'round(${1:number}, ${2:ndigits})', detail: 'round(number, ndigits)', doc: 'Round a number to given precision.' },
    { label: 'hasattr', insertText: 'hasattr(${1:obj}, ${2:name})', detail: 'hasattr(object, name)', doc: 'Check if an object has the given attribute.' },
    { label: 'getattr', insertText: 'getattr(${1:obj}, ${2:name})', detail: 'getattr(object, name)', doc: 'Get the named attribute of object.' },
    { label: 'setattr', insertText: 'setattr(${1:obj}, ${2:name}, ${3:value})', detail: 'setattr(object, name, value)', doc: 'Set the named attribute of object.' },
];

const PYTHON_SNIPPETS = [
    { label: 'def', insertText: 'def ${1:function_name}(${2:params}):\n    ${3:pass}', detail: 'Function definition', doc: 'Define a new function.' },
    { label: 'class', insertText: 'class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}', detail: 'Class definition', doc: 'Define a new class with __init__.' },
    { label: 'if', insertText: 'if ${1:condition}:\n    ${2:pass}', detail: 'if statement', doc: 'Conditional if statement.' },
    { label: 'ifelse', insertText: 'if ${1:condition}:\n    ${2:pass}\nelse:\n    ${3:pass}', detail: 'if/else statement', doc: 'Conditional if/else statement.' },
    { label: 'for', insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}', detail: 'for loop', doc: 'Iterate over an iterable.' },
    { label: 'while', insertText: 'while ${1:condition}:\n    ${2:pass}', detail: 'while loop', doc: 'Loop while condition is True.' },
    { label: 'try', insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:print(e)}', detail: 'try/except block', doc: 'Handle exceptions.' },
    { label: 'with', insertText: 'with ${1:expression} as ${2:variable}:\n    ${3:pass}', detail: 'with statement', doc: 'Context manager statement.' },
    { label: 'list_comp', insertText: '[${1:expr} for ${2:item} in ${3:iterable}]', detail: 'List comprehension', doc: 'Create a list using comprehension.' },
    { label: 'dict_comp', insertText: '{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}', detail: 'Dict comprehension', doc: 'Create a dict using comprehension.' },
    { label: 'lambda', insertText: 'lambda ${1:args}: ${2:expression}', detail: 'Lambda function', doc: 'Create an anonymous function.' },
    { label: 'main', insertText: 'if __name__ == "__main__":\n    ${1:main()}', detail: 'Main guard', doc: 'Main entry point guard.' },
];

// ──────────────────────────────────────────────────────────
// JavaScript autocomplete definitions
// ──────────────────────────────────────────────────────────

const JS_KEYWORDS = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
    'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
    'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
    'let', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw',
    'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while', 'with',
    'yield', 'async', 'await', 'of',
];

const JS_BUILTINS = [
    { label: 'console.log', insertText: 'console.log(${1})', detail: 'console.log(...data)', doc: 'Log a message to the console.' },
    { label: 'console.error', insertText: 'console.error(${1})', detail: 'console.error(...data)', doc: 'Log an error message to the console.' },
    { label: 'console.warn', insertText: 'console.warn(${1})', detail: 'console.warn(...data)', doc: 'Log a warning to the console.' },
    { label: 'console.table', insertText: 'console.table(${1})', detail: 'console.table(data)', doc: 'Display tabular data as a table.' },
    { label: 'parseInt', insertText: 'parseInt(${1:string}, ${2:10})', detail: 'parseInt(string, radix)', doc: 'Parse a string as an integer.' },
    { label: 'parseFloat', insertText: 'parseFloat(${1:string})', detail: 'parseFloat(string)', doc: 'Parse a string as a floating point number.' },
    { label: 'isNaN', insertText: 'isNaN(${1})', detail: 'isNaN(value)', doc: 'Check if a value is NaN.' },
    { label: 'isFinite', insertText: 'isFinite(${1})', detail: 'isFinite(value)', doc: 'Check if a value is a finite number.' },
    { label: 'JSON.stringify', insertText: 'JSON.stringify(${1})', detail: 'JSON.stringify(value)', doc: 'Convert a value to JSON string.' },
    { label: 'JSON.parse', insertText: 'JSON.parse(${1})', detail: 'JSON.parse(text)', doc: 'Parse a JSON string.' },
    { label: 'Math.floor', insertText: 'Math.floor(${1})', detail: 'Math.floor(x)', doc: 'Round down to nearest integer.' },
    { label: 'Math.ceil', insertText: 'Math.ceil(${1})', detail: 'Math.ceil(x)', doc: 'Round up to nearest integer.' },
    { label: 'Math.round', insertText: 'Math.round(${1})', detail: 'Math.round(x)', doc: 'Round to the nearest integer.' },
    { label: 'Math.random', insertText: 'Math.random()', detail: 'Math.random()', doc: 'Return a random number between 0 and 1.' },
    { label: 'Math.max', insertText: 'Math.max(${1})', detail: 'Math.max(...values)', doc: 'Return the largest of the given numbers.' },
    { label: 'Math.min', insertText: 'Math.min(${1})', detail: 'Math.min(...values)', doc: 'Return the smallest of the given numbers.' },
    { label: 'Math.abs', insertText: 'Math.abs(${1})', detail: 'Math.abs(x)', doc: 'Return the absolute value.' },
    { label: 'Math.pow', insertText: 'Math.pow(${1:base}, ${2:exp})', detail: 'Math.pow(base, exponent)', doc: 'Return base to the exp power.' },
    { label: 'Math.sqrt', insertText: 'Math.sqrt(${1})', detail: 'Math.sqrt(x)', doc: 'Return the square root.' },
    { label: 'Array.isArray', insertText: 'Array.isArray(${1})', detail: 'Array.isArray(value)', doc: 'Check if a value is an Array.' },
    { label: 'Object.keys', insertText: 'Object.keys(${1})', detail: 'Object.keys(obj)', doc: 'Return an array of keys.' },
    { label: 'Object.values', insertText: 'Object.values(${1})', detail: 'Object.values(obj)', doc: 'Return an array of values.' },
    { label: 'Object.entries', insertText: 'Object.entries(${1})', detail: 'Object.entries(obj)', doc: 'Return key-value pairs.' },
    { label: 'setTimeout', insertText: 'setTimeout(() => {\n    ${2}\n}, ${1:1000})', detail: 'setTimeout(fn, delay)', doc: 'Execute fn after delay ms.' },
    { label: 'setInterval', insertText: 'setInterval(() => {\n    ${2}\n}, ${1:1000})', detail: 'setInterval(fn, delay)', doc: 'Execute fn repeatedly every delay ms.' },
    { label: 'Promise', insertText: 'new Promise((resolve, reject) => {\n    ${1}\n})', detail: 'new Promise(executor)', doc: 'Create a new Promise.' },
    { label: 'fetch', insertText: 'fetch(${1:url})\n    .then(res => res.json())\n    .then(data => {\n        ${2}\n    })', detail: 'fetch(url)', doc: 'Fetch a resource from the network.' },
];

const JS_SNIPPETS = [
    { label: 'function', insertText: 'function ${1:name}(${2:params}) {\n    ${3}\n}', detail: 'Function declaration', doc: 'Declare a named function.' },
    { label: 'arrow', insertText: 'const ${1:name} = (${2:params}) => {\n    ${3}\n}', detail: 'Arrow function', doc: 'Create an arrow function.' },
    { label: 'class', insertText: 'class ${1:ClassName} {\n    constructor(${2:params}) {\n        ${3}\n    }\n}', detail: 'Class declaration', doc: 'Declare a class.' },
    { label: 'if', insertText: 'if (${1:condition}) {\n    ${2}\n}', detail: 'if statement', doc: 'Conditional if statement.' },
    { label: 'ifelse', insertText: 'if (${1:condition}) {\n    ${2}\n} else {\n    ${3}\n}', detail: 'if/else statement', doc: 'Conditional if/else statement.' },
    { label: 'forloop', insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3}\n}', detail: 'for loop', doc: 'Classic for loop.' },
    { label: 'forof', insertText: 'for (const ${1:item} of ${2:iterable}) {\n    ${3}\n}', detail: 'for...of loop', doc: 'Iterate over iterable values.' },
    { label: 'forin', insertText: 'for (const ${1:key} in ${2:object}) {\n    ${3}\n}', detail: 'for...in loop', doc: 'Iterate over object keys.' },
    { label: 'foreach', insertText: '${1:array}.forEach((${2:item}) => {\n    ${3}\n})', detail: '.forEach() loop', doc: 'Iterate with forEach callback.' },
    { label: 'map', insertText: '${1:array}.map((${2:item}) => {\n    return ${3}\n})', detail: '.map() transform', doc: 'Transform each element.' },
    { label: 'filter', insertText: '${1:array}.filter((${2:item}) => {\n    return ${3}\n})', detail: '.filter()', doc: 'Filter array elements.' },
    { label: 'reduce', insertText: '${1:array}.reduce((${2:acc}, ${3:item}) => {\n    return ${4}\n}, ${5:initialValue})', detail: '.reduce()', doc: 'Reduce array to a single value.' },
    { label: 'trycatch', insertText: 'try {\n    ${1}\n} catch (${2:error}) {\n    ${3:console.error(error)}\n}', detail: 'try/catch block', doc: 'Handle exceptions.' },
    { label: 'switch', insertText: 'switch (${1:expression}) {\n    case ${2:value}:\n        ${3}\n        break;\n    default:\n        ${4}\n}', detail: 'switch statement', doc: 'Multi-way branch.' },
    { label: 'asyncfn', insertText: 'async function ${1:name}(${2:params}) {\n    ${3}\n}', detail: 'Async function', doc: 'Declare an async function.' },
    { label: 'asyncarrow', insertText: 'const ${1:name} = async (${2:params}) => {\n    ${3}\n}', detail: 'Async arrow function', doc: 'Create an async arrow function.' },
    { label: 'destructure', insertText: 'const { ${1:prop} } = ${2:object}', detail: 'Object destructuring', doc: 'Destructure an object.' },
    { label: 'template', insertText: '`${${1:expression}}`', detail: 'Template literal', doc: 'String with embedded expression.' },
];

/**
 * Register language-specific autocomplete suggestions
 */
function registerCompletionProviders(monaco) {
    // ─── Python completions ───
    monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const suggestions = [];

            // Keywords
            PYTHON_KEYWORDS.forEach((kw) => {
                suggestions.push({
                    label: kw,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: kw,
                    range,
                    detail: 'keyword',
                });
            });

            // Built-in functions (with snippets)
            PYTHON_BUILTINS.forEach((item) => {
                suggestions.push({
                    label: item.label,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: item.insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                    detail: item.detail,
                    documentation: item.doc,
                });
            });

            // Snippets
            PYTHON_SNIPPETS.forEach((item) => {
                suggestions.push({
                    label: item.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: item.insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                    detail: item.detail,
                    documentation: item.doc,
                });
            });

            return { suggestions };
        },
    });

    // ─── JavaScript completions ───
    monaco.languages.registerCompletionItemProvider('javascript', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const suggestions = [];

            // Keywords
            JS_KEYWORDS.forEach((kw) => {
                suggestions.push({
                    label: kw,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: kw,
                    range,
                    detail: 'keyword',
                });
            });

            // Built-in functions
            JS_BUILTINS.forEach((item) => {
                suggestions.push({
                    label: item.label,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: item.insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                    detail: item.detail,
                    documentation: item.doc,
                });
            });

            // Snippets
            JS_SNIPPETS.forEach((item) => {
                suggestions.push({
                    label: item.label,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: item.insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                    detail: item.detail,
                    documentation: item.doc,
                });
            });

            return { suggestions };
        },
    });
}

const CodeEditor = ({
    value,
    onChange,
    language = 'javascript',
    readOnly = false,
    fontSize = 14,
    showMinimap = true,
    className,
}) => {
    const providersRegistered = useRef(false);

    /**
     * Called when editor is mounted
     */
    const handleEditorDidMount = (editor, monaco) => {
        // Define custom Antigravity theme
        monaco.editor.defineTheme('antigravity', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'c084fc' },
                { token: 'string', foreground: '34d399' },
                { token: 'number', foreground: 'f59e0b' },
                { token: 'type', foreground: '06b6d4' },
                { token: 'function', foreground: '60a5fa' },
                { token: 'variable', foreground: 'e2e8f0' },
                { token: 'operator', foreground: '94a3b8' },
            ],
            colors: {
                'editor.background': '#0f1419',
                'editor.foreground': '#e2e8f0',
                'editor.lineHighlightBackground': '#1a1f2e',
                'editor.selectionBackground': '#3b82f633',
                'editorCursor.foreground': '#3b82f6',
                'editorLineNumber.foreground': '#4b5563',
                'editorLineNumber.activeForeground': '#9ca3af',
                'editor.inactiveSelectionBackground': '#3b82f61a',
                'editorIndentGuide.background': '#252a3a',
                'editorIndentGuide.activeBackground': '#374151',
                'editorWidget.background': '#1a1f2e',
                'editorWidget.border': '#ffffff0a',
                // Autocomplete widget styling
                'editorSuggestWidget.background': '#1a1f2e',
                'editorSuggestWidget.border': '#ffffff0f',
                'editorSuggestWidget.foreground': '#e2e8f0',
                'editorSuggestWidget.selectedBackground': '#3b82f633',
                'editorSuggestWidget.highlightForeground': '#60a5fa',
            },
        });
        monaco.editor.setTheme('antigravity');

        // Register completion providers (once per session)
        if (!providersRegistered.current) {
            registerCompletionProviders(monaco);
            providersRegistered.current = true;
        }
    };

    return (
        <div className={cn('h-full w-full overflow-hidden rounded-lg', className)}>
            <Editor
                height="100%"
                language={language}
                value={value}
                onChange={(val) => onChange?.(val || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                loading={
                    <div className="flex items-center justify-center h-full bg-background-primary">
                        <div className="text-text-tertiary text-sm animate-pulse">
                            Loading editor...
                        </div>
                    </div>
                }
                options={{
                    ...DEFAULT_OPTIONS,
                    fontSize,
                    readOnly,
                    minimap: { enabled: showMinimap },
                    wordWrap: readOnly ? 'on' : 'off',
                    domReadOnly: readOnly,
                }}
            />
        </div>
    );
};

export default CodeEditor;
