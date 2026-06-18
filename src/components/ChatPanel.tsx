import React, { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { Message } from "../types";
import { useConversation } from "../hooks/useConversation";
import { Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface ChatPanelProps {
  onAddHistory: (title: string, lastMsg: string) => void;
  isDarkMode?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onAddHistory, isDarkMode = false }) => {
  const initialWelcomeMsg: Message = {
    id: "welcome",
    sender: "ava",
    text: "Hello! I am Ava, your automated health co-pilot here at Cooper University Hospital. I can help navigate support options, provide campus information, or aid pre-clinical discovery. How may I support you today?",
    timestamp: "Just Now",
  };

  const { messages, isTyping, sendMessage, addSystemMessage } = useConversation([initialWelcomeMsg]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleBookAppointment = () => {
    onAddHistory("Appointment Booking", "Opened appointment scheduler card");
    addSystemMessage("Initiating Interactive Appointment Scheduler...", "appointment");
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const textToSend = input.trim();
    setInput("");

    const query = textToSend.toLowerCase();
    const isBookingIntent = query.includes("book") || query.includes("schedul") || query.includes("appointment") || query.includes("అపాయింట్‌మెంట్");

    if (isBookingIntent) {
      addSystemMessage(`User: "${textToSend}"`);
      addSystemMessage("Initiating Interactive Appointment Scheduler...", "appointment");
      return;
    }

    await sendMessage(textToSend, onAddHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInput("");
    
    const query = question.toLowerCase();
    const isBookingIntent = query.includes("book") || query.includes("schedul") || query.includes("appointment") || query.includes("అపాయింట్‌మెంట్");

    if (isBookingIntent) {
      handleBookAppointment();
      return;
    }

    await sendMessage(question, onAddHistory);
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? "bg-slate-950" : "bg-slate-50/50"}`}>
      {/* Disclaimer banner */}
      <div className={`px-3.5 py-1.5 flex items-start gap-2 shrink-0 border-b transition-colors ${
        isDarkMode 
          ? "bg-amber-950/20 border-amber-900/40" 
          : "bg-amber-50 border-b border-amber-200/60"
      }`}>
        <AlertCircle size={13} className="text-amber-600 mt-0.5 shrink-0" />
        <p className={`text-[10px] leading-normal font-semibold ${isDarkMode ? "text-amber-200" : "text-amber-800"}`}>
          Pre-clinical Assistant only. If this is a medical emergency or immediate health risk, please call 911 immediately.
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isDarkMode={isDarkMode} />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 my-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              isDarkMode 
                ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" 
                : "bg-[#0266c8]/10 border border-[#0266c8]/25 text-[#0266c8]"
            }`}>
              Ava
            </div>
            <div className={`px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center justify-center shadow-sm border ${
              isDarkMode 
                ? "bg-slate-900 border-slate-800 text-white" 
                : "bg-white border-slate-200 text-slate-800"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? "bg-blue-450" : "bg-[#0266c8]"}`} style={{ animationDelay: "0ms" }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? "bg-blue-450" : "bg-[#0266c8]"}`} style={{ animationDelay: "150ms" }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? "bg-blue-450" : "bg-[#0266c8]"}`} style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions if few messages */}
      {messages.length < 3 && (
        <div className={`px-4 py-2 flex flex-wrap gap-1.5 shrink-0 border-t ${
          isDarkMode 
            ? "bg-slate-900/60 border-slate-800/80" 
            : "bg-white/70 border-slate-200/50"
        }`}>
          <button
            onClick={handleBookAppointment}
            className={`text-[10.5px] font-black px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
              isDarkMode 
                ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/60 hover:bg-emerald-900/40" 
                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/60"
            }`}
          >
            📅 book doctor appointment
          </button>
          <button
            onClick={() => handleQuickQuestion("Where is the Cooper Emergency Room?")}
            className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
              isDarkMode 
                ? "text-blue-400 bg-blue-950/30 border-blue-900/50 hover:bg-blue-900/40" 
                : "text-[#0266c8] bg-blue-50 hover:bg-[#0266c8]/10 border border-blue-200/50"
            }`}
          >
            📍 Emergency Room Location
          </button>
          <button
            onClick={() => handleQuickQuestion("What are the billing coordinate hours?")}
            className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
              isDarkMode 
                ? "text-blue-400 bg-blue-950/30 border-blue-900/50 hover:bg-blue-900/40" 
                : "text-[#0266c8] bg-blue-50 hover:bg-[#0266c8]/10 border border-blue-200/50"
            }`}
          >
            ⏱️ Billing Inquiry Hours
          </button>
          <button
            onClick={() => handleQuickQuestion("How do I request patient medical records?")}
            className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
              isDarkMode 
                ? "text-blue-400 bg-blue-950/30 border-blue-900/50 hover:bg-blue-900/40" 
                : "text-[#0266c8] bg-blue-50 hover:bg-[#0266c8]/10 border border-blue-200/50"
            }`}
          >
            📄 Patient Records Request
          </button>
        </div>
      )}

      {/* Custom Clinical Input Area */}
      <div className={`p-3 shrink-0 flex items-center gap-2 border-t ${
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe clinical question or request assistance..."
            className={`w-full border rounded-xl pl-3.5 pr-22 py-2.5 text-[12.5px] focus:outline-none transition-all shadow-inner ${
              isDarkMode 
                ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-550 focus:border-blue-550 focus:bg-slate-950" 
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0266c8] focus:bg-white"
            }`}
          />
          <div className="absolute right-2 top-2.5 flex items-center gap-1.5 text-slate-400">
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 ${
              isDarkMode 
                ? "bg-blue-950/80 text-blue-400" 
                : "bg-blue-50 text-[#0266c8]"
            }`}>
              <Sparkles size={10} className="animate-pulse" /> Gemini 1.5
            </span>
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${
            input.trim()
              ? isDarkMode 
                ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer" 
                : "bg-[#0266c8] hover:bg-[#0152a1] text-white cursor-pointer"
              : isDarkMode
                ? "bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed"
                : "bg-slate-100 text-slate-350 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
