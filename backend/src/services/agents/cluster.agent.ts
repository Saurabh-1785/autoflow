import { ai, DEFAULT_MODEL } from '../gemini.client';
import { Type } from '@google/genai';

const ClusterSchema = {
  type: Type.OBJECT,
  properties: {
    clusters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topicLabel: { type: Type.STRING, description: "Short descriptive label for this topic cluster" },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Most relevant keywords for this topic" },
          summary: { type: Type.STRING, description: "1-sentence summary of what users are saying in this cluster" },
          rawFeedbackIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of the feedback items belonging to this cluster" }
        },
        required: ["topicLabel", "keywords", "summary", "rawFeedbackIds"]
      }
    }
  },
  required: ["clusters"]
};

export const runClusterAgent = async (feedbackItems: { id: string; text: string }[]): Promise<any> => {
  const feedbackText = feedbackItems.map(item => `[ID: ${item.id}] ${item.text}`).join('\n');

  const prompt = `You are an expert Data Analyst Agent specializing in feedback clustering.
Your task is to analyze the following raw feedback items and group them into logical topic clusters.
Each cluster should represent a recurring theme, problem, or feature request.
Ensure you map each feedback item's ID to exactly one cluster.

Raw Feedback:
${feedbackText}
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: ClusterSchema,
      temperature: 0.1
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('No text returned from Gemini API.');
  }

  return JSON.parse(responseText);
};
