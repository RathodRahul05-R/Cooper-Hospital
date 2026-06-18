import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, PhoneCall, History as HistoryIcon, Menu, X, ShieldAlert, BadgeInfo } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { VoicePanel } from "./VoicePanel";
import { HistoryPanel } from "./HistoryPanel";
import { HistorySession } from "../types";
import { Sidebar } from "./Sidebar";

interface FloatingAIWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const FloatingAIWidget: React.FC<FloatingAIWidgetProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "history">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<HistorySession[]>([]);

  // Initialize past clinic sessions
  useEffect(() => {
    const cached = localStorage.getItem("cuh_ava_sessions");
    if (cached) {
      setSessions(JSON.parse(cached));
    } else {
      const initial: HistorySession[] = [
        {
          id: "welcome-session",
          type: "text",
          title: "Introduction",
          subtitle: "Hello! I am Ava, your automated help...",
          date: new Date().toLocaleDateString(),
        },
      ];
      setSessions(initial);
      localStorage.setItem("cuh_ava_sessions", JSON.stringify(initial));
    }
  }, []);

  const handleAddHistory = (title: string, lastMsg: string) => {
    const isVoice = title.includes("వాయిస్") || title.includes("Voice");
    const newSession: HistorySession = {
      id: `${isVoice ? "voice" : "chat"}-${Date.now()}`,
      type: isVoice ? "voice" : "text",
      title,
      subtitle: lastMsg,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem("cuh_ava_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setSessions([]);
    localStorage.removeItem("cuh_ava_sessions");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-5 z-40 flex gap-4 max-w-full items-end h-[620px] max-h-[82vh] font-sans">
      {/* Collapsible Left Hospital Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            className="hidden sm:block w-72 h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-250 bg-slate-900"
          >
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`w-[370px] max-w-[92vw] h-full rounded-3xl shadow-2xl flex flex-col border overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? "bg-slate-900 border-slate-800 text-slate-100" 
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Main Header */}
        <div className={`p-4 shrink-0 flex items-center justify-between shadow-md relative overflow-hidden ${
          isDarkMode ? "bg-slate-950 text-white" : "bg-[#0266c8] text-white"
        }`}>
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0266c8]/10 via-[#0152a1]/20 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              title="Hospital directory"
            >
              <Menu size={16} className="text-white" />
            </button>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-wide uppercase">Ava Assistant</h3>
                <span className="bg-emerald-500/25 border border-emerald-400/40 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full text-emerald-300 tracking-wider uppercase leading-none scale-90">
                  Part 1
                </span>
              </div>
              <p className={`text-[10px] font-medium ${isDarkMode ? "text-slate-400" : "text-blue-100"}`}>Cooper University Hospital</p>
            </div>
          </div>

          <div className="flex items-center gap-1 relative z-10">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/15 rounded-lg cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Panels Viewport */}
        <div className={`flex-1 overflow-hidden min-h-0 ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}>
          <AnimatePresence mode="wait">
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                <ChatPanel onAddHistory={handleAddHistory} isDarkMode={isDarkMode} />
              </motion.div>
            )}

            {activeTab === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                <VoicePanel onAddHistory={handleAddHistory} isDarkMode={isDarkMode} />
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                <HistoryPanel sessions={sessions} onClearHistory={handleClearHistory} isDarkMode={isDarkMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Navigation Tabs Bar */}
        <div className={`p-1.5 shrink-0 flex items-center justify-around border-t transition-all ${
          isDarkMode ? "bg-slate-900 border-slate-800/80" : "bg-white border-slate-200/80"
        }`}>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === "chat"
                ? isDarkMode 
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-[#0266c8]/10 text-[#0266c8]"
                : isDarkMode
                  ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-650"
            }`}
          >
            <MessageSquare size={17} strokeWidth={2.5} />
            <span className="text-[10px] font-bold mt-1 tracking-wide">
              {window.localStorage.getItem("lang") === "te" ? "చాట్" : "Chat Assist"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === "voice"
                ? isDarkMode 
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-[#0266c8]/10 text-[#0266c8]"
                : isDarkMode
                  ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-650"
            }`}
          >
            <PhoneCall size={17} strokeWidth={2.5} />
            <span className="text-[10px] font-bold mt-1 tracking-wide">
              {window.localStorage.getItem("lang") === "te" ? "కాల్" : "Voice Hotline"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === "history"
                ? isDarkMode 
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-[#0266c8]/10 text-[#0266c8]"
                : isDarkMode
                  ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-650"
            }`}
          >
            <HistoryIcon size={17} strokeWidth={2.5} />
            <span className="text-[10px] font-bold mt-1 tracking-wide">
              {window.localStorage.getItem("lang") === "te" ? "చరిత్ర" : "History Logs"}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
