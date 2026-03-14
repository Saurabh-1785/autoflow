"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAnalystAgent = void 0;
const gemini_client_1 = require("../gemini.client");
const genai_1 = require("@google/genai");
// Schema for the structured BRD output
const BRDSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        title: { type: genai_1.Type.STRING, description: "Title of the BRD" },
        problemStatement: { type: genai_1.Type.STRING, description: "The core problem being addressed" },
        proposedSolution: { type: genai_1.Type.STRING, description: "High level description of the solution" },
        businessValue: { type: genai_1.Type.STRING, description: "Value proposition for the business" },
        targetAudience: { type: genai_1.Type.STRING, description: "Who this solution is for" },
        requirements: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
            description: "List of functional and non-functional requirements"
        }
    },
    required: ["title", "problemStatement", "proposedSolution", "businessValue", "targetAudience", "requirements"]
};
const runAnalystAgent = async (feedbackData) => {
    const feedbackText = typeof feedbackData === 'string' ? feedbackData : JSON.stringify(feedbackData, null, 2);
    const prompt = `You are an expert Business Analyst Agent.
Your task is to analyze the following user feedback and generate a comprehensive Business Requirements Document (BRD).
Ensure your response strictly follows the JSON schema provided. Do not include markdown formatting or extra text outside the JSON.

User Feedback:
${feedbackText}
`;
    const response = await gemini_client_1.ai.models.generateContent({
        model: gemini_client_1.DEFAULT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: BRDSchema,
            temperature: 0.2
        }
    });
    const responseText = response.text;
    if (!responseText) {
        throw new Error('No text returned from Gemini API.');
    }
    return JSON.parse(responseText);
};
exports.runAnalystAgent = runAnalystAgent;
