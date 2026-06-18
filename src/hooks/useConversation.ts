import { useState, useCallback, useEffect } from "react";
import { Message } from "../types";
import { geminiService } from "../services/geminiService";

interface UseConversationResult {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string, onSuccess?: (title: string, lastMsg: string) => void) => Promise<void>;
  clearMessages: () => void;
  addSystemMessage: (text: string, cardType?: "appointment") => void;
}

const TRANSCRIPT_STORAGE_KEY = "cuh_ava_active_chat_transcript";

export function useConversation(initialMessages: Message[] = []): UseConversationResult {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(TRANSCRIPT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialMessages;
    } catch (e) {
      console.warn("Could not load stored active transcript", e);
      return initialMessages;
    }
  });
  const [isTyping, setIsTyping] = useState(false);

  // Auto save messages whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TRANSCRIPT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not store active transcript", e);
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string, onSuccess?: (title: string, lastMsg: string) => void) => {
      if (!text.trim()) return;

      const userMsgText = text.trim();
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // Create new user message object
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userMsgText,
        timestamp: now,
        status: "sent",
      };

      // Add to React state
      let updatedMessages: Message[] = [];
      setMessages((prev) => {
        updatedMessages = [...prev, userMessage];
        return updatedMessages;
      });
      setIsTyping(true);

      // Trigger historical callback
      if (onSuccess) {
        onSuccess(
          userMsgText.slice(0, 30) + (userMsgText.length > 30 ? "..." : ""),
          userMsgText
        );
      }

      try {
        // Fetch real-time AI response from local multi-context Gemini server route
        // Send previous message log to maintain full ChatGPT-style context
        const response = await geminiService.sendMessage(userMsgText, updatedMessages);

        const responseNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const avaMessage: Message = {
          id: `ava-${Date.now()}`,
          sender: "ava",
          text: response.text,
          timestamp: responseNow,
          // Let client side detect if Gemini instructs to show appointment widget
          cardType: (response.text.includes("[APPOINTMENT_WIZARD]") || response.text.toLowerCase().includes("interactive planner below")) ? "appointment" : undefined,
        };

        setMessages((prev) => [...prev, avaMessage]);
      } catch (err) {
        console.error("Hook sendMessage failed:", err);
      } finally {
        setIsTyping(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(TRANSCRIPT_STORAGE_KEY);
  }, []);

  const addSystemMessage = useCallback((text: string, cardType?: "appointment") => {
    const systemMessage: Message = {
      id: `sys-${Date.now()}`,
      sender: "system",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      cardType,
    };
    setMessages((prev) => [...prev, systemMessage]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    addSystemMessage,
  };
}
