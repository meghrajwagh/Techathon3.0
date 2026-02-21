/**
 * TeacherDashboard Component
 */

import React, { useCallback, useEffect, useState, useRef } from "react";
import useEditorStore from "@/store/editorStore";
import useTeacherStore from "@/store/teacherStore";
import useSocketStore from "@/store/socketStore";
import socketService from "@/services/socketService";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTeacherSocket } from "@/hooks/useTeacherSocket";

import Header from "@/components/layout/Header";
import EditorHeader from "@/components/editor/EditorHeader";
import EditorToolbar from "@/components/editor/EditorToolbar";
import CodeEditor from "@/components/editor/CodeEditor";
import OutputPanel from "@/components/terminal/OutputPanel";
import StudentPanel from "@/components/teacher/StudentPanel";

import { motion, AnimatePresence } from "framer-motion";

const TeacherDashboard = ({ onBackToRoleSelect }) => {
  // Initialize teacher socket listeners
  useTeacherSocket();

  const {
    code,
    language,
    fontSize,
    showMinimap,
    tabs,
    setCode,
    setLanguage,
    setFontSize,
  } = useEditorStore();

  const {
    students,
    isPanelOpen,
    promotedStudentId,
    selectedStudent,
    openPanel,
    closePanel,
    selectStudent,
    controlledStudentId,
    takeControl,
    releaseControl,
    updateStudentCode,
    promoteStudent, // 🔥 added
  } = useTeacherStore();

  const { isConnected } = useSocketStore();

  const [isTeacherVisible, setIsTeacherVisible] = useState(true);

  // Send initial code to students when component mounts or when students join
  useEffect(() => {
    if (isConnected && code) {
      console.log('[TEACHER] Sending initial code to students:', code.substring(0, 50));
      socketService.emit('teacher_code_change', { code });
    }
  }, [isConnected, students.length]); // Send when connected or when student count changes

  // 🔥 Split logic
  const [splitRatio, setSplitRatio] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newRatio = (offsetX / rect.width) * 100;
    if (newRatio > 20 && newRatio < 80) {
      setSplitRatio(newRatio);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const { runCode, output, error, isRunning, clearOutput } = useCodeExecution();

  const handleRunCode = useCallback(() => {
    runCode(code, language);
  }, [code, language, runCode]);

  // Broadcast teacher's output to students when it changes
  useEffect(() => {
    if (isConnected && (output || error)) {
      console.log('[TEACHER] Broadcasting output to students');
      socketService.emit('teacher_output', { output, error });
    }
  }, [output, error, isConnected]);

  // Handle teacher code changes and broadcast to students
  const handleTeacherCodeChange = useCallback((newCode) => {
    setCode(newCode);
    // Broadcast teacher's code to all students in the room
    socketService.emit('teacher_code_change', {
      code: newCode
    });
  }, [setCode]);

  useKeyboardShortcuts({
    onRun: handleRunCode,
    onSave: () => console.log("[CODE] Auto-saved"),
    onTogglePanel: () => (isPanelOpen ? closePanel() : openPanel()),
  });

  // Don't auto-select students - let teacher choose manually
  // useEffect(() => {
  //   if (students.length > 0 && !selectedStudent) {
  //     selectStudent(students[0]);
  //   }
  // }, [students, selectedStudent, selectStudent]);

  const isControlling =
    selectedStudent && controlledStudentId === selectedStudent.id;

  return (
    <div className="flex flex-col h-screen bg-background-primary">
      <Header
        role="host"
        isConnected={isConnected}
        onOpenStudentPanel={openPanel}
        onLeaveSession={onBackToRoleSelect}
      />

      <EditorHeader
        language={language}
        onLanguageChange={setLanguage}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        tabs={tabs}
      />

      <EditorToolbar
        onRun={handleRunCode}
        isRunning={isRunning}
        language={language}
        onToggleTeacher={() => setIsTeacherVisible((prev) => !prev)}
        isTeacherVisible={isTeacherVisible}
      />

      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        {/* Teacher's editor - full width when no student selected, split when student is selected */}
        <AnimatePresence>
          {isTeacherVisible && (
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="flex flex-col border-r border-white/[0.04]"
              style={{ width: selectedStudent ? `${splitRatio}%` : "100%" }}
            >
              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={code}
                  onChange={handleTeacherCodeChange}
                  language={language}
                  fontSize={fontSize}
                  showMinimap={showMinimap}
                />
              </div>

              <div className="h-48 shrink-0 border-t border-white/[0.04]">
                <OutputPanel
                  output={output}
                  error={error}
                  isRunning={isRunning}
                  onClear={clearOutput}
                  className="h-full rounded-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draggable divider - only visible when viewing a student */}
        {isTeacherVisible && selectedStudent && (
          <div
            onMouseDown={handleMouseDown}
            className="w-1 cursor-col-resize bg-white/[0.05] hover:bg-accent-blue transition-colors"
          />
        )}

        {/* Student panel - only shown when a student is selected */}
        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isTeacherVisible ? `${100 - splitRatio}%` : "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col bg-background-secondary overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-background-primary shadow-sm">
                <span className="text-base font-semibold text-white">
                  Viewing: {selectedStudent.name}
                </span>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => promoteStudent(selectedStudent.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${promotedStudentId === selectedStudent.id
                      ? "bg-accent-blue text-white shadow-md"
                      : "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30"
                      }`}
                  >
                    {promotedStudentId === selectedStudent.id ? "Shared" : "Share"}
                  </button>

                  {isControlling ? (
                    <button
                      onClick={releaseControl}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      Give Back Control
                    </button>
                  ) : (
                    <button
                      onClick={() => takeControl(selectedStudent.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => selectStudent(null)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/[0.06] text-text-secondary hover:bg-white/[0.1] hover:text-text-primary transition-all"
                    title="Close student view"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={selectedStudent.code}
                  onChange={
                    isControlling
                      ? (val) =>
                        updateStudentCode(selectedStudent.id, val)
                      : undefined
                  }
                  language={language}
                  fontSize={fontSize}
                  showMinimap={showMinimap}
                  readOnly={!isControlling}
                />
              </div>

              <div className="h-48 shrink-0 border-t border-white/[0.04]">
                <OutputPanel
                  output={selectedStudent.output}
                  error={selectedStudent.error}
                  isRunning={false}
                  onClear={() => { }}
                  className="h-full rounded-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StudentPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        students={students}
        onViewCode={() => { }}
        onEditCode={selectStudent}
        onPromoteStudent={promoteStudent}
        promotedStudentId={promotedStudentId}
      />
    </div>
  );
};

export default TeacherDashboard;