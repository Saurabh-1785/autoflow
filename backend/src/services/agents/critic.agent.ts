import { ai, DEFAULT_MODEL } from '../gemini.client';
import { Type } from '@google/genai';

// Schema for the review output
const ReviewSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "Score out of 100 for the quality, feasibility, and clarity of the BRD"
    },
    approved: {
      type: Type.BOOLEAN,
      description: "Whether the BRD is approved (score >= 70) or rejected"
    },
    feedback: {
      type: Type.STRING,
      description: "Constructive feedback and specific reasons for the score"
    },
    suggestedImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific actionable improvements"
    }
  },
  required: ["score", "approved", "feedback", "suggestedImprovements"]
};

export const runCriticAgent = async (brdData: any): Promise<any> => {
  const brdText = JSON.stringify(brdData, null, 2);

  const prompt = `
You are a senior Product Critic AI Agent responsible for evaluating Business Requirements Documents (BRDs).

Your job is to review the provided BRD and determine whether it is clear, actionable, and valuable for a software development team.

EVALUATION CRITERIA

Evaluate the BRD across the following categories:

1. CLARITY
- Is the problem statement easy to understand?
- Are the requirements specific and unambiguous?

2. BUSINESS VALUE
- Does the requirement solve a meaningful user or business problem?
- Is there clear user impact?

3. FEASIBILITY
- Can the requirement realistically be implemented by an engineering team?
- Are the expectations reasonable?

4. SUCCESS METRICS
- Are measurable success criteria defined?

5. ALIGNMENT WITH USER FEEDBACK
- Does the requirement clearly reflect the source feedback or cluster insight?

SCORING METHOD

Score each category from **0–20 points**.

Total score = sum of all category scores (maximum 100).

APPROVAL RULE

- If total_score >= 70 → status = "approved"
- If total_score < 70 → status = "rejected"

OUTPUT FORMAT

Return ONLY valid JSON in the following structure:

{
  "score": number,
  "approved": boolean,
  "feedback": "Why this score was given",
  "suggestedImprovements": [
    "Actionable improvement 1",
    "Actionable improvement 2"
  ]
}

IMPORTANT RULES

- Do NOT include any text outside the JSON.
- Be strict but fair in scoring.
- If a BRD lacks metrics or clear scope, reduce the score accordingly.
- Suggestions must be actionable and practical for a product team.

BRD TO EVALUATE:
${brdText}
`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
