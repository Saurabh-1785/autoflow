"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStoryWriterAgent = void 0;
const gemini_client_1 = require("../gemini.client");
const genai_1 = require("@google/genai");
const EpicSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        title: { type: genai_1.Type.STRING, description: "Epic Title" },
        description: { type: genai_1.Type.STRING, description: "Comprehensive description of the Epic" },
        acceptanceCriteria: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: "High-level acceptance criteria" },
        businessValue: { type: genai_1.Type.STRING, description: "Expected business outcome" }
    },
    required: ["title", "description", "acceptanceCriteria", "businessValue"]
};
// Schema for the output stories
const StoryWriterSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        epics: {
            type: genai_1.Type.ARRAY,
            items: EpicSchema,
            description: "List of Epics broken down from the approved BRD"
        },
        userStories: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    epicTitle: { type: genai_1.Type.STRING, description: "Title of the parent Epic this story belongs to" },
                    title: { type: genai_1.Type.STRING, description: "User Story title in 'As a... I want to... So that...' format" },
                    description: { type: genai_1.Type.STRING, description: "Detailed description of the user story" },
                    acceptanceCriteria: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: "Specific criteria for " },
                    storyPoints: { type: genai_1.Type.INTEGER, description: "Estimated complexity based on Fibonacci sequence (1, 2, 3, 5, 8, etc.)" }
                },
                required: ["epicTitle", "title", "description", "acceptanceCriteria", "storyPoints"]
            }
        }
    },
    required: ["epics", "userStories"]
};
const runStoryWriterAgent = async (brdData) => {
    const brdText = JSON.stringify(brdData, null, 2);
    const prompt = `You are an expert Agile Product Owner / Story Writer Agent.
Your task is to take the following approved Business Requirements Document (BRD) and break it down into Epics and User Stories.
1. Define the Epics that encompass the required features.
2. For each Epic, define the necessary User Stories.
3. User Stories should follow standard agile format, have detailed acceptance criteria, and contain story point estimates.
Ensure your response strictly follows the JSON schema provided.

Approved BRD:
${brdText}
`;
    const response = await gemini_client_1.ai.models.generateContent({
        model: gemini_client_1.DEFAULT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: StoryWriterSchema,
            temperature: 0.2
        }
    });
    const responseText = response.text;
    if (!responseText) {
        throw new Error('No text returned from Gemini API.');
    }
    return JSON.parse(responseText);
};
exports.runStoryWriterAgent = runStoryWriterAgent;
