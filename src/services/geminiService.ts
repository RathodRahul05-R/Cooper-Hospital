import { Message } from "../types";

export interface ChatResponse {
  text: string;
  error?: string;
}

/**
 * Communicates with our secure server-side Express Gemini gateway
 * to get clinical support responses while preserving conversation state.
 */
export const geminiService = {
  async sendMessage(message: string, history: Message[] = [], channel: "text" | "voice" = "text"): Promise<ChatResponse> {
    try {
      // Filter history to reduce size and only pass structured text messages
      const prunedHistory = history
        .filter((msg) => msg.sender === "user" || msg.sender === "ava")
        .slice(-15); // Last 15 messages are sufficient for context

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: prunedHistory,
          channel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return { text: data.text };
    } catch (error: any) {
      console.error("Failed to query Cooper Ava API:", error);
      return {
        text: "I encountered an issue connecting to the hospital co-pilot network. Please verify your connection or try again shortly.",
        error: error.message || "Network request error",
      };
    }
  },
};
