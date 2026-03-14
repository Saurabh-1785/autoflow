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

  const prompt = `
You are a senior Agile Product Owner and Story Writing AI Agent.

Your responsibility is to transform an approved Business Requirements Document (BRD) into a structured set of Epics and User Stories suitable for a software development team.

OBJECTIVE

Break the BRD into logical Epics and detailed User Stories that engineering teams can directly implement.

GUIDELINES

1. EPIC CREATION
- Identify the main functional areas required to fulfill the BRD.
- Each Epic should represent a large feature or capability.

2. USER STORY CREATION
Each Epic must contain multiple User Stories.

User Stories must follow the standard agile format:

"As a [type of user],
I want [goal or action],
so that [benefit/value]."

3. ACCEPTANCE CRITERIA
Each User Story must include clear acceptance criteria using **Given / When / Then** format.

4. STORY POINT ESTIMATION
Estimate effort using Fibonacci scale:

1, 2, 3, 5, 8, 13

Estimate based on:
- complexity
- scope
- engineering effort

5. PRACTICAL IMPLEMENTATION
Ensure stories are:
- actionable
- technically realistic
- small enough for a development sprint

OUTPUT FORMAT (STRICT JSON ONLY)

{
  "epics": [
    {
      "epic_id": "epic_1",
      "title": "",
      "description": "",
      "user_stories": [
        {
          "story_id": "story_1",
          "title": "",
          "story": "",
          "story_points": number,
          "acceptance_criteria": [
            "Given ... When ... Then ..."
          ]
        }
      ]
    }
  ]
}

IMPORTANT RULES

- Return ONLY valid JSON.
- Do not include explanations outside JSON.
- Ensure stories are implementation-ready.
- Avoid vague tasks like "improve system".
- Ensure acceptance criteria are measurable.

APPROVED BRD:
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
