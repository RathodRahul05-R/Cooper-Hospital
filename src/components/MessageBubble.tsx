import React from "react";
import { motion } from "motion/react";
import { User, Activity, Check, Bot } from "lucide-react";
import { Message } from "../types";
import { AppointmentCard } from "./AppointmentCard";

interface MessageBubbleProps {
  message: Message;
  isDarkMode?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isDarkMode = false }) => {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  if (isSystem) {
    if (message.cardType === "appointment") {
      return (
        <div className="my-4 w-full">
          <AppointmentCard />
        </div>
      );
    }
    return (
      <div className="flex justify-center my-3">
        <div className={`rounded-full px-3 py-1 text-[10px] font-semibold border shadow-sm flex items-center gap-1.5 font-mono ${
          isDarkMode 
            ? "bg-slate-900 text-slate-400 border-slate-800/85" 
            : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
          <Activity size={10} className="text-[#0266c8] animate-pulse" />
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full gap-2.5 my-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border text-xs shadow-sm font-semibold transition-all ${
          isUser
            ? isDarkMode 
              ? "bg-slate-800 border-slate-700 text-blue-400" 
              : "bg-slate-50 border-slate-200 text-[#0266c8]"
            : isDarkMode 
              ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
              : "bg-[#0266c8]/10 border-[#0266c8]/35 text-[#0266c8]"
        }`}
      >
        {isUser ? <User size={13} strokeWidth={2.5} /> : <Bot size={13} strokeWidth={2.5} />}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[76%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm break-words border transition-all ${
            isUser
              ? "bg-[#0266c8] text-white border-[#0266c8]/90 rounded-tr-sm font-medium"
              : isDarkMode 
                ? "bg-slate-900 text-slate-100 border-slate-800 rounded-tl-sm hover:border-slate-700" 
                : "bg-white text-slate-800 border-slate-200/95 rounded-tl-sm hover:border-slate-300"
          }`}
        >
          {message.text}
        </div>

        {message.cardType === "appointment" && (
          <div className="mt-3.5 w-full min-w-[270px] sm:min-w-[315px]">
            <AppointmentCard />
          </div>
        )}

        {/* Timestamp & Status */}
        <div className="flex items-center gap-1.5 mt-1.5 px-1">
          <span className="text-[10px] text-slate-400 font-mono font-medium">
            {message.timestamp}
          </span>
          {isUser && message.status && (
            <span className="text-slate-400">
              {message.status === "sending" ? (
                <div className="w-2.5 h-2.5 border border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              ) : (
                <Check size={11} className={`${message.status === "read" ? "text-emerald-500" : "text-slate-400"}`} />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
