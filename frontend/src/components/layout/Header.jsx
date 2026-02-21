/**
 * Header Component
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

    const handleCopyId = async () => {
        if (sessionId) {
            await navigator.clipboard.writeText(sessionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
    <header className="flex items-center justify-between h-16 px-6 bg-background-secondary border-b border-white/[0.06] shadow-md shrink-0">

        {/* LEFT */}
        <div className="flex items-center gap-5">

            <SessionTimer timeRemaining={timeRemaining} />

            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow">
                    <Code2 className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                    Bootcamp IDE
                </span>
            </div>

            <Badge variant={role === 'host' ? 'purple' : 'blue'}>
                {role === 'host' ? '🎯 Host' : '👨‍🎓 Participant'}
            </Badge>

            {role === 'host' && onOpenStudentPanel && (
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenStudentPanel}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue font-semibold text-sm transition-all shadow-sm"
                >
                    <Users className="w-5 h-5" />
                    Participants
                </motion.button>
            )}
        </div>

        {/* CENTER */}
        <div className="flex items-center gap-4">
            {sessionId && (
                <button
                    onClick={handleCopyId}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-sm font-mono transition-all"
                >
                    <span className="tracking-wider">{sessionId}</span>
                    {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4 text-neutral-500" />
                    )}
                </button>
            )}

            {promotedStudentName && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30"
                >
                    <Monitor className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400 font-semibold">
                        Sharing: {promotedStudentName}
                    </span>
                </motion.div>
            )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
            <div
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold',
                    isConnected
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-red-400 bg-red-500/10'
                )}
            >
                {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {isConnected ? 'Connected' : 'Offline'}
            </div>

            <button
                onClick={onLeaveSession}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
            >
                <LogOut className="w-4 h-4" />
                Leave
            </button>
        </div>
    </header>
);
};

export default Header;