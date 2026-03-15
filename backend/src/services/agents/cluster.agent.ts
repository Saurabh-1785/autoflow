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

  const prompt = `
  You are a senior Data Analysis AI Agent responsible for clustering user feedback.

  Your goal is to analyze raw feedback items and group them into meaningful topic clusters.

  CLUSTERING OBJECTIVES
  - Identify recurring themes, problems, or feature requests.
  - Group similar feedback together based on meaning, not just keywords.
  - Each cluster should represent ONE clear product topic.
  - Each feedback item must belong to exactly ONE cluster.

  CLUSTER RULES
  1. Use semantic understanding to group similar complaints.
  2. Avoid creating too many small clusters.
  3. Merge feedback with the same underlying issue.
  4. Prefer practical product categories such as:
    - Performance Issues
    - Login & Authentication
    - UI/UX Problems
    - Feature Requests
    - Bugs & Crashes
    - Payment Issues
  5. If a feedback item is ambiguous, assign it to the closest logical cluster.

  OUTPUT FORMAT (STRICT JSON ONLY)

  {
    "clusters": [
      {
        "topicLabel": "Login Performance Issues",
        "keywords": ["login", "slow", "auth"],
        "summary": "Users report slow login or authentication delays",
        "rawFeedbackIds": ["uuid-1", "uuid-2"]
      }
    ]
  }

  IMPORTANT CONSTRAINTS
  - Each feedback ID must appear exactly once.
  - Do not duplicate IDs across clusters.
  - Do not include explanations outside the JSON.
  - Keep cluster topics short and descriptive.

  Now analyze the following feedback items and produce the clusters.

  FEEDBACK DATA:
  ${feedbackText}
  `;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
