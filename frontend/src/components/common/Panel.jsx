/**
 * Panel Component
 * Floating panel wrapper providing consistent Antigravity styling
 * Used as a container for editor, output, modals, etc.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Panel content
 * @param {string} props.className - Additional classes
 * @param {boolean} props.glass - Use glass morphism effect
 * @param {boolean} props.noPadding - Remove default padding
 */
import React from 'react';
import { cn } from '@/utils/cn';

const Panel = ({
    children,
    className,
    glass = false,
    noPadding = false,
    ...props
}) => {
    return (
        <div
            className={cn(
                'rounded-xl shadow-float',
                'border border-white/[0.04]',
                glass
                    ? 'glass'
                    : 'bg-background-secondary',
                !noPadding && 'p-4',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Panel;
