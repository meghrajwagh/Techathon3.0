/**
 * Badge Component
 * Small status indicator badges with various color variants
 *
 * @param {Object} props
 * @param {'blue'|'green'|'yellow'|'red'|'purple'|'gray'} props.variant - Color variant
 * @param {React.ReactNode} props.icon - Optional leading icon
 * @param {React.ReactNode} props.children - Badge text
 */
import React from 'react';
import { cn } from '@/utils/cn';

const VARIANT_STYLES = {
    blue: 'bg-transparent border border-neutral-800 text-neutral-300',
    green: 'bg-transparent border border-green-900/30 text-green-500',
    yellow: 'bg-transparent border border-yellow-900/30 text-yellow-500',
    red: 'bg-transparent border border-red-900/30 text-red-500',
    purple: 'bg-transparent border border-neutral-700 text-white', // Host style
    gray: 'bg-transparent border border-neutral-800 text-neutral-500',
};

const Badge = ({ variant = 'blue', icon, children, className }) => {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
                VARIANT_STYLES[variant],
                className
            )}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
