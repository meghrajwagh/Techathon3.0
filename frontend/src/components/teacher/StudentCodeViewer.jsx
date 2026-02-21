/**
 * StudentCodeViewer Component
 * Modal that shows a student's code in a Monaco editor
 * Supports view-only and edit modes with output display
 *
 * @param {Object} props
 * @param {Object} props.student - Student object to view
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal callback
 * @param {boolean} props.isEditMode - Whether editing is enabled
 * @param {Function} props.onToggleEdit - Toggle edit mode
 * @param {Function} props.onSaveCode - Save edited code
 * @param {Function} props.onPromote - Promote student's view
 * @param {boolean} props.isPromoted - Whether student is currently promoted
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Save, Monitor, Eye, Copy, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import CodeEditor from '@/components/editor/CodeEditor';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const StudentCodeViewer = ({
    student,
    isOpen,
    onClose,
    isEditMode = false,
    onToggleEdit,
    onSaveCode,
    onPromote,
    isPromoted = false,
}) => {
    const [editedCode, setEditedCode] = useState('');
    const [copied, setCopied] = useState(false);

    // Sync code when student changes
    useEffect(() => {
        if (student) setEditedCode(student.code);
    }, [student]);

    if (!student) return null;

    /** Copy code to clipboard */
    const handleCopy = async () => {
        await navigator.clipboard.writeText(editedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /** Save edited code */
    const handleSave = () => {
        onSaveCode?.(student.id, editedCode);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-8 lg:inset-16 bg-background-secondary rounded-2xl shadow-float-lg z-50 flex flex-col overflow-hidden border border-white/[0.06]"
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                            <div className="flex items-center gap-3">
                                <Avatar name={student.name} isOnline={student.isOnline} />
                                <div>
                                    <h2 className="text-base font-semibold text-text-primary">
                                        {student.name}
                                    </h2>
                                    <p className="text-xs text-text-tertiary">{student.lastActivity}</p>
                                </div>
                                <Badge variant={isEditMode ? 'yellow' : 'blue'}>
                                    {isEditMode ? '✏️ Editing' : '👁️ Viewing'}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Copy button */}
                                <Button variant="ghost" size="sm" onClick={handleCopy} icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>

                                {/* Toggle edit mode */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onToggleEdit}
                                    icon={isEditMode ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                >
                                    {isEditMode ? 'View Only' : 'Edit'}
                                </Button>

                                {/* Save button (edit mode only) */}
                                {isEditMode && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSave}
                                        icon={<Save className="w-4 h-4" />}
                                    >
                                        Save
                                    </Button>
                                )}

                                {/* Promote button */}
                                <Button
                                    variant={isPromoted ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => onPromote?.(student)}
                                    icon={<Monitor className="w-4 h-4" />}
                                    className={cn(
                                        isPromoted && 'bg-accent-blue text-white',
                                        !isPromoted && 'bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30'
                                    )}
                                >
                                    {isPromoted ? 'Sharing' : 'Share to Class'}
                                </Button>

                                {/* Close */}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content: Code + Output split */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Code editor (left/main) */}
                            <div className="flex-1 flex flex-col">
                                <div className="px-4 py-2 border-b border-white/[0.04] bg-background-primary/50">
                                    <span className="text-xs text-text-tertiary">
                                        {student.language || 'javascript'} •{' '}
                                        {isEditMode ? 'Editable' : 'Read-only'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <CodeEditor
                                        value={editedCode}
                                        onChange={setEditedCode}
                                        language={student.language || 'javascript'}
                                        readOnly={!isEditMode}
                                        fontSize={14}
                                        showMinimap={false}
                                    />
                                </div>
                            </div>

                            {/* Output panel (right) */}
                            <div className="w-80 border-l border-white/[0.04] flex flex-col">
                                <div className="px-4 py-2 border-b border-white/[0.04] bg-background-primary/50">
                                    <span className="text-xs text-text-tertiary">Output</span>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto bg-background-primary">
                                    {student.output ? (
                                        <pre className="text-sm text-text-secondary font-mono whitespace-pre-wrap">
                                            {student.output}
                                        </pre>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-text-tertiary text-xs">
                                            No output
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default StudentCodeViewer;
