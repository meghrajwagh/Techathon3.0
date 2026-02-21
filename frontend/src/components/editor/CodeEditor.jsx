/**
 * CodeEditor Component
 * Monaco Editor wrapper with Antigravity dark theme and configurable options
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
import React from 'react';
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
};

const CodeEditor = ({
    value,
    onChange,
    language = 'javascript',
    readOnly = false,
    fontSize = 14,
    showMinimap = true,
    className,
}) => {
    /**
     * Called when editor is mounted — can be used to store editor instance
     * @param {object} editor - Monaco editor instance
     * @param {object} monaco - Monaco API
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
            },
        });
        monaco.editor.setTheme('antigravity');
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
