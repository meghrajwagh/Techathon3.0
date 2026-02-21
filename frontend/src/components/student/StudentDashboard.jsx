/**
 * StudentDashboard — Participant view
 * Split: teacher's shared code (left) + personal editor (right)
 */

import React, { useCallback, useRef, useState, useEffect } from "react";
import useStudentStore from "@/store/studentStore";
import useSocketStore from "@/store/socketStore";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useStudentSocket } from "@/hooks/useStudentSocket";

import Header from "@/components/layout/Header";
import SharedWindow from "@/components/student/SharedWindow";
import EditorHeader from "@/components/editor/EditorHeader";
import CodeEditor from "@/components/editor/CodeEditor";
import OutputPanel from "@/components/terminal/OutputPanel";

const StudentDashboard = ({ onBackToRoleSelect }) => {
  const { sendCodeChange } = useStudentSocket();

  const {
    code, language, sharedCode, sharedLabel, sharedOutput, sharedError,
    isSharedMinimized, setCode, setLanguage, toggleSharedMinimized,
    isControlledByTeacher,
  } = useStudentStore();

  const { isConnected } = useSocketStore();
  const { runCode, output, error, isRunning, clearOutput, sendInput, stopExecution } = useCodeExecution();

  useEffect(() => {
    if (isConnected && code) sendCodeChange(code);
  }, [isConnected]);

  const handleRunCode = useCallback(() => {
    if (!isControlledByTeacher) runCode(code, language);
  }, [code, language, runCode, isControlledByTeacher]);

  useKeyboardShortcuts({ onRun: handleRunCode });

  const handleCodeChange = useCallback((val) => {
    if (!isControlledByTeacher) { setCode(val); sendCodeChange(val); }
  }, [isControlledByTeacher, setCode, sendCodeChange]);

  const [fontSize, setFontSize] = useState(14);

  // ── Horizontal split ──
  const [splitRatio, setSplitRatio] = useState(42);
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
    if (r > 15 && r < 80) setSplitRatio(r);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isDraggingTerminal.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // ── Vertical terminal resize ──
  const [terminalHeight, setTerminalHeight] = useState(180);
  const isDraggingTerminal = useRef(false);
  const editorColumnRef = useRef(null);

  const handleTerminalDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingTerminal.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleTerminalDrag = useCallback((e) => {
    if (!isDraggingTerminal.current || !editorColumnRef.current) return;
    const rect = editorColumnRef.current.getBoundingClientRect();
    const h = Math.max(80, Math.min(rect.height * 0.65, rect.bottom - e.clientY));
    setTerminalHeight(h);
  }, []);

  useEffect(() => {
    const onMove = (e) => { handleMouseMove(e); handleTerminalDrag(e); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTerminalDrag]);

  const tabs = [{ id: "main", name: `main.${language}`, language, active: true }];

  return (
    <div className="flex flex-col h-screen bg-black">
      <Header
        role="participant"
        isConnected={isConnected}
        onLeaveSession={onBackToRoleSelect}
      />

      <div ref={containerRef} className="flex-1 flex min-h-0 overflow-hidden">
        {/* ── Shared teacher view (left) ── */}
        <div
          style={{ width: isSharedMinimized ? '36px' : `${splitRatio}%` }}
          className="flex flex-col transition-[width] duration-200"
        >
          <SharedWindow
            code={sharedCode}
            label={sharedLabel}
            language={language}
            isMinimized={isSharedMinimized}
            onToggleMinimize={toggleSharedMinimized}
            output={sharedOutput}
            error={sharedError}
          />
        </div>

        {/* Divider */}
        {!isSharedMinimized && (
          <div
            onMouseDown={handleMouseDown}
            className="w-[3px] cursor-col-resize bg-transparent hover:bg-blue-500/40 transition-colors"
          />
        )}

        {/* ── Student editor (right) ── */}
        <div
          ref={editorColumnRef}
          style={{ width: isSharedMinimized ? 'calc(100% - 36px)' : `${100 - splitRatio}%` }}
          className="flex flex-col min-h-0 min-w-0 transition-[width] duration-200"
        >
          {isControlledByTeacher && (
            <div className="flex items-center gap-2 h-7 px-3 bg-amber-500/[0.06] border-b border-amber-500/20 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-medium text-amber-400/80">
                Teacher is editing — your editor is locked
              </span>
            </div>
          )}

          <EditorHeader
            language={language}
            onLanguageChange={setLanguage}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            tabs={tabs}
            onRun={handleRunCode}
            isRunning={isRunning}
          />

          <div className="flex-1 min-h-0">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={language}
              fontSize={fontSize}
              showMinimap={false}
              readOnly={isControlledByTeacher}
            />
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
