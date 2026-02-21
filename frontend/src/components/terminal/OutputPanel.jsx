/**
 * OutputPanel — Terminal output with interactive input
 */
import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Terminal as TerminalIcon, Loader2, CornerDownLeft, Square } from 'lucide-react';
import { cn } from '@/utils/cn';

const OutputPanel = ({
    output = '',
    error = null,
    isRunning = false,
    onClear,
    onSendInput,
    onStop,
    className,
}) => {
    const outputRef = useRef(null);
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output, error]);

    useEffect(() => {
        if (isRunning && inputRef.current) inputRef.current.focus();
    }, [isRunning]);

    const handleSubmitInput = () => {
        if (onSendInput && inputValue !== undefined) {
            onSendInput(inputValue);
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmitInput();
        }
    };

    return (
        <div className={cn('flex flex-col bg-[#0a0a0a] overflow-hidden', className)}>
            {/* Minimal header bar */}
            <div className="flex items-center justify-between px-3 h-8 shrink-0 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-3 h-3 text-neutral-600" />
                    <span className="text-[11px] font-medium text-neutral-500">Terminal</span>
                    {isRunning && (
                        <div className="flex items-center gap-1.5 ml-1">
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                            <span className="text-[10px] text-emerald-500/70">running</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {isRunning && onStop && (
                        <button
                            onClick={onStop}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <Square className="w-2.5 h-2.5 fill-current" />
                        </button>
                    )}
                    {(output || error) && !isRunning && (
                        <button
                            onClick={onClear}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.04] transition-colors"
                        >
                            <Trash2 className="w-2.5 h-2.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Output */}
            <div
                ref={outputRef}
                className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed"
            >
                {!output && !error && !isRunning && (
                    <div className="flex items-center justify-center h-full text-neutral-700 text-[11px]">
                        Run your code to see output here
                    </div>
                )}

                {output && (
                    <pre className="text-neutral-300 whitespace-pre-wrap break-words">{output}</pre>
                )}

                {error && (
                    <pre className="text-red-400/80 whitespace-pre-wrap break-words mt-1 pt-1 border-t border-red-500/10">{error}</pre>
                )}

                {isRunning && !output && (
                    <div className="flex items-center gap-2 text-neutral-600">
                        <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <span className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                        <span className="text-[11px]">Executing...</span>
                    </div>
                )}
            </div>

            {/* Input bar */}
            {isRunning && onSendInput && (
                <div className="flex items-center gap-2 px-3 py-1.5 border-t border-white/[0.06] bg-white/[0.02]">
                    <span className="text-emerald-500 text-[11px] font-mono font-bold select-none">›</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="stdin..."
                        className="flex-1 bg-transparent text-[12px] text-white font-mono placeholder:text-neutral-700 focus:outline-none"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <button
                        onClick={handleSubmitInput}
                        className="p-1 rounded text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                        <CornerDownLeft className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default OutputPanel;
