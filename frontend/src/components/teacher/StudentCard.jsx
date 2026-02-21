/**
 * StudentCard Component
 * Displays individual student information in the teacher's student panel
 * Features avatar, online status, action buttons (view, edit, share)
 *
 * @param {Object} props
 * @param {Object} props.student - Student data object
 * @param {string} props.student.id - Unique student identifier
 * @param {string} props.student.name - Student's display name
 * @param {boolean} props.student.isOnline - Connection status
 * @param {string} props.student.lastActivity - Last activity timestamp
 * @param {string} props.student.outputPreview - Preview of student's output
 * @param {Function} props.onViewCode - Callback when "View Code" is clicked
 * @param {Function} props.onEditCode - Callback when "Edit Code" is clicked
 * @param {Function} props.onPromote - Callback when "Promote" is clicked
 * @param {boolean} props.isPromoted - Whether this student's view is currently shared
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Monitor } from 'lucide-react';
import { cn } from '@/utils/cn';
import Avatar from '@/components/common/Avatar';

const StudentCard = ({
    student,
    onViewCode,
    onEditCode,
    onPromote,
    isPromoted = false,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                'relative p-4 rounded-lg transition-all duration-200',
                'bg-background-secondary hover:bg-background-tertiary',
                'shadow-float hover:shadow-float-lg',
                'border border-transparent',
                isPromoted && 'border-accent-blue bg-accent-blue/10'
            )}
        >
            {/* Header: Avatar + Name + Status */}
            <div className="flex items-center gap-3 mb-3">
                <Avatar name={student.name} isOnline={student.isOnline} size="md" />

                {/* Name and activity */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                        {student.name}
                    </h3>
                    <p className="text-xs text-text-tertiary">
                        {student.lastActivity}
                    </p>
                </div>

                {/* Promoted badge */}
                {isPromoted && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-blue/20 text-accent-blue text-xs font-medium">
                        <Monitor className="w-3 h-3" />
                        <span>Shared</span>
                    </div>
                )}
            </div>

            {/* Output preview (collapsible) */}
            {student.outputPreview && (
                <div className="mb-3 p-2 rounded bg-background-primary text-xs text-text-secondary font-mono overflow-hidden">
                    <div className="line-clamp-2">{student.outputPreview}</div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onViewCode(student)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-background-tertiary hover:bg-background-primary text-text-secondary hover:text-text-primary transition-colors text-sm"
                    aria-label={`View ${student.name}'s code`}
                >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                </button>

                <button
                    onClick={() => onEditCode(student)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-background-tertiary hover:bg-background-primary text-text-secondary hover:text-text-primary transition-colors text-sm"
                    aria-label={`Edit ${student.name}'s code`}
                >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                </button>

                <button
                    onClick={() => onPromote(student)}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm',
                        isPromoted
                            ? 'bg-accent-blue text-white hover:bg-accent-blue/80'
                            : 'bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30'
                    )}
                    aria-label={`Promote ${student.name}'s view to classroom`}
                >
                    <Monitor className="w-4 h-4" />
                    <span>{isPromoted ? 'Shared' : 'Share'}</span>
                </button>
            </div>
        </motion.div>
    );
};

export default StudentCard;
