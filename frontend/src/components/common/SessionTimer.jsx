/**
 * SessionTimer Component
 * Compact countdown timer displayed in the header (left corner)
 * Shows remaining session time in HH:MM:SS format
 * Pulses red when under 5 minutes remaining
 *
 * @param {Object} props
 * @param {number} props.timeRemaining - Remaining time in seconds
 */
import React from 'react';
import { Timer } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Format seconds into HH:MM:SS */
const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
};

const SessionTimer = ({ timeRemaining }) => {
    const isLow = timeRemaining < 300; // Under 5 min
    const isCritical = timeRemaining < 60; // Under 1 min

    return (
        <div
            className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors',
                isCritical
                    ? 'bg-status-error/15 text-status-error animate-pulse-subtle'
                    : isLow
                        ? 'bg-status-warning/15 text-status-warning'
                        : 'bg-background-tertiary text-text-secondary'
            )}
        >
            <Timer className="w-3.5 h-3.5" />
            <span>{formatTime(timeRemaining)}</span>
        </div>
    );
};

export default SessionTimer;
