import { ai, DEFAULT_MODEL } from '../gemini.client';
import { Type, Schema } from '@google/genai';

const EpicSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Epic Title" },
    description: { type: Type.STRING, description: "Comprehensive description of the Epic" },
    acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High-level acceptance criteria" },
    businessValue: { type: Type.STRING, description: "Expected business outcome" }
  },
  required: ["title", "description", "acceptanceCriteria", "businessValue"]
};

// Schema for the output stories
const StoryWriterSchema = {
  type: Type.OBJECT,
  properties: {
    epics: {
      type: Type.ARRAY,
      items: EpicSchema,
      description: "List of Epics broken down from the approved BRD"
    },
    userStories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          epicTitle: { type: Type.STRING, description: "Title of the parent Epic this story belongs to" },
          title: { type: Type.STRING, description: "User Story title in 'As a... I want to... So that...' format" },
          description: { type: Type.STRING, description: "Detailed description of the user story" },
          acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific criteria for " },
          storyPoints: { type: Type.INTEGER, description: "Estimated complexity based on Fibonacci sequence (1, 2, 3, 5, 8, etc.)" }
        },
        required: ["epicTitle", "title", "description", "acceptanceCriteria", "storyPoints"]
      }
    }
  },
  required: ["epics", "userStories"]
};

export const runStoryWriterAgent = async (brdData: any): Promise<any> => {
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

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
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
