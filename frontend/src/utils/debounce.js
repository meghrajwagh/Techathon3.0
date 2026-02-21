/**
 * debounce - Delays invocation of a function until after a wait period
 * Useful for limiting rate of code sync and auto-save operations
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - Milliseconds to delay
 * @returns {Function} Debounced function with .cancel() method
 */
export function debounce(func, wait) {
    let timeoutId = null;

    const debounced = (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, wait);
    };

    /** Cancel any pending invocation */
    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced;
}

/**
 * throttle - Ensures a function is called at most once per interval
 *
 * @param {Function} func - The function to throttle
 * @param {number} limit - Minimum milliseconds between invocations
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle = false;

    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
