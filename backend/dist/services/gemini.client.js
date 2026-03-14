"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJson = exports.DEFAULT_MODEL = exports.ai = void 0;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from project root if not already loaded
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../../.env') });
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not defined in the environment.');
}
// Initialize the Gemini client
exports.ai = new genai_1.GoogleGenAI({ apiKey: apiKey || '' });
// Helper to determine the default model
exports.DEFAULT_MODEL = 'gemini-3-flash';
// Optionally, you can wrap generation calls in a helper for consistent error handling
const generateJson = async (prompt, schema, ...args) => {
    return await exports.ai.models.generateContent({
        model: exports.DEFAULT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            ...args[0]
        }
    });
};
exports.generateJson = generateJson;
