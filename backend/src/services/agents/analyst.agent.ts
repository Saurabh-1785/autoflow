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

  const prompt = `
You are a senior Business Analyst AI Agent responsible for converting user feedback into structured Business Requirements Documents (BRDs).

Your job is to carefully analyze the provided feedback and extract the underlying product problem, user needs, and business opportunity.

OBJECTIVE

Transform raw feedback into a clear, actionable BRD that a product team can use to plan development.

ANALYSIS GUIDELINES

1. Identify the core problem or recurring theme in the feedback.
2. Determine the affected user segment.
3. Explain why the issue matters for users and the business.
4. Define measurable success metrics for the solution.
5. Ensure the requirement is realistic for a software product team.
6. Use the feedback as evidence for the requirement. Do not invent unrelated features.

BRD STRUCTURE

Generate the BRD with the following sections:

- title
- problem_statement
- user_impact
- business_value
- proposed_solution
- success_metrics
- priority_level
- source_evidence

PRIORITY LEVEL

Choose one:
- low
- medium
- high
- critical

SUCCESS METRICS

Provide measurable outcomes such as:
- response time improvements
- error rate reduction
- user satisfaction increase

OUTPUT FORMAT

Return ONLY valid JSON using this structure:

{
  "title": "",
  "problem_statement": "",
  "user_impact": "",
  "business_value": "",
  "proposed_solution": "",
  "success_metrics": [
    ""
  ],
  "priority_level": "",
  "source_evidence": [
    ""
  ]
}

IMPORTANT RULES

- Do NOT include any explanation outside JSON.
- Ensure the requirement is grounded in the provided feedback.
- Keep the problem statement concise but clear.
- Success metrics must be measurable.
- Evidence must reference the actual feedback statements.

USER FEEDBACK:
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


