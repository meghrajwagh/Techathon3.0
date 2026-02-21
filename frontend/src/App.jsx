import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Video, Keyboard, ArrowRight, User, Copy, Check, LogIn, Code2, Sparkles, Zap } from 'lucide-react'
import earthImg from './assets/earth.jpg'
import Waves from './components/Waves'
import ErrorBoundary from './components/common/ErrorBoundary'
import TeacherDashboard from './components/teacher/TeacherDashboard'
import StudentDashboard from './components/student/StudentDashboard'
import useSessionStore from './store/sessionStore'

/**
 * SessionScreen — The "ORCA" Home Page for Creating or Joining a session
 */
const SessionScreen = () => {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [name, setName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [createdId, setCreatedId] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { createSession, joinSession } = useSessionStore();

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    const id = createSession(name.trim());
    setCreatedId(id);
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinId.trim()) {
      setError('Please enter a session ID');
      return;
    }
    joinSession(joinId.trim().toLowerCase(), name.trim());
  };

  const handleCopy = async () => {
    if (createdId) {
      await navigator.clipboard.writeText(createdId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className='min-h-screen bg-black overflow-hidden'>
      <Waves lineColor='rgba(255, 255, 255, 0.15)'>
        <div className='relative bg-transparent h-screen w-full flex items-center justify-center font-sans'>
          <div className='box h-[90%] w-full max-w-[70vw] rounded-[60px] flex items-center overflow-hidden'>

            <div className='section1 h-full w-full md:w-[50%] flex flex-col justify-between p-12 z-10'>
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='flex items-center gap-2 mb-12'
                >
                  <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center'>
                    <Video className='text-black w-6 h-6' />
                  </div>
                  <span className='text-white text-2xl font-bold tracking-tight'>ORCA</span>
                </motion.div>
              </div>

              <div className='flex flex-col gap-8'>
                <AnimatePresence mode="wait">
                  {!mode && !createdId ? (
                    <motion.div
                      key="landing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h1 className='text-white text-5xl font-bold tracking-tight mb-4'>Paste a link or create a meeting.</h1>

                      <div className='flex flex-col gap-5'>
                        <button
                          onClick={() => setMode('create')}
                          className='group w-full bg-white text-black font-bold py-4 px-6 rounded-2xl hover:bg-neutral-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3'
                        >
                          <Plus className='w-5 h-5' />
                          Create New Meeting
                        </button>

                        <div className='flex gap-3'>
                          <div className='relative flex-grow'>
                            <Keyboard className='absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5' />
                            <input
                              type="text"
                              placeholder='Enter meeting code'
                              value={joinId}
                              onChange={(e) => setJoinId(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && setMode('join')}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                          </div>
                          <button
                            onClick={() => setMode('join')}
                            className='bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold py-4 px-10 rounded-2xl border border-white/10 transition-all active:scale-[0.98] min-w-[100px]'
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : mode === 'create' && !createdId ? (
                    <motion.div
                      key="create-form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white/[0.03] border border-white/10 p-8 rounded-[32px] backdrop-blur-md"
                    >
                      <h2 className="text-2xl font-bold text-white mb-2">Create Session</h2>
                      <p className="text-neutral-400 mb-8 font-medium">You'll be the host of this session.</p>

                      <div className="space-y-6">
                        <div>
                          <span className="text-[11px] text-neutral-500 mb-2 block uppercase tracking-[0.2em] font-bold">Your Name</span>
                          <input
                            type="text"
                            placeholder="Type your name..."
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-neutral-600 text-base focus:outline-none focus:border-white/40 transition-all duration-300 font-medium"
                            autoFocus
                          />
                          {error && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-sm text-red-400 mt-2 font-medium"
                            >
                              {error}
                            </motion.p>
                          )}
                        </div>

                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={() => { setMode(null); setError(''); }}
                            className="px-6 py-4 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200 font-bold"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleCreate}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                          >
                            <Plus className="w-5 h-5" />
                            Create Meeting
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : createdId ? (
                    <motion.div
                      key="created"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/[0.03] border border-white/10 p-8 rounded-[32px] backdrop-blur-md text-center"
                    >
                      <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="text-black w-5 h-5" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Meeting Ready!</h2>
                      <p className="text-neutral-400 mb-8">Share this code with others to join.</p>

                      <div className="bg-white/[0.05] border border-white/10 p-6 rounded-2xl mb-8 group cursor-pointer hover:border-white/30 transition-all relative">
                        <span className="text-[11px] text-neutral-500 mb-1 block uppercase tracking-[0.2em] font-bold">Meeting Code</span>
                        <div className='flex items-center justify-center gap-3'>
                          <span className="text-3xl font-mono font-bold text-white tracking-widest">{createdId}</span>
                          <button
                            onClick={handleCopy}
                            className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                          >
                            {copied ? <Check className='w-5 h-5 text-green-400' /> : <Copy className='w-5 h-5 text-neutral-400' />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-all"
                      >
                        Enter Meeting
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="join-form"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                      className="bg-white/[0.03] border border-white/10 p-8 rounded-[32px] backdrop-blur-md"
                    >
                      <h2 className="text-2xl font-bold text-white mb-2">Join Session</h2>
                      <p className="text-neutral-400 mb-8 font-medium">Enter the session ID shared by your host.</p>

                      <div className="space-y-6">
                        <div>
                          <span className="text-[11px] text-neutral-500 mb-2 block uppercase tracking-[0.2em] font-bold">Your Name</span>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                              type="text"
                              placeholder="Enter your name"
                              value={name}
                              onChange={(e) => { setName(e.target.value); setError(''); }}
                              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-neutral-600 text-base focus:outline-none focus:border-white/40 transition-all duration-300 font-medium"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-neutral-500 mb-2 block uppercase tracking-[0.2em] font-bold">Session ID</span>
                          <input
                            type="text"
                            placeholder="e.g. abc-x2f-9kp"
                            value={joinId}
                            onChange={(e) => { setJoinId(e.target.value); setError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-neutral-600 text-base font-mono focus:outline-none focus:border-white/40 transition-all duration-300 tracking-widest"
                          />
                        </div>

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-400 font-medium"
                          >
                            {error}
                          </motion.p>
                        )}

                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={() => { setMode(null); setError(''); }}
                            className="px-6 py-4 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200 font-bold"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleJoin}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                          >
                            <ArrowRight className="w-5 h-5" />
                            Join Session
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className='flex items-center gap-6 text-neutral-500 text-xs font-bold tracking-widest uppercase'>
                <span>Privacy</span>
                <span>Terms</span>
                <span>Contact</span>
              </div>
            </div>

            {/* Right Section - Image */}
            <div className='relative hidden md:block section1 h-[95%] w-[48%] rounded-[48px] overflow-hidden mr-4'>
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10' />
              <img src={earthImg} alt="Atmospheric View" className='absolute h-full w-full object-cover grayscale-[0.2]' />
              <div className='absolute bottom-10 left-10 z-20'>
              </div>
            </div>

          </div>
        </div>
      </Waves>
    </div>
  )
}

/**
 * Main App Component — Swaps between SessionScreen and Dashboards
 */
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
