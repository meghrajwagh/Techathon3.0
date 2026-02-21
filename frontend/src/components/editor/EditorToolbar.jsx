/**
 * EditorToolbar Component
 * Action bar below the editor header: Run, Format, theme toggle
 */

import React from 'react';
import { Play, Sparkles, Square, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import Button from '@/components/common/Button';

const EditorToolbar = ({
    onRun,
    isRunning = false,
    onFormat,
    language,
    onToggleTeacher,
    isTeacherVisible,
}) => {
    return (
        <div className="flex items-center justify-between px-5 py-3 bg-background-secondary border-b border-white/[0.06]">

            {/* Left: Run button + Toggle */}
            <div className="flex items-center gap-4">

                {/* 🔥 Enhanced Run Button */}
                <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                >
                    <Button
                        variant={isRunning ? 'danger' : 'success'}
                        size="md"
                        icon={
                            isRunning ? (
                                <Square className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5 fill-current" />
                            )
                        }
                        onClick={onRun}
                        loading={isRunning}
                        className={cn(
                            "px-6 py-3 text-base font-bold rounded-xl shadow-md transition-all",
                            isRunning
                                ? 'bg-status-error text-white hover:bg-status-error/90'
                                : 'bg-status-success text-white hover:bg-status-success/90 hover:shadow-lg'
                        )}
                    >
                        {isRunning ? 'Stop' : 'Run'}
                    </Button>
                </motion.div>

                {/* Hide / Show Teacher Editor */}
                {onToggleTeacher && (
                    <button
                        onClick={onToggleTeacher}
                        className="p-3 rounded-lg hover:bg-background-tertiary transition-all"
                        aria-label="Toggle teacher editor"
                    >
                        {isTeacherVisible ? (
                            <PanelLeftClose className="w-5 h-5 text-text-tertiary" />
                        ) : (
                            <PanelLeftOpen className="w-5 h-5 text-text-tertiary" />
                        )}
                    </button>
                )}

                {/* Keyboard shortcut hint */}
                <span className="text-sm text-text-tertiary font-medium hidden sm:inline">
                    Ctrl + Enter
                </span>
            </div>

            {/* Right: Format + info */}
            <div className="flex items-center gap-4">
                {onFormat && (
                    <button
                        onClick={onFormat}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-tertiary hover:text-text-primary hover:bg-background-tertiary transition-all"
                        aria-label="Format code"
                    >
                        <Sparkles className="w-4 h-4" />
                        Format
                    </button>
                )}

                {/* Language badge */}
                <div className="px-3 py-1 rounded-lg bg-background-tertiary text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {language}
                </div>
            </div>
        </div>
    );
};

export default EditorToolbar;