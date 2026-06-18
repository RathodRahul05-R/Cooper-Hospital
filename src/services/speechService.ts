/**
 * Speech Service offers utility helpers to detect the language,
 * coordinate bilingual translation code-switching, and parse inputs.
 */
export const speechService = {
  /**
   * Evaluates text to classify whether it has Telugu characters or belongs to te-IN.
   */
  detectLanguage(text: string): "en-US" | "te-IN" {
    if (!text) return "en-US";
    // Regular expression matching Telugu Unicode range U+0C00–U+0C7F
    const teluguRegex = /[\u0C00-\u0C7F]/;
    if (teluguRegex.test(text)) {
      return "te-IN";
    }
    return "en-US";
  },

  /**
   * Cleans and preparses Telugu-English mixed transcript codes if needed.
   */
  sanitizeBilingualText(text: string): string {
    return text.trim();
  }
};
