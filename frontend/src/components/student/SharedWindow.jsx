/**
 * SharedWindow Component
 * Read-only view of the teacher's shared code (or promoted student's code)
 * Displayed SIDE-BY-SIDE with the student's editor
 *
 * @param {Object} props
 * @param {string} props.code - Shared code content
 * @param {string} props.label - Label (e.g., "Host's View")
 * @param {string} props.language - Programming language
 * @param {boolean} props.isMinimized - Whether the view is collapsed
 * @param {Function} props.onToggleMinimize - Toggle minimize
 * @param {string} props.output - Output from code execution
 * @param {string} props.error - Error from code execution
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';
import CodeEditor from '@/components/editor/CodeEditor';
import OutputPanel from '@/components/terminal/OutputPanel';

const SharedWindow = ({
    code = '',
    label = "Host's View",
    language = 'javascript',
    isMinimized = false,
    onToggleMinimize,
    output = '',
    error = null,
}) => {
    return (
        <div
            className="flex flex-col h-full border-r border-white/[0.04] bg-background-secondary transition-all duration-300 relative"
        >
            {/* Header bar */}
            <div className={cn(
                'flex items-center justify-between px-3 py-2 bg-background-secondary border-b border-white/[0.04] shrink-0',
                isMinimized && 'flex-col py-3'
            )}>
                {!isMinimized && (
                    <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-accent-cyan" />
                        <span className="text-xs font-medium text-accent-cyan">
                            {label}
                        </span>
                        <Eye className="w-3 h-3 text-text-tertiary" />
                        <span className="text-[10px] text-text-tertiary">Read-only</span>
                    </div>
                )}

                <button
                    onClick={onToggleMinimize}
                    className="p-1 rounded hover:bg-background-tertiary text-text-tertiary hover:text-text-secondary transition-colors"
                    aria-label={isMinimized ? 'Expand shared view' : 'Minimize shared view'}
                >
                    {isMinimized ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Minimized indicator */}
            {isMinimized && (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-[10px] text-text-tertiary font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                        Host View
                    </span>
                </div>
            )}

            {/* Shared code editor (read-only) — visible when not minimized */}
            {!isMinimized && (
                <>
                    <div className="flex-1 min-h-0">
                        <CodeEditor
                            value={code}
                            language={language}
                            readOnly={true}
                            fontSize={13}
                            showMinimap={false}
                        />
                    </div>

                    {/* Output panel for teacher's output */}
                    <div className="h-48 shrink-0 border-t border-white/[0.04]">
                        <OutputPanel
                            output={output}
                            error={error}
                            isRunning={false}
                            onClear={() => { }}
                            className="h-full rounded-none"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default SharedWindow;
