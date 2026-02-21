/**
 * Header Component
 * Top navigation bar with:
 *  - Session timer (left corner)
 *  - Logo + session ID
 *  - Connection status + Student panel trigger (host only)
 *
 * @param {Object} props
 * @param {'host'|'participant'} props.role - Current user role
 * @param {boolean} props.isConnected - WebSocket connection status
 * @param {Function} props.onOpenStudentPanel - Open student panel (host only)
 * @param {string} props.promotedStudentName - Name of promoted student (if any)
 * @param {Function} props.onLeaveSession - Leave / end session
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Code2, Wifi, WifiOff, Users, Monitor,
    LogOut, Copy, Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Badge from '@/components/common/Badge';
import SessionTimer from '@/components/common/SessionTimer';
import useSessionStore from '@/store/sessionStore';

const Header = ({
    role,
    isConnected = true,
    onOpenStudentPanel,
    promotedStudentName,
    onLeaveSession,
}) => {
    const { sessionId, timeRemaining } = useSessionStore();
    const [copied, setCopied] = useState(false);

    /** Copy session ID to clipboard */
    const handleCopyId = async () => {
        if (sessionId) {
            await navigator.clipboard.writeText(sessionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
    <header className="flex items-center justify-between h-12 px-4 bg-background-secondary border-b border-white/[0.04] shrink-0">
        
        {/* LEFT: Timer + Logo + Role + Participants */}
        <div className="flex items-center gap-3">
            {/* Session timer */}
            <SessionTimer timeRemaining={timeRemaining} />

            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm font-semibold text-white tracking-tight">
                    Bootcamp IDE
                </span>
            </div>

            {/* Role badge */}
            <Badge variant={role === 'host' ? 'purple' : 'blue'}>
                {role === 'host' ? '🎯 Host' : '👨‍🎓 Participant'}
            </Badge>

            {/* Participants button (moved here) */}
            {role === 'host' && onOpenStudentPanel && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenStudentPanel}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue transition-colors"
                    aria-label="Open student panel"
                >
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">Participants</span>
                </motion.button>
            )}
        </div>

        {/* CENTER: Session ID + Sharing indicator */}
        <div className="flex items-center gap-3">
            {sessionId && (
                <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 text-xs font-mono transition-colors"
                    title="Click to copy session ID"
                >
                    <span className="tracking-wider">{sessionId}</span>
                    {copied ? (
                        <Check className="w-3 h-3 text-green-500" />
                    ) : (
                        <Copy className="w-3 h-3 text-neutral-500" />
                    )}
                </button>
            )}

            {promotedStudentName && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800"
                >
                    <Monitor className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-blue-500 font-medium">
                        Sharing: {promotedStudentName}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-subtle" />
                </motion.div>
            )}
        </div>

        {/* RIGHT: Connection + Leave */}
        <div className="flex items-center gap-2">
            {/* Connection status */}
            <div
                className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium',
                    isConnected
                        ? 'text-status-success bg-status-success/10'
                        : 'text-status-error bg-status-error/10'
                )}
            >
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isConnected ? 'Connected' : 'Offline'}
            </div>

            {/* Leave session */}
            <button
                onClick={onLeaveSession}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-status-error/70 hover:text-status-error hover:bg-status-error/10 transition-colors"
                aria-label="Leave session"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
            </button>
        </div>
    </header>
);
};

export default Header;
