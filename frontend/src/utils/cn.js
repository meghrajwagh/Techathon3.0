/**
 * cn - Tailwind class name merger
 * Combines clsx for conditional classes with tailwind-merge
 * to properly handle Tailwind CSS class conflicts
 *
 * @param {...(string|Object|Array)} inputs - Class names, objects, or arrays
 * @returns {string} Merged class string with conflicts resolved
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
 * // Returns: 'py-2 px-6 bg-blue-500' (px-6 wins over px-4)
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
