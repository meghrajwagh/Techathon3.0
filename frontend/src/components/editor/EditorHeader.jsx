/**
 * EditorHeader Component
 * Displays file tabs, language selector, and font size controls
 * Sits above the Monaco editor
 *
 * @param {Object} props
 * @param {string} props.language - Current language
 * @param {Function} props.onLanguageChange - Language change callback
 * @param {number} props.fontSize - Current font size
 * @param {Function} props.onFontSizeChange - Font size change callback
 * @param {Array} props.tabs - Array of tab objects { id, name, active }
 */
import React, { useState } from 'react';
import {
    ChevronDown,
    Plus,
    Minus,
    Type,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { SUPPORTED_LANGUAGES, FONT_SIZES } from '@/utils/mockData';

const EditorHeader = ({
    language,
    onLanguageChange,
    fontSize,
    onFontSizeChange,
    tabs = [],
}) => {
    const [showLangDropdown, setShowLangDropdown] = useState(false);

    /** Get language display name */
    const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === language);

    return (
        <div className="flex items-center justify-between px-3 py-1.5 bg-background-secondary border-b border-white/[0.04]">
            {/* File tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                            tab.active
                                ? 'bg-background-primary text-text-primary'
                                : 'text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary'
                        )}
                    >
                        <span className="w-2 h-2 rounded-full bg-accent-blue/60" />
                        {tab.name}
                    </div>
                ))}
            </div>

            {/* Right controls: language selector + font size */}
            <div className="flex items-center gap-3">
                {/* Language selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
                        aria-label="Select language"
                    >
                        {currentLang?.name || language}
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {showLangDropdown && (
                        <>
                            {/* Backdrop to close dropdown */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowLangDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-40 py-1 rounded-lg bg-background-tertiary shadow-float-lg border border-white/[0.06] z-50 animate-scale-in">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => {
                                            onLanguageChange(lang.id);
                                            setShowLangDropdown(false);
                                        }}
                                        className={cn(
                                            'w-full text-left px-3 py-1.5 text-xs transition-colors',
                                            lang.id === language
                                                ? 'text-accent-blue bg-accent-blue/10'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                                        )}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Font size controls */}
                <div className="flex items-center gap-1 border-l border-white/[0.06] pl-3">
                    <Type className="w-3 h-3 text-text-tertiary" />
                    <button
                        onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
                        className="p-1 rounded hover:bg-background-tertiary text-text-tertiary hover:text-text-secondary transition-colors"
                        aria-label="Decrease font size"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-text-secondary w-5 text-center">{fontSize}</span>
                    <button
                        onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
                        className="p-1 rounded hover:bg-background-tertiary text-text-tertiary hover:text-text-secondary transition-colors"
                        aria-label="Increase font size"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditorHeader;
