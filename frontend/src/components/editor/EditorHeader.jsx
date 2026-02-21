/**
 * EditorHeader Component
 * Compact single-line bar: file tab + run button + language + font controls
 */
import React, { useState } from 'react';
import {
    ChevronDown, Plus, Minus, Type,
    Play, Square, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { SUPPORTED_LANGUAGES } from '@/utils/mockData';

const EditorHeader = ({
    language,
    onLanguageChange,
    fontSize,
    onFontSizeChange,
    tabs = [],
    // Run button props (merged from EditorToolbar)
    onRun,
    isRunning = false,
    // Toggle teacher editor (host only)
    onToggleTeacher,
    isTeacherVisible,
}) => {
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === language);

    return (
        <div className="flex items-center justify-between h-10 px-2 bg-[#0c0c0c] border-b border-white/[0.04] select-none shrink-0">

            {/* LEFT: tabs + run */}
            <div className="flex items-center gap-1">
                {/* File tabs */}
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-default',
                            tab.active
                                ? 'bg-white/[0.06] text-white'
                                : 'text-neutral-500 hover:text-neutral-300'
                        )}
                    >
                        <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            tab.active ? 'bg-emerald-500' : 'bg-neutral-600'
                        )} />
                        {tab.name}
                    </div>
                ))}

                <div className="w-px h-4 bg-white/[0.06] mx-1" />

                {/* Run / Stop button */}
                {onRun && (
                    <button
                        onClick={onRun}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all',
                            isRunning
                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        )}
                    >
                        {isRunning ? (
                            <>
                                <Square className="w-3 h-3 fill-current" />
                                Stop
                            </>
                        ) : (
                            <>
                                <Play className="w-3 h-3 fill-current" />
                                Run
                            </>
                        )}
                    </button>
                )}

                <span className="text-[10px] text-neutral-600 font-medium ml-1 hidden sm:inline">
                    ⌘ Enter
                </span>

                {/* Toggle teacher editor */}
                {onToggleTeacher && (
                    <>
                        <div className="w-px h-4 bg-white/[0.06] mx-1" />
                        <button
                            onClick={onToggleTeacher}
                            className="p-1.5 rounded hover:bg-white/[0.05] text-neutral-500 hover:text-neutral-300 transition-colors"
                            aria-label="Toggle teacher editor"
                            title={isTeacherVisible ? 'Hide my editor' : 'Show my editor'}
                        >
                            {isTeacherVisible ? (
                                <PanelLeftClose className="w-3.5 h-3.5" />
                            ) : (
                                <PanelLeftOpen className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </>
                )}
            </div>

            {/* RIGHT: language + font */}
            <div className="flex items-center gap-1">
                {/* Language selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                        {currentLang?.name || language}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>

                    {showLangDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                            <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-lg bg-[#1a1a1a] shadow-float-lg border border-white/[0.08] z-50">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => {
                                            onLanguageChange(lang.id);
                                            setShowLangDropdown(false);
                                        }}
                                        className={cn(
                                            'w-full text-left px-3 py-1.5 text-[11px] transition-colors',
                                            lang.id === language
                                                ? 'text-white bg-white/[0.06]'
                                                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                                        )}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Font size */}
                <div className="flex items-center gap-0.5 border-l border-white/[0.06] pl-2 ml-1">
                    <Type className="w-3 h-3 text-neutral-600" />
                    <button
                        onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
                        className="p-0.5 rounded hover:bg-white/[0.05] text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-neutral-500 w-4 text-center tabular-nums">{fontSize}</span>
                    <button
                        onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
                        className="p-0.5 rounded hover:bg-white/[0.05] text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                {/* Language badge */}
                <div className="px-2 py-0.5 rounded bg-white/[0.03] text-[10px] font-semibold text-neutral-600 uppercase tracking-wider ml-1">
                    {language}
                </div>
            </div>
        </div>
    );
};

export default EditorHeader;
