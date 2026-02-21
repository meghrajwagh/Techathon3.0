/**
 * Button Component
 * Reusable button with multiple variants, sizes, and states
 * Features subtle hover animations via Framer Motion
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'} props.variant - Visual style
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {React.ReactNode} props.icon - Optional leading icon
 * @param {boolean} props.loading - Shows spinner when true
 * @param {boolean} props.disabled - Disables the button
 * @param {React.ReactNode} props.children - Button label
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const VARIANT_STYLES = {
    primary: 'bg-accent-blue hover:bg-accent-blue/80 text-white shadow-float',
    secondary: 'bg-background-tertiary hover:bg-background-primary text-text-secondary hover:text-text-primary',
    ghost: 'bg-transparent hover:bg-background-tertiary text-text-secondary hover:text-text-primary',
    danger: 'bg-status-error/10 hover:bg-status-error/20 text-status-error',
    success: 'bg-status-success/10 hover:bg-status-success/20 text-status-success',
};

const SIZE_STYLES = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
};

const Button = ({
    variant = 'secondary',
    size = 'md',
    icon,
    loading = false,
    disabled = false,
    children,
    className,
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-accent-blue/50',
                VARIANT_STYLES[variant],
                SIZE_STYLES[size],
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : icon ? (
                <span className="shrink-0">{icon}</span>
            ) : null}
            {children}
        </motion.button>
    );
};

export default Button;
