"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCriticAgent = void 0;
const gemini_client_1 = require("../gemini.client");
const genai_1 = require("@google/genai");
// Schema for the review output
const ReviewSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        score: {
            type: genai_1.Type.INTEGER,
            description: "Score out of 100 for the quality, feasibility, and clarity of the BRD"
        },
        approved: {
            type: genai_1.Type.BOOLEAN,
            description: "Whether the BRD is approved (score >= 70) or rejected"
        },
        feedback: {
            type: genai_1.Type.STRING,
            description: "Constructive feedback and specific reasons for the score"
        },
        suggestedImprovements: {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
            description: "Specific actionable improvements"
        }
    },
    required: ["score", "approved", "feedback", "suggestedImprovements"]
};
const runCriticAgent = async (brdData) => {
    const brdText = JSON.stringify(brdData, null, 2);
    const prompt = `You are an expert Product Critic Agent.
Your task is to critically evaluate the provided Business Requirements Document (BRD).
Assess it for clarity, feasibility, business value, and alignment with modern software development practices.
Score it out of 100. If the score is 70 or above, it is approved; otherwise, it is rejected.
Provide constructive feedback and actionable improvements.
Ensure your response strictly follows the JSON schema provided.

BRD to Evaluate:
${brdText}
`;
    const response = await gemini_client_1.ai.models.generateContent({
        model: gemini_client_1.DEFAULT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: ReviewSchema,
            temperature: 0.1
        }
    });
    const responseText = response.text;
    if (!responseText) {
        throw new Error('No text returned from Gemini API.');
    }
    return JSON.parse(responseText);
};
exports.runCriticAgent = runCriticAgent;
