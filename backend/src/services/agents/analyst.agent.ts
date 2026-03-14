import { ai, DEFAULT_MODEL } from '../gemini.client';
import { Type } from '@google/genai';

// Schema for the structured BRD output
const BRDSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the BRD" },
    problemStatement: { type: Type.STRING, description: "The core problem being addressed" },
    proposedSolution: { type: Type.STRING, description: "High level description of the solution" },
    businessValue: { type: Type.STRING, description: "Value proposition for the business" },
    targetAudience: { type: Type.STRING, description: "Who this solution is for" },
    requirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of functional and non-functional requirements"
    }
  },
  required: ["title", "problemStatement", "proposedSolution", "businessValue", "targetAudience", "requirements"]
};

export const runAnalystAgent = async (feedbackData: string | any[]): Promise<any> => {
  const feedbackText = typeof feedbackData === 'string' ? feedbackData : JSON.stringify(feedbackData, null, 2);

  const prompt = `You are an expert Business Analyst Agent.
Your task is to analyze the following user feedback and generate a comprehensive Business Requirements Document (BRD).
Ensure your response strictly follows the JSON schema provided. Do not include markdown formatting or extra text outside the JSON.

User Feedback:
${feedbackText}
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
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
