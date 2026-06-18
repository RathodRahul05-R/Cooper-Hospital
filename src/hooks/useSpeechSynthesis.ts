import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechSynthesisProps {
  onStart?: () => void;
  onEnd?: () => void;
}

export function useSpeechSynthesis({ onStart, onEnd }: UseSpeechSynthesisProps = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback(
    (text: string, lang: "en-US" | "te-IN" | string = "en-US") => {
      if (!window.speechSynthesis) return;

      // Cancel current speaking
      window.speechSynthesis.cancel();

      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.lang = lang;

      // Try finding appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.error("Speech Synthesis Error:", err);
        setIsPlaying(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    },
    [onStart, onEnd]
  );

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return {
    isSupported,
    isPlaying,
    speak,
    stop,
  };
}
