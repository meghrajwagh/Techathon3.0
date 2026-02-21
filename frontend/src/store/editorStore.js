/**
 * Editor Store (Zustand)
 * Manages the code editor state: content, language, theme, font size, files/tabs
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CODE_TEMPLATES } from '@/utils/mockData';

const useEditorStore = create(
    devtools(
        (set, get) => ({
            // ---- State ----
            /** Current code in the editor */
            code: CODE_TEMPLATES.javascript,
            /** Selected programming language */
            language: 'javascript',
            /** Editor theme (vs-dark / light) */
            theme: 'vs-dark',
            /** Font size in pixels */
            fontSize: 14,
            /** Whether minimap is visible */
            showMinimap: true,
            /** Whether word wrap is enabled */
            wordWrap: false,
            /** Open file tabs */
            tabs: [{ id: 'main', name: 'main.js', language: 'javascript', active: true }],

            // ---- Actions ----

            /** Update the code content */
            setCode: (code) => set({ code }, false, 'setCode'),

            /** Change the programming language and load default template */
            setLanguage: (language) => {
                const extensionMap = {
                    javascript: '.js', python: '.py', java: '.java',
                    html: '.html', css: '.css', typescript: '.ts',
                };
                const ext = extensionMap[language] || '.js';
                const currentTabs = get().tabs.map((t) =>
                    t.active ? { ...t, language, name: `main${ext}` } : t
                );

                set(
                    {
                        language,
                        code: CODE_TEMPLATES[language] || CODE_TEMPLATES.javascript,
                        tabs: currentTabs,
                    },
                    false,
                    'setLanguage'
                );
            },

            /** Update editor theme */
            setTheme: (theme) => set({ theme }, false, 'setTheme'),

            /** Update font size */
            setFontSize: (fontSize) => set({ fontSize }, false, 'setFontSize'),

            /** Toggle minimap visibility */
            toggleMinimap: () =>
                set((s) => ({ showMinimap: !s.showMinimap }), false, 'toggleMinimap'),

            /** Toggle word wrap */
            toggleWordWrap: () =>
                set((s) => ({ wordWrap: !s.wordWrap }), false, 'toggleWordWrap'),
        }),
        { name: 'EditorStore' }
    )
);

export default useEditorStore;
