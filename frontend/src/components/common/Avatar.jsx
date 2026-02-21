/**
 * Avatar Component
 * Displays user avatar with initials fallback and online status indicator
 *
 * @param {Object} props
 * @param {string} props.name - User's display name (used for initials)
 * @param {boolean} props.isOnline - Whether user is currently online
 * @param {'sm'|'md'|'lg'} props.size - Avatar size
 * @param {string} props.className - Additional classes
 */
import React from 'react';
import { cn } from '@/utils/cn';

const SIZE_MAP = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
};

const STATUS_SIZE_MAP = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
};

/** Extract initials from a full name (max 2 chars) */
const getInitials = (name) =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

const Avatar = ({ name, isOnline, size = 'md', className }) => {
    return (
        <div className={cn('relative inline-flex', className)}>
            {/* Avatar circle with gradient */}
            <div
                className={cn(
                    'rounded-full bg-gradient-to-br from-accent-blue to-accent-purple',
                    'flex items-center justify-center font-semibold text-white',
                    'shadow-inner-glow',
                    SIZE_MAP[size]
                )}
            >
                {getInitials(name)}
            </div>

            {/* Online status dot */}
            {typeof isOnline === 'boolean' && (
                <span
                    className={cn(
                        'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background-secondary',
                        STATUS_SIZE_MAP[size],
                        isOnline
                            ? 'bg-status-success animate-status-pulse'
                            : 'bg-text-tertiary'
                    )}
                    aria-label={isOnline ? 'Online' : 'Offline'}
                />
            )}
        </div>
    );
};

export default Avatar;
