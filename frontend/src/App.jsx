/**
 * App Component - Root application shell
 *
 * Session-based flow (like Google Meet):
 *   1. Landing screen → Create Session or Join Session
 *   2. Creator becomes "host" (teacher), gets a unique session ID to share
 *   3. Others enter the session ID to join as "participant" (student)
 *   4. A 1-hour countdown timer runs for the session
 *
 * Wrapped in ErrorBoundary for graceful error handling.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, Sparkles, Zap, Plus, LogIn,
    Copy, Check, ArrowRight, User,
} from 'lucide-react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
import StudentDashboard from '@/components/student/StudentDashboard';
import useSessionStore from '@/store/sessionStore';

// ============================================================
// SessionScreen — Create or Join a session
// ============================================================

const SessionScreen = () => {
    const [mode, setMode] = useState(null); // null | 'create' | 'join'
    const [name, setName] = useState('');
    const [joinId, setJoinId] = useState('');
    const [createdId, setCreatedId] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const { createSession, joinSession } = useSessionStore();

    /** Handle creating a new session */
    const handleCreate = useCallback(() => {
        if (!name.trim()) { setError('Please enter your name'); return; }
        const id = createSession(name.trim());
        setCreatedId(id);
    }, [name, createSession]);

    /** Copy session ID to clipboard */
    const handleCopy = useCallback(async () => {
        if (createdId) {
            await navigator.clipboard.writeText(createdId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [createdId]);

    /** Handle joining an existing session */
    const handleJoin = useCallback(() => {
        if (!name.trim()) { setError('Please enter your name'); return; }
        if (!joinId.trim()) { setError('Please enter a session ID'); return; }
        setError('');
        joinSession(joinId.trim().toLowerCase(), name.trim());
    }, [name, joinId, joinSession]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background-primary relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* Logo + Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center mb-10 relative"
            >
                <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-float-lg"
                >
                    <Code2 className="w-8 h-8 text-black" />
                </motion.div>

                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    Bootcamp IDE
                </h1>
                <p className="text-neutral-500 text-sm flex items-center gap-2">
                    Minimalist Refinement
                </p>
            </motion.div>

            {/* Session flow */}
            <AnimatePresence mode="wait">
                {/* ---- Step 1: Choose Create or Join ---- */}
                {!mode && !createdId && (
                    <motion.div
                        key="choose"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-5 relative"
                    >
                        {/* Create Session Card */}
                        <motion.button
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => { setMode('create'); setError(''); }}
                            className="group relative w-64 p-7 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 text-left overflow-hidden"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
                                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)' }}
                            />
                            <div className="relative w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                                <Plus className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="relative text-lg font-semibold text-white mb-1.5">Create Session</h3>
                            <p className="relative text-sm text-neutral-500 leading-relaxed">
                                Start a new coding session.
                            </p>
                            <div className="relative mt-5 flex items-center gap-2 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                <span>Start</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </motion.button>

                        {/* Join Session Card */}
                        <motion.button
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => { setMode('join'); setError(''); }}
                            className="group relative w-64 p-7 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 text-left overflow-hidden"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
                                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)' }}
                            />
                            <div className="relative w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                                <LogIn className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="relative text-lg font-semibold text-white mb-1.5">Join Session</h3>
                            <p className="relative text-sm text-neutral-500 leading-relaxed">
                                Enter an existing session ID.
                            </p>
                            <div className="relative mt-5 flex items-center gap-2 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                <span>Enter</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </motion.button>
                    </motion.div>
                )}

                {/* ---- Step 2a: Create Session Form ---- */}
                {mode === 'create' && !createdId && (
                    <motion.div
                        key="create-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-96 p-8 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl relative"
                    >
                        <h2 className="text-lg font-semibold text-white mb-1">Create Session</h2>
                        <p className="text-sm text-neutral-500 mb-6">You'll act as the host.</p>

                        {/* Name input */}
                        <label className="block mb-6">
                            <span className="text-xs text-neutral-400 mb-2 block uppercase tracking-wider font-semibold">Your Name</span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    className="w-full px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-white transition-colors"
                                    autoFocus
                                />
                            </div>
                        </label>

                        {/* Error */}
                        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setMode(null); setError(''); }}
                                className="px-4 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-sm font-semibold transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Session
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ---- Step 2b: Session Created — Show ID ---- */}
                {createdId && (
                    <motion.div
                        key="created"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-96 p-8 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center relative"
                    >
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                            <Check className="w-6 h-6 text-black" />
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-2">Session Created</h2>
                        <p className="text-sm text-neutral-500 mb-6">Share this ID with participants:</p>

                        {/* Session ID display */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className="px-5 py-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xl font-bold text-white tracking-widest select-all">
                                {createdId}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="p-3.5 rounded-lg bg-neutral-800 hover:bg-white hover:text-black text-neutral-400 transition-colors"
                                aria-label="Copy session ID"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>

                        {copied && (
                            <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-green-500 mb-4 font-medium"
                            >
                                Copied to clipboard
                            </motion.p>
                        )}
                    </motion.div>
                )}



                {/* ---- Step 2c: Join Session Form ---- */}
                {mode === 'join' && (
                    <motion.div
                        key="join-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-96 p-8 rounded-2xl bg-background-secondary border border-white/[0.04] shadow-float-lg relative"
                    >
                        <h2 className="text-lg font-semibold text-text-primary mb-1">Join Session</h2>
                        <p className="text-sm text-text-tertiary mb-6">Enter the session ID shared by your host.</p>

                        {/* Name input */}
                        <label className="block mb-4">
                            <span className="text-xs text-text-secondary mb-1.5 block">Your Name</span>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-tertiary text-text-primary placeholder:text-text-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-shadow"
                                    autoFocus
                                />
                            </div>
                        </label>

                        {/* Session ID input */}
                        <label className="block mb-4">
                            <span className="text-xs text-text-secondary mb-1.5 block">Session ID</span>
                            <input
                                type="text"
                                placeholder="e.g. abc-x2f-9kp"
                                value={joinId}
                                onChange={(e) => { setJoinId(e.target.value); setError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                className="w-full px-4 py-2.5 rounded-lg bg-background-tertiary text-text-primary placeholder:text-text-tertiary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-shadow tracking-wider"
                            />
                        </label>

                        {/* Error */}
                        {error && <p className="text-xs text-status-error mb-3">{error}</p>}

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setMode(null); setError(''); }}
                                className="px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleJoin}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue/80 text-white text-sm font-medium transition-colors"
                            >
                                <ArrowRight className="w-4 h-4" />
                                Join Session
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-6 text-[11px] text-text-tertiary/50"
            >
                Sessions last 1 hour • Mock mode (no server required)
            </motion.p>
        </div >
    );
};

// ============================================================
// Main App
// ============================================================

const App = () => {
    const { sessionId, role, isActive, endSession } = useSessionStore();

    /** Whether user is in an active session */
    const inSession = sessionId && role && isActive;

    return (
        <ErrorBoundary>
            <AnimatePresence mode="wait">
                {!inSession ? (
                    <motion.div
                        key="session-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                    >
                        <SessionScreen />
                    </motion.div>
                ) : role === 'host' ? (
                    <motion.div
                        key="host"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-screen"
                    >
                        <TeacherDashboard onBackToRoleSelect={endSession} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="participant"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-screen"
                    >
                        <StudentDashboard onBackToRoleSelect={endSession} />
                    </motion.div>
                )}
            </AnimatePresence>
        </ErrorBoundary>
    );
};

export default App;
