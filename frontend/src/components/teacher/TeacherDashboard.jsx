/**
 * TeacherDashboard — Host view
 * Clean, IDE-like layout with resizable panels.
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
import CodeEditor from "@/components/editor/CodeEditor";
import OutputPanel from "@/components/terminal/OutputPanel";
import StudentPanel from "@/components/teacher/StudentPanel";

import { motion, AnimatePresence } from "framer-motion";

const TeacherDashboard = ({ onBackToRoleSelect }) => {
  useTeacherSocket();

  const {
    code, language, fontSize, showMinimap, tabs,
    setCode, setLanguage, setFontSize,
  } = useEditorStore();

  const {
    students, isPanelOpen, promotedStudentId, selectedStudent,
    openPanel, closePanel, selectStudent,
    controlledStudentId, takeControl, releaseControl,
    updateStudentCode, promoteStudent,
  } = useTeacherStore();

  const { isConnected } = useSocketStore();
  const [isTeacherVisible, setIsTeacherVisible] = useState(true);

  // Send code to students when they join
  useEffect(() => {
    if (isConnected && code) {
      socketService.emit('teacher_code_change', { code });
    }
  }, [isConnected, students.length]);

  // ── Horizontal split ──
  const [splitRatio, setSplitRatio] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const r = ((e.clientX - rect.left) / rect.width) * 100;
    if (r > 20 && r < 80) setSplitRatio(r);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isDraggingTerminal.current = false;
    isDraggingStudentTerminal.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // ── Vertical terminal resize (teacher) ──
  const [terminalHeight, setTerminalHeight] = useState(180);
  const isDraggingTerminal = useRef(false);
  const teacherColumnRef = useRef(null);

  const handleTerminalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingTerminal.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleTerminalDrag = useCallback((e) => {
    if (!isDraggingTerminal.current || !teacherColumnRef.current) return;
    const rect = teacherColumnRef.current.getBoundingClientRect();
    const h = Math.max(80, Math.min(rect.height * 0.65, rect.bottom - e.clientY));
    setTerminalHeight(h);
  }, []);

  // ── Vertical terminal resize (student view) ──
  const [studentTerminalHeight, setStudentTerminalHeight] = useState(180);
  const isDraggingStudentTerminal = useRef(false);
  const studentColumnRef = useRef(null);

  const handleStudentTerminalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingStudentTerminal.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleStudentTerminalDrag = useCallback((e) => {
    if (!isDraggingStudentTerminal.current || !studentColumnRef.current) return;
    const rect = studentColumnRef.current.getBoundingClientRect();
    const h = Math.max(80, Math.min(rect.height * 0.65, rect.bottom - e.clientY));
    setStudentTerminalHeight(h);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      handleMouseMove(e);
      handleTerminalDrag(e);
      handleStudentTerminalDrag(e);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTerminalDrag, handleStudentTerminalDrag]);

  const { runCode, output, error, isRunning, clearOutput, sendInput, stopExecution } = useCodeExecution();

  const handleRunCode = useCallback(() => {
    runCode(code, language);
  }, [code, language, runCode]);

  // Broadcast teacher output
  useEffect(() => {
    if (isConnected && (output || error)) {
      socketService.emit('teacher_output', { output, error });
    }
  }, [output, error, isConnected]);

  const handleTeacherCodeChange = useCallback((newCode) => {
    setCode(newCode);
    socketService.emit('teacher_code_change', { code: newCode });
  }, [setCode]);

  useKeyboardShortcuts({
    onRun: handleRunCode,
    onSave: () => { },
    onTogglePanel: () => (isPanelOpen ? closePanel() : openPanel()),
  });

  const isControlling = selectedStudent && controlledStudentId === selectedStudent.id;

  return (
    <div className="flex flex-col h-screen bg-black">
      <Header
        role="host"
        isConnected={isConnected}
        onOpenStudentPanel={openPanel}
        onLeaveSession={onBackToRoleSelect}
      />

      {/* Single combined editor bar */}
      <EditorHeader
        language={language}
        onLanguageChange={setLanguage}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        tabs={tabs}
        onRun={handleRunCode}
        isRunning={isRunning}
        onToggleTeacher={selectedStudent ? () => setIsTeacherVisible(p => !p) : undefined}
        isTeacherVisible={isTeacherVisible}
      />

      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        {/* ── Teacher editor column ── */}
        <AnimatePresence>
          {isTeacherVisible && (
            <motion.div
              ref={teacherColumnRef}
              initial={{ x: 0 }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className="flex flex-col"
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

              {/* Drag handle */}
              <div
                onMouseDown={handleTerminalDragStart}
                className="h-[3px] cursor-row-resize bg-transparent hover:bg-blue-500/40 transition-colors shrink-0 relative group"
              >
                <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
                  <div className="w-8 h-[2px] rounded-full bg-white/[0.06] group-hover:bg-blue-400/50 transition-colors" />
                </div>
              </div>

              <div style={{ height: `${terminalHeight}px` }} className="shrink-0">
                <OutputPanel
                  output={output} error={error} isRunning={isRunning}
                  onClear={clearOutput} onSendInput={sendInput} onStop={stopExecution}
                  className="h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Horizontal divider */}
        {isTeacherVisible && selectedStudent && (
          <div
            onMouseDown={handleMouseDown}
            className="w-[3px] cursor-col-resize bg-transparent hover:bg-blue-500/40 transition-colors"
          />
        )}

        {/* ── Student view column ── */}
        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              ref={studentColumnRef}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isTeacherVisible ? `${100 - splitRatio}%` : "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col bg-[#080808] overflow-hidden"
            >
              {/* Student header */}
              <div className="flex items-center justify-between h-9 px-3 border-b border-white/[0.04] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500/60" />
                  <span className="text-[12px] font-medium text-neutral-300">
                    {selectedStudent.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => promoteStudent(selectedStudent.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${promotedStudentId === selectedStudent.id
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]"
                      }`}
                  >
                    {promotedStudentId === selectedStudent.id ? "Sharing" : "Share"}
                  </button>

                  {isControlling ? (
                    <button
                      onClick={releaseControl}
                      className="px-2.5 py-1 rounded text-[10px] font-semibold text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    >
                      Release
                    </button>
                  ) : (
                    <button
                      onClick={() => takeControl(selectedStudent.id)}
                      className="px-2.5 py-1 rounded text-[10px] font-semibold text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => selectStudent(null)}
                    className="px-1.5 py-1 rounded text-[10px] text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.04] transition-all"
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
                      ? (val) => {
                        updateStudentCode(selectedStudent.id, val);
                        socketService.emit('teacher_edit_student_code', {
                          studentId: selectedStudent.id,
                          code: val,
                        });
                      }
                      : undefined
                  }
                  language={language}
                  fontSize={fontSize}
                  showMinimap={false}
                  readOnly={!isControlling}
                />
              </div>

              <div
                onMouseDown={handleStudentTerminalDragStart}
                className="h-[3px] cursor-row-resize bg-transparent hover:bg-blue-500/40 transition-colors shrink-0 relative group"
              >
                <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
                  <div className="w-8 h-[2px] rounded-full bg-white/[0.06] group-hover:bg-blue-400/50 transition-colors" />
                </div>
              </div>

              <div style={{ height: `${studentTerminalHeight}px` }} className="shrink-0">
                <OutputPanel
                  output={selectedStudent.output}
                  error={selectedStudent.error}
                  isRunning={false}
                  onClear={() => { }}
                  className="h-full"
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