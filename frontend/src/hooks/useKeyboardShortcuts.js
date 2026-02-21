/**
 * useKeyboardShortcuts Hook
 * Registers global keyboard shortcuts for the IDE
 * Supports Ctrl/Cmd modifiers for cross-platform compatibility
 *
 * @param {Object} shortcuts - Map of shortcut keys to handler functions
 *
 * Supported shortcuts:
 * - Ctrl+Enter: Run code
 * - Ctrl+S: Save
 * - Ctrl+/: Toggle comment
 * - Escape: Close panels/modals
 */
import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts = {}) {
    const handleKeyDown = useCallback(
        (event) => {
            const isMod = event.ctrlKey || event.metaKey;

            // Ctrl/Cmd + Enter → Run code
            if (isMod && event.key === 'Enter' && shortcuts.onRun) {
                event.preventDefault();
                shortcuts.onRun();
                return;
            }

            // Ctrl/Cmd + S → Save
            if (isMod && event.key === 's' && shortcuts.onSave) {
                event.preventDefault();
                shortcuts.onSave();
                return;
            }

            // Ctrl/Cmd + B → Toggle sidebar/panel
            if (isMod && event.key === 'b' && shortcuts.onTogglePanel) {
                event.preventDefault();
                shortcuts.onTogglePanel();
                return;
            }

            // Escape → Close modal/panel
            if (event.key === 'Escape' && shortcuts.onEscape) {
                shortcuts.onEscape();
                return;
            }

            // Ctrl/Cmd + Plus → Increase font size
            if (isMod && (event.key === '=' || event.key === '+') && shortcuts.onFontIncrease) {
                event.preventDefault();
                shortcuts.onFontIncrease();
                return;
            }

            // Ctrl/Cmd + Minus → Decrease font size
            if (isMod && event.key === '-' && shortcuts.onFontDecrease) {
                event.preventDefault();
                shortcuts.onFontDecrease();
                return;
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
