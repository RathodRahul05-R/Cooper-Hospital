import { useState, useEffect, useRef, useCallback } from "react";

interface UseSpeechRecognitionProps {
  onResult?: (text: string) => void;
  onEnd?: () => void;
  lang?: "en-US" | "te-IN" | string;
}

export function useSpeechRecognition({ onResult, onEnd, lang = "en-US" }: UseSpeechRecognitionProps = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      recognitionRef.current = rec;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isActiveRef.current) return;
    try {
      recognitionRef.current.lang = lang;
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        isActiveRef.current = true;
        setTranscript("");
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentCombined = finalTranscript || interimTranscript;
        setTranscript(currentCombined);
        if (onResult && finalTranscript) {
          onResult(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
          isActiveRef.current = false;
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        isActiveRef.current = false;
        if (onEnd) onEnd();
      };

      recognitionRef.current.start();
      isActiveRef.current = true; // provisionally lock to avoid multiple rapid clicks starting it
    } catch (err) {
      console.error("Failed to start Speech Recognition:", err);
      isActiveRef.current = false;
    }
  }, [lang, onResult, onEnd]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isActiveRef.current) return;
    try {
      recognitionRef.current.stop();
      isActiveRef.current = false;
      setIsListening(false);
    } catch (err) {
      console.error("Failed to stop Speech Recognition:", err);
    }
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}
