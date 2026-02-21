/**
 * OutputPanel Component
 * Displays code execution output with error highlighting,
 * loading indicator, and clear button
 *
 * @param {Object} props
 * @param {string} props.output - Execution output text
 * @param {string|null} props.error - Error message if any
 * @param {boolean} props.isRunning - Whether code is executing
 * @param {Function} props.onClear - Clear console callback
 * @param {string} props.className - Additional classes
 */
import React, { useRef, useEffect } from 'react';
import { Trash2, Terminal as TerminalIcon, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const OutputPanel = ({
    output = '',
    error = null,
    isRunning = false,
    onClear,
    className,
}) => {
    const outputRef = useRef(null);

    // Auto-scroll to bottom when output changes
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output, error]);

    return (
        <div className={cn('flex flex-col bg-background-primary rounded-lg overflow-hidden', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-background-secondary/50 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-3.5 h-3.5 text-text-tertiary" />
                    <span className="text-xs font-medium text-text-secondary">Output</span>
                    {isRunning && (
                        <div className="flex items-center gap-1.5 text-status-success">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-[10px]">Running...</span>
                        </div>
                    )}
                </div>

                {/* Clear button */}
                {(output || error) && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary transition-colors"
                        aria-label="Clear console"
                    >
                        <Trash2 className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            {/* Output content */}
            <div
                ref={outputRef}
                className="flex-1 overflow-y-auto p-3 font-mono text-sm leading-relaxed min-h-[80px]"
            >
                {!output && !error && !isRunning && (
                    <div className="flex items-center justify-center h-full text-text-tertiary text-xs">
                        Run your code to see output here
                    </div>
                )}

                {/* Standard output */}
                {output && (
                    <pre className="text-text-secondary whitespace-pre-wrap break-words">
                        {output}
                    </pre>
                )}

                {/* Error output */}
                {error && (
                    <pre className="text-status-error whitespace-pre-wrap break-words mt-1 pt-1 border-t border-status-error/20">
                        {error}
                    </pre>
                )}

                {/* Running indicator */}
                {isRunning && !output && (
                    <div className="flex items-center gap-2 text-text-tertiary">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-typing-dot" style={{ animationDelay: '0s' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="text-xs">Executing code...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputPanel;
