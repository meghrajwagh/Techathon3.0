/**
 * StudentDashboard Component
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
import EditorToolbar from "@/components/editor/EditorToolbar";
import CodeEditor from "@/components/editor/CodeEditor";
import OutputPanel from "@/components/terminal/OutputPanel";

const StudentDashboard = ({ onBackToRoleSelect }) => {
  // Initialize student socket listeners
  const { sendCodeChange } = useStudentSocket();

  const {
    code,
    language,
    sharedCode,
    sharedLabel,
    sharedOutput,
    sharedError,
    isSharedMinimized,
    setCode,
    setLanguage,
    toggleSharedMinimized,
    isControlledByTeacher,
  } = useStudentStore();

  const { isConnected } = useSocketStore();
  const { runCode, output, error, isRunning, clearOutput } = useCodeExecution();

  // Send initial code to backend when component mounts
  useEffect(() => {
    if (isConnected && code) {
      console.log('[STUDENT] Sending initial code to backend');
      sendCodeChange(code);
    }
  }, [isConnected]); // Only run once when connected

  const handleRunCode = useCallback(() => {
    if (!isControlledByTeacher) {
      runCode(code, language);
    }
  }, [code, language, runCode, isControlledByTeacher]);

  useKeyboardShortcuts({
    onRun: handleRunCode,
  });

  const handleCodeChange = useCallback(
    (val) => {
      if (!isControlledByTeacher) {
        setCode(val);
        // Send code change to backend
        sendCodeChange(val);
      }
    },
    [isControlledByTeacher, setCode, sendCodeChange],
  );

  const [fontSize, setFontSize] = useState(14);

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

  const tabs = [
    {
      id: "main",
      name: `main.${language}`,
      language,
      active: true,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background-primary">
      <Header
        role="participant"
        isConnected={isConnected}
        onLeaveSession={onBackToRoleSelect}
      />

      <div ref={containerRef} className="flex-1 flex min-h-0 overflow-hidden">
        <div
          style={{ width: isSharedMinimized ? '40px' : `${splitRatio}%` }}
          className="flex flex-col transition-all duration-300"
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

        {!isSharedMinimized && (
          <div
            onMouseDown={handleMouseDown}
            className="w-1 cursor-col-resize bg-white/[0.05] hover:bg-accent-blue transition-colors"
          />
        )}

        <div
          style={{ width: isSharedMinimized ? 'calc(100% - 40px)' : `${100 - splitRatio}%` }}
          className="flex flex-col min-h-0 min-w-0 transition-all duration-300"
        >
          {isControlledByTeacher && (
            <div className="bg-yellow-500/15 text-yellow-400 text-sm px-5 py-3 border-b border-yellow-500/30 font-semibold">
              Teacher is currently editing your code. Your editor is locked.
            </div>
          )}

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

          <div className="h-52 shrink-0 border-t border-white/[0.06]">
            {" "}
            <OutputPanel
              output={output}
              error={error}
              isRunning={isRunning}
              onClear={clearOutput}
              className="h-full rounded-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
