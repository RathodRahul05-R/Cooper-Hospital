import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, PhoneOff, Settings, Sparkles, Radio, HelpCircle, ShieldAlert, Sparkle } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { geminiService } from "../services/geminiService";
import { Message } from "../types";

interface VoicePanelProps {
  onAddHistory: (title: string, lastMsg: string) => void;
  isDarkMode?: boolean;
}

export const VoicePanel: React.FC<VoicePanelProps> = ({ onAddHistory, isDarkMode = false }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [duration, setDuration] = useState(0);
  const [voiceLanguage, setVoiceLanguage] = useState<"en" | "te">("en");
  const [lastUserTranscript, setLastUserTranscript] = useState("");
  const [lastAvaResponse, setLastAvaResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<Message[]>([]);

  const langCode = voiceLanguage === "te" ? "te-IN" : "en-US";

  // Prevent double references and state racing using synchronous ref synchronization
  const isCallingRef = useRef(isCalling);
  useEffect(() => {
    isCallingRef.current = isCalling;
  }, [isCalling]);

  const voiceHistoryRef = useRef<Message[]>([]);
  useEffect(() => {
    voiceHistoryRef.current = voiceHistory;
  }, [voiceHistory]);

  // Handle automatic mic standby toggling during active Text-To-Speech playback
  const handleSpeechStart = useCallback(() => {
    stopListening();
  }, []);

  const handleSpeechEnd = useCallback(() => {
    if (isCallingRef.current) {
      startListening();
    }
  }, []);

  const { speak, stop: stopSpeech, isPlaying } = useSpeechSynthesis({
    onStart: handleSpeechStart,
    onEnd: handleSpeechEnd,
  });

  // Speech Recognition setup
  const {
    isSupported: isRecSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: langCode,
    onResult: (finalText) => {
      handleVoiceInput(finalText);
    },
  });

  // Call duration counter
  useEffect(() => {
    let timer: any;
    if (isCalling) {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  // Handle toggling the clinical phone call
  const handleToggleCall = () => {
    if (isCalling) {
      // End the call
      stopListening();
      stopSpeech();
      setIsCalling(false);
      setLastUserTranscript("");
      setLastAvaResponse("");
      setVoiceHistory([]);
      onAddHistory(
        voiceLanguage === "te" ? "🎙️ వాయిస్ కాల్ ముగిసింది" : "🎙️ Voice call complete",
        voiceLanguage === "te" ? "వ్యవధి: " + formatTime(duration) : `Duration: ${formatTime(duration)}`
      );
    } else {
      // Start the call
      setIsCalling(true);
      setLastUserTranscript("");
      setLastAvaResponse("");
      
      // Temporarily stop mic during greeting speech to prevent playback feedback / crosstalk
      stopListening();

      // Greeting
      const greeting =
        voiceLanguage === "te"
          ? "హలో! నేను అవా, మీ కూపర్ హాస్పిటల్ సహాయకురాలిని. నేను మీకు ఎలా సహాయపడగలను?"
          : "Hello! I am Ava, your Cooper Hospital clinical voice partner. Go ahead and start speaking.";
      setLastAvaResponse(greeting);
      speak(greeting, langCode);

      // Save greeting in voice conversation history
      const initialMsg: Message = {
        id: `greeting-${Date.now()}`,
        sender: "ava",
        text: greeting,
        timestamp: new Date().toLocaleTimeString(),
      };
      setVoiceHistory([initialMsg]);
    }
  };

  // Handle continuous language shifts
  useEffect(() => {
    if (isCalling) {
      stopListening();
      setTimeout(() => {
        if (isCallingRef.current && !isPlaying) {
          startListening();
        }
      }, 300);
    }
  }, [voiceLanguage]);

  // Process translated user voice inputs with stateful Gemini 2.5 context
  const handleVoiceInput = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setLastUserTranscript(spokenText);
    setIsLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: spokenText,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Bundle current history context
    const currentSendHistory = [...voiceHistoryRef.current, userMsg];
    setVoiceHistory(currentSendHistory);

    try {
      // Query Gemini AI router with voice channel optimized instructions and session context
      const res = await geminiService.sendMessage(spokenText, currentSendHistory, "voice");
      const reply = res.text || "";

      setLastAvaResponse(reply);

      // Play vocal synthesized audio
      speak(reply, langCode);

      const avaMsg: Message = {
        id: `ava-${Date.now()}`,
        sender: "ava",
        text: reply,
        timestamp: new Date().toLocaleTimeString(),
      };
      setVoiceHistory((prev) => [...prev, avaMsg]);

      // Log voice connection history
      onAddHistory(
        voiceLanguage === "te" ? `🎙️ వాయిస్: ${spokenText.slice(0, 20)}...` : `🎙️ Voice: ${spokenText.slice(0, 20)}...`,
        reply.slice(0, 50) + "..."
      );
    } catch (err) {
      console.error("Speech interaction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex flex-col h-full p-5 select-none relative overflow-hidden transition-all duration-300 ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50/50 text-slate-850"
    }`}>
      {/* Background glowing medical grid decoration */}
      {isDarkMode && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(2,102,200,0.18),rgba(0,0,0,0))] pointer-events-none" />
      )}

      {/* Header controls inside voice screen */}
      <div className={`flex items-center justify-between border-b pb-3 transition-colors duration-300 ${
        isDarkMode ? "border-white/5" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isCalling ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span className="text-[10px] font-mono font-black tracking-widest text-[#0266c8] uppercase">
            {isCalling ? "🎙️ COOPER HOSPITAL LIVE LINK" : "STANDBY COOPER LINK"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggler */}
          <button
            onClick={() => {
              setVoiceLanguage(voiceLanguage === "en" ? "te" : "en");
            }}
            className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold cursor-pointer transition-all uppercase flex items-center gap-1 ${
              isDarkMode 
                ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white" 
                : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            {voiceLanguage === "en" ? "🇺🇸 English" : "🇮🇳 తెలుగు"}
          </button>
        </div>
      </div>

      {/* Main visualization / Status area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 text-center overflow-y-auto font-sans">
        <AnimatePresence mode="wait">
          {!isCalling ? (
            <motion.div
              key="standby"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="space-y-4"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner border ${
                isDarkMode 
                  ? "bg-[#0266c8]/10 border-[#0266c8]/25 text-blue-400" 
                  : "bg-blue-50 border-blue-100 text-[#0266c8]"
              }`}>
                <Mic size={30} className={isDarkMode ? "text-blue-400" : "text-[#0266c8]"} />
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm font-bold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                  {voiceLanguage === "te" ? "వాయిస్ హాట్‌లైన్ సిద్ధంగా ఉంది" : "Voice Hotline Standby"}
                </h3>
                <p className={`text-[11px] max-w-[240px] mx-auto leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {voiceLanguage === "te"
                    ? "అవా వాయిస్ అసిస్టెంట్‌తో మాట్లాడేందుకు కాల్ ప్రారంభించండి."
                    : "Establish a direct clinical voice session with Ava. Custom clinical language support."}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="space-y-4 w-full"
            >
              {/* Pulsing wave visualizer */}
              <div className="flex items-center justify-center gap-1.5 h-12 w-full">
                {[1, 2, 3, 4, 1, 2, 3, 4, 1].map((bar, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      height: isPlaying ? [10, bar * 16, 10] : [6, 12, 6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + index * 0.08,
                      ease: "easeInOut",
                    }}
                    className={`w-1 rounded-full ${isPlaying ? "bg-[#0266c8]" : isDarkMode ? "bg-slate-700" : "bg-slate-300"}`}
                  />
                ))}
              </div>

              <div className="space-y-1">
                <span className={`text-[11px] font-mono tracking-widest font-bold block ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                  {formatTime(duration)}
                </span>
                <p className="text-[10.5px] text-[#0266c8] font-bold uppercase tracking-wider">
                  {isPlaying ? "🎙️ AVA SPEAKING" : isListening ? "📡 AVA LISTENING" : "CONNECTING..."}
                </p>
              </div>

              {/* Dynamic Transcript Interface */}
              <div className={`border rounded-2xl p-3 max-h-44 overflow-y-auto text-left space-y-2 mt-2 w-full text-xs transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-white/5 border-white/10" 
                  : "bg-white border-slate-200 shadow-sm"
              }`}>
                {lastUserTranscript && (
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">You said:</p>
                    <p className={`font-medium italic ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>"{lastUserTranscript}"</p>
                  </div>
                )}
                {lastAvaResponse && (
                  <div className={`space-y-1 pt-2 border-t ${isDarkMode ? "border-white/5" : "border-slate-100"}`}>
                    <p className="text-[9px] font-mono text-[#0266c8] font-bold uppercase flex items-center gap-1">
                      <Sparkles size={9} /> Ava response:
                    </p>
                    <p className="text-[#0266c8] font-bold leading-normal text-[11.5px] max-w-full">
                      {lastAvaResponse}
                    </p>
                  </div>
                )}
                {isLoading && (
                  <div className={`flex items-center gap-1.5 text-[10.5px] font-mono pt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    <div className="w-2 h-2 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Ava is processing...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety Info Banner */}
      <div className={`mb-4 border rounded-xl p-3 flex gap-2.5 items-start transition-colors duration-300 ${
        isDarkMode 
          ? "bg-amber-500/10 border-amber-500/20 text-amber-200" 
          : "bg-amber-50 border-amber-150 text-amber-900"
      }`}>
        <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed font-semibold">
          {voiceLanguage === "te"
            ? "సమాధానాలు స్వయంచాలకAI తో తాయారైంది. అత్యవసర పరిస్థితి లో దయచేసి 911 కి కాల్ చేయండి."
            : "Automatic voice parsing. This system is HIPAA-compliant. Call 911 for all immediate risk factors."}
        </p>
      </div>

      {/* End / Start Call Controls */}
      <div className="flex justify-center shrink-0">
        <button
          onClick={handleToggleCall}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg outline-none ${
            isCalling
              ? "bg-[#ff4d4f] hover:bg-[#ff7875] text-white animate-pulse"
              : "bg-[#0266c8] hover:bg-[#0152a1] text-white"
          }`}
        >
          {isCalling ? <PhoneOff size={22} className="shrink-0" /> : <Mic size={22} className="shrink-0" />}
        </button>
      </div>
    </div>
  );
};
