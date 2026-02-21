/**
 * Header Component — Minimal top bar
 */

import React, { useState } from 'react';
import {
    Wifi, WifiOff, Users, LogOut, Copy, Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import useSessionStore from '@/store/sessionStore';

const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
};

const Header = ({
    role,
    isConnected = true,
    onOpenStudentPanel,
    onLeaveSession,
}) => {
    const { sessionId, timeRemaining } = useSessionStore();
    const [copied, setCopied] = useState(false);

    const isLow = timeRemaining < 300;
    const isCritical = timeRemaining < 60;

    const handleCopyId = async () => {
        if (sessionId) {
            await navigator.clipboard.writeText(sessionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <header className="flex items-center justify-between h-11 px-4 bg-[#0c0c0c] border-b border-white/[0.06] shrink-0 select-none">

            {/* LEFT */}
            <div className="flex items-center gap-3">
                {/* Timer */}
                <div className={cn(
                    'flex items-center gap-1.5 tabular-nums text-[11px] font-mono font-medium tracking-wide',
                    isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-neutral-500'
                )}>
                    <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isCritical ? 'bg-red-500 animate-pulse' : isLow ? 'bg-amber-500' : 'bg-neutral-600'
                    )} />
                    {formatTime(timeRemaining)}
                </div>

                <div className="w-px h-4 bg-white/[0.06]" />

                {/* Brand */}
                <span className="text-[13px] font-semibold text-white tracking-tight">
                    ORCA
                </span>

                {/* Role pill */}
                <span className={cn(
                    'text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded',
                    role === 'host'
                        ? 'text-white/70 bg-white/[0.06]'
                        : 'text-blue-400/80 bg-blue-500/[0.08]'
                )}>
                    {role === 'host' ? 'Host' : 'Student'}
                </span>

                {/* Participants button (host only) */}
                {role === 'host' && onOpenStudentPanel && (
                    <button
                        onClick={onOpenStudentPanel}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Students</span>
                    </button>
                )}
            </div>

            {/* CENTER — Session ID */}
            <div className="flex items-center">
                {sessionId && (
                    <button
                        onClick={handleCopyId}
                        className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-neutral-400 text-[11px] font-mono transition-all"
                    >
                        <span className="tracking-widest">{sessionId}</span>
                        {copied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                            <Copy className="w-3 h-3 opacity-40" />
                        )}
                    </button>
                )}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
                {/* Connection indicator */}
                <div className={cn(
                    'flex items-center gap-1.5 text-[11px] font-medium',
                    isConnected ? 'text-emerald-500/80' : 'text-red-400/80'
                )}>
                    {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
                </div>

                <div className="w-px h-4 bg-white/[0.06]" />

                <button
                    onClick={onLeaveSession}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                >
                    <LogOut className="w-3 h-3" />
                    Leave
                </button>
            </div>
        </header>
    );
};

export default Header;