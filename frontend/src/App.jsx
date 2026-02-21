/**
 * App Component - Root application shell
 * Landing UI upgraded (ORCA design)
 * Original session logic preserved
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
import StudentDashboard from '@/components/student/StudentDashboard';
import useSessionStore from '@/store/sessionStore';
import { useSocketConnection } from '@/hooks/useSocketConnection';

import Waves from '@/components/Waves';
import earthImg from '@/assets/earth.jpg';

// ============================================================
// SessionScreen — ORCA Landing UI (logic preserved)
// ============================================================

const SessionScreen = () => {
    const [name, setName] = useState('');
    const [joinId, setJoinId] = useState('');
    const [error, setError] = useState('');

    const { createSession, joinSession } = useSessionStore();

    const handleCreate = useCallback(() => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        setError('');
        createSession(name.trim());
    }, [name, createSession]);

    const handleJoin = useCallback(() => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!joinId.trim()) {
            setError('Please enter a session code');
            return;
        }
        setError('');
        joinSession(joinId.trim().toLowerCase(), name.trim());
    }, [name, joinId, joinSession]);

    return (
        <Waves lineColor="rgba(255,255,255,0.15)">
            <div className="relative bg-transparent h-screen w-full flex items-center justify-center font-sans">
                <div className="absolute h-[80vh] w-[85vw] rounded-[60px] flex items-center overflow-hidden">

                    {/* LEFT SECTION */}
                    <div className="h-full w-1/2 rounded-[60px] flex flex-col justify-between items-start p-16">

                        <div className="w-full">
                            <span className="text-white text-3xl font-bold tracking-tighter">
                                ORCA
                            </span>
                        </div>

                        <div className="flex flex-col items-start gap-8 w-full max-w-md">

                            <div className="space-y-4">
                                <h1 className="text-white text-5xl font-bold tracking-tight leading-tight">
                                    Collaborative Coding Redefined
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    Start a secure meeting or join your team in seconds.
                                </p>
                            </div>

                            <div className="w-full space-y-4 pt-4">

                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-gray-500 text-xs font-semibold uppercase tracking-widest px-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Enter your name"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-all text-lg"
                                    />
                                </div>

                                {/* Error */}
                                {error && (
                                    <p className="text-red-400 text-sm">{error}</p>
                                )}

                                {/* Create Button */}
                                <button
                                    onClick={handleCreate}
                                    className="w-full bg-white text-black font-bold py-4 px-8 rounded-2xl hover:bg-gray-200 transition-all text-lg shadow-xl shadow-white/5 active:scale-[0.97]"
                                >
                                    Create New Meeting
                                </button>

                                {/* Divider */}
                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="mx-4 text-gray-600 text-xs font-bold uppercase tracking-widest">
                                        or join session
                                    </span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                {/* Join Section */}
                                <div className="space-y-3">
                                    <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-[22px] backdrop-blur-md">
                                        <input
                                            type="text"
                                            value={joinId}
                                            onChange={(e) => {
                                                setJoinId(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Paste meeting link or code"
                                            className="flex-1 bg-transparent border-none py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none text-base"
                                        />
                                        <button
                                            onClick={handleJoin}
                                            className="bg-white text-black font-extrabold py-4 px-8 rounded-[18px] hover:bg-gray-200 transition-all whitespace-nowrap shadow-lg active:scale-[0.95]"
                                        >
                                            Join Now
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="text-gray-600 text-xs font-medium">
                            &copy; 2026 ORCA Labs. All rights reserved.
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="relative h-full w-1/2 p-6">
                        <div className="relative h-full w-full rounded-[45px] overflow-hidden border border-white/10">
                            <img
                                src={earthImg}
                                alt="ORCA Environment"
                                className="absolute h-full w-full object-cover transition-transform duration-[20s] hover:scale-110 ease-linear"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-10 left-10">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-white text-xs font-medium">
                                        System Online
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Waves>
    );
};

// ============================================================
// Main App (UNCHANGED LOGIC)
// ============================================================

const App = () => {
    const { sessionId, role, isActive, endSession } = useSessionStore();

    // Initialize socket connection
    useSocketConnection();

    const inSession = sessionId && role && isActive;

    // Debug logging
    console.log('[APP] Render - sessionId:', sessionId, 'role:', role, 'isActive:', isActive, 'inSession:', inSession);

    return (
        <ErrorBoundary>
            <AnimatePresence mode="wait">
                {!inSession ? (
                    <motion.div
                        key="landing"
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