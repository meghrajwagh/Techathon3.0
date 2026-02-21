/**
 * StudentPreviewModal
 * Shows student's full code + output in a popup window
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Monitor } from "lucide-react";
import CodeEditor from "@/components/editor/CodeEditor";

const StudentPreviewModal = ({
  isOpen,
  onClose,
  student,
  onEdit,
  onPromote,
  isPromoted,
}) => {
  if (!student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6"
          >
            <div className="w-full max-w-5xl h-[80vh] bg-background-secondary rounded-xl shadow-float-lg flex flex-col overflow-hidden border border-white/[0.05]">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                <h3 className="text-sm font-semibold text-text-primary">
                  Viewing: {student.name}
                </h3>

                <button
                  onClick={onClose}
                  className="p-2 rounded hover:bg-background-tertiary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Code */}
              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={student.code}
                  language="javascript"
                  readOnly
                  showMinimap={false}
                />
              </div>

              {/* Output */}
              <div className="h-40 border-t border-white/[0.04] bg-black p-3 text-xs font-mono overflow-auto">
                {student.error ? (
                  <span className="text-red-400 whitespace-pre-wrap break-words">
                    {student.error}
                  </span>
                ) : student.output ? (
                  <span className="text-white/80 whitespace-pre-wrap break-words">
                    {student.output}
                  </span>
                ) : (
                  <span className="text-white/40">No output yet</span>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-white/[0.04]">
                <button
                  onClick={() => onEdit(student)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-background-tertiary hover:bg-background-primary text-text-secondary hover:text-text-primary transition text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => onPromote(student)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${
                    isPromoted
                      ? "bg-accent-blue text-white"
                      : "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  {isPromoted ? "Shared" : "Share"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StudentPreviewModal;