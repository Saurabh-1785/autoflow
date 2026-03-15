import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root if not already loaded
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment.');
}

// Initialize the Gemini client
export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper to determine the default model
export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';

// Optionally, you can wrap generation calls in a helper for consistent error handling
export const generateJson = async (prompt: string, schema: any, ...args: any[]) => {
  return await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      ...args[0]
    }
  });
};
