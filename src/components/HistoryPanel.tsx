import React from "react";
import { History, Calendar, CheckCircle2, ChevronRight, MessageSquare, Trash2, ShieldCheck, Clock } from "lucide-react";
import { HistorySession } from "../types";

interface HistoryPanelProps {
  sessions: HistorySession[];
  onClearHistory: () => void;
  isDarkMode?: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ sessions, onClearHistory, isDarkMode = false }) => {
  return (
    <div className={`flex flex-col h-full ${isDarkMode ? "bg-slate-950" : "bg-slate-50/50"}`}>
      {/* Header Info Banner */}
      <div className={`border-b px-4 py-2.5 flex items-center justify-between shrink-0 transition-colors ${
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-b border-slate-200/60"
      }`}>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#0266c8]" />
          <span className={`text-[10px] font-extrabold uppercase tracking-wider font-mono ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Encrypted Session Logs
          </span>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={onClearHistory}
            className={`text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              isDarkMode ? "text-slate-500 hover:text-[#ff4d4f]" : "text-slate-400 hover:text-[#ff4d4f]"
            }`}
          >
            <Trash2 size={11} />
            {window.localStorage.getItem("lang") === "te" ? "తొలగించు" : "Clear Logs"}
          </button>
        )}
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {sessions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? "bg-slate-900 text-slate-650" : "bg-slate-100 text-slate-350"}`}>
              <History size={20} />
            </div>
            <div className="space-y-1">
              <p className={`text-xs font-bold ${isDarkMode ? "text-slate-300" : "text-slate-650"}`}>No Session Logs Found</p>
              <p className="text-[10px] text-slate-400 max-w-[190px] leading-relaxed">
                Your past clinical support transcripts and voice logs will be archived here locally.
              </p>
            </div>
          </div>
        ) : (
          sessions.map((session, idx) => (
            <div
              key={session.id}
              className={`border p-3.5 shadow-sm transition-all relative flex items-start gap-3 group select-none rounded-xl ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-md" 
                  : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold ${
                  session.id.startsWith("voice")
                    ? isDarkMode 
                      ? "bg-rose-950/40 border-rose-900/60 text-rose-400"
                      : "bg-rose-50 border-rose-100 text-rose-500"
                    : isDarkMode 
                      ? "bg-blue-950/40 border-blue-900/60 text-blue-400"
                      : "bg-blue-50 border-blue-100 text-[#0266c8]"
                }`}
              >
                {session.id.startsWith("voice") ? <Clock size={13} /> : <MessageSquare size={13} />}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    #{session.id.slice(0, 8)}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono font-medium">
                    {session.date}
                  </span>
                </div>
                <h4 className={`text-[12.5px] font-bold truncate block ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                  {session.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate block">
                  {session.subtitle}
                </p>
              </div>

              <div className="self-center text-slate-350 group-hover:text-slate-500 transition-colors shrink-0">
                <ChevronRight size={14} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer HIPAA Compliance statement */}
      <div className={`p-2.5 text-center shrink-0 border-t ${
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-t border-slate-250"
      }`}>
        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
          🔐 HIPAA compliant sandbox. Transcripts are stored locally inside sandboxed browser metadata.
        </p>
      </div>
    </div>
  );
};
