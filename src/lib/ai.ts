import { GoogleGenAI } from "@google/genai";

/**
 * Google Gemini AI Instance Helper
 * 
 * Ye helper single instance banata hai Gemini GenAI client ka.
 * Is se bar-bar new object allocate nahi hota (Singleton Pattern).
 */
const apiKey = process.env.GEMINI_API_KEY || "";

export const ai = new GoogleGenAI({
  apiKey,
});

export const DEFAULT_AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
