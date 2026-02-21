/**
 * StudentPanel Component
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Users,
  ArrowUpDown,
  ChevronDown,
  Eye,
  Pencil,
  Monitor,
} from "lucide-react";
import CodeEditor from "@/components/editor/CodeEditor";

const StudentPanel = ({
  isOpen,
  onClose,
  students = [],
  onViewCode,
  onEditCode,
  onPromoteStudent,
  promotedStudentId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [expandedId, setExpandedId] = useState(null);
  const [previewStudent, setPreviewStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    let filtered = students.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "status":
          return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
        case "activity":
          return a.lastActivity.localeCompare(b.lastActivity);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [students, searchQuery, sortBy]);

  const onlineCount = students.filter((s) => s.isOnline).length;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-96 bg-background-secondary shadow-float-lg z-50 flex flex-col border-r border-white/[0.04]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-blue" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Students
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-medium">
                  {onlineCount}/{students.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-background-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search + Sort */}
            <div className="p-4 border-b border-white/[0.04] space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-tertiary text-text-primary text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-text-tertiary" />
                {["name", "status", "activity"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      sortBy === option
                        ? "bg-accent-blue/20 text-accent-blue"
                        : "text-text-tertiary"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredStudents.map((student) => {
                const isExpanded = expandedId === student.id;

                return (
                  <motion.div
                    key={student.id}
                    layout
                    className="bg-background-tertiary rounded-xl overflow-hidden border border-white/[0.05]"
                  >
                    {/* Name Row */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : student.id)
                      }
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                      <span className="text-sm text-text-primary font-medium">
                        {student.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="px-4 pb-4 space-y-4 overflow-hidden"
                        >
                          {/* Output Preview */}
                          <div className="bg-black rounded-lg px-3 py-2 text-xs font-mono">
                            {student.error ? (
                              <span className="text-red-400 whitespace-pre-wrap break-words">
                                {student.error}
                              </span>
                            ) : student.output ? (
                              <span className="text-white/80 whitespace-pre-wrap break-words">
                                {student.output}
                              </span>
                            ) : (
                              <span className="text-white/40">
                                No output yet
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setPreviewStudent(student)}
                              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">View</span>
                            </button>

                            <button
                              onClick={() => onEditCode?.(student)}
                              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition"
                            >
                              <Pencil className="w-4 h-4" />
                              <span className="text-sm">Edit</span>
                            </button>

                            <button
                              onClick={() => onPromoteStudent?.(student)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                                student.id === promotedStudentId
                                  ? "bg-accent-blue text-white"
                                  : "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30"
                              }`}
                            >
                              <Monitor className="w-4 h-4" />
                              <span className="text-sm">
                                {student.id === promotedStudentId
                                  ? "Sharing"
                                  : "Share"}
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewStudent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-6"
            >
              <div className="w-full max-w-5xl h-[80vh] bg-background-secondary rounded-xl flex flex-col overflow-hidden border border-white/[0.05]">

                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Viewing: {previewStudent.name}
                  </h3>
                  <button
                    onClick={() => setPreviewStudent(null)}
                    className="p-2 rounded hover:bg-background-tertiary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0">
                  <CodeEditor
                    value={previewStudent.code}
                    readOnly
                    showMinimap={false}
                  />
                </div>

                <div className="h-40 border-t border-white/[0.04] bg-black p-3 text-xs font-mono overflow-auto">
                  {previewStudent.error ? (
                    <span className="text-red-400 whitespace-pre-wrap break-words">
                      {previewStudent.error}
                    </span>
                  ) : previewStudent.output ? (
                    <span className="text-white/80 whitespace-pre-wrap break-words">
                      {previewStudent.output}
                    </span>
                  ) : (
                    <span className="text-white/40">No output yet</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-white/[0.04]">
                  <button
                    onClick={() => {
                      setPreviewStudent(null);
                      onEditCode?.(previewStudent);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-background-tertiary hover:bg-background-primary text-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      onPromoteStudent?.(previewStudent)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${
                      previewStudent.id === promotedStudentId
                        ? "bg-accent-blue text-white"
                        : "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    {previewStudent.id === promotedStudentId
                      ? "Shared"
                      : "Share"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentPanel;