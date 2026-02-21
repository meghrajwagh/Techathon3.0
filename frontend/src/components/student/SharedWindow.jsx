/**
 * SharedWindow — Read-only teacher code view (student's left panel)
 * Resizable terminal panel.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Monitor, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import CodeEditor from '@/components/editor/CodeEditor';
import OutputPanel from '@/components/terminal/OutputPanel';

const SharedWindow = ({
    code = '',
    label = "Host's Code",
    language = 'javascript',
    isMinimized = false,
    onToggleMinimize,
    output = '',
    error = null,
}) => {
    const [terminalHeight, setTerminalHeight] = useState(160);
    const isDragging = useRef(false);
    const containerRef = useRef(null);

    const handleDragStart = useCallback((e) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleDrag = useCallback((e) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const h = Math.max(60, Math.min(rect.height * 0.65, rect.bottom - e.clientY));
        setTerminalHeight(h);
    }, []);

    const handleDragEnd = useCallback(() => {
        if (isDragging.current) {
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', handleDragEnd);
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [handleDrag, handleDragEnd]);

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full bg-[#080808] border-r border-white/[0.03] transition-all duration-200 relative"
        >
            {/* Header */}
            <div className={cn(
                'flex items-center justify-between h-9 px-3 bg-[#0a0a0a] border-b border-white/[0.04] shrink-0',
                isMinimized && 'flex-col h-auto py-3 px-1'
            )}>
                {!isMinimized && (
                    <div className="flex items-center gap-2">
                        <Monitor className="w-3 h-3 text-neutral-600" />
                        <span className="text-[11px] font-medium text-neutral-400">{label}</span>
                        <Lock className="w-2.5 h-2.5 text-neutral-700" />
                    </div>
                )}

                <button
                    onClick={onToggleMinimize}
                    className="p-1 rounded hover:bg-white/[0.05] text-neutral-600 hover:text-neutral-400 transition-colors"
                    aria-label={isMinimized ? 'Expand' : 'Collapse'}
                >
                    {isMinimized ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>

            {/* Minimized state */}
            {isMinimized && (
                <div className="flex-1 flex items-center justify-center">
                    <span
                        className="text-[10px] text-neutral-700 font-medium select-none"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                        Host View
                    </span>
                </div>
            )}

            {/* Expanded state */}
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

                    <div
                        onMouseDown={handleDragStart}
                        className="h-[3px] cursor-row-resize bg-transparent hover:bg-blue-500/40 transition-colors shrink-0 relative group"
                    >
                        <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
                            <div className="w-8 h-[2px] rounded-full bg-white/[0.06] group-hover:bg-blue-400/50 transition-colors" />
                        </div>
                    </div>

                    <div style={{ height: `${terminalHeight}px` }} className="shrink-0">
                        <OutputPanel
                            output={output}
                            error={error}
                            isRunning={false}
                            onClear={() => { }}
                            className="h-full"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default SharedWindow;
