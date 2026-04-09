import { LLMSettings } from "../types";

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  apiKey: process.env.GEMINI_API_KEY || '',
  modelFlash: "gemini-3.1-flash-lite-preview",
  modelPro: "gemini-3-flash-preview",
  prompts: {
    webSummary: "Based on the following 510(k) information, search for the most recent and relevant FDA guidance documents, predicate trends, and regulatory requirements. Create a comprehensive summary in {{language}} of approximately 2000-3000 words. Focus on compliance, safety signals, and technical expectations.\n\nInput Information:\n{{input}}",
    fdaSummary: "Create a comprehensive 510(k) technical summary in {{language}} of approximately 3000-4000 words. Base this on the original user input and the following regulatory context:\n\nRegulatory Context:\n{{webSummary}}\n\nUser Input:\n{{input}}\n\nInclude sections for Device Description, Indications for Use, Comparison to Predicates, and Performance Testing.",
    datasetExtraction: "Extract exactly 50 key entities from the following 510(k) summary. Return the result as a JSON array of objects with fields: id (string), category (Technical/Regulatory/Clinical/Administrative), name (string), value (string), description (string).\n\nSummary:\n{{fdaSummary}}",
    reviewReport: "Create a comprehensive 510(k) review report in {{language}} of approximately 3000-4000 words using the provided template. \n\nTemplate:\n{{template}}\n\nContext:\n- Web Summary: {{webSummary}}\n- 510(k) Summary: {{fdaSummary}}\n- Dataset: {{dataset}}\n\nRequirements:\n1. Include 5 detailed tables.\n2. Incorporate the 20 most critical entities from the dataset.\n3. Attach a detailed review checklist.\n4. End with 20 comprehensive follow-up questions designed to probe for weaknesses (Adversarial Red Team approach).",
    skillCreation: "Create a standardized Skill.md file based on the logic used in this review process. This skill should be for \"Creating Comprehensive Review Reports for Similar Devices\". \n\nAdd 3 \"WOW\" AI features to this skill:\n1. Automated Risk Scoring based on MAUDE safety signals.\n2. Real-time Predicate Mapping Visualization logic.\n3. Adversarial Rejection Trigger Simulation.\n\nFormat as a valid Markdown file with YAML frontmatter.",
    formQuestions: "Generate 20 comprehensive follow-up questions for the 510(k) submission form based on the extracted dataset. These should be technical and regulatory in nature. Return as a JSON array of strings.\n\nDataset: {{dataset}}",
    noteCoralize: "Highlight critical regulatory keywords in this text by wrapping them in **bold**. Focus on FDA terms, standards, and safety requirements.",
    noteSummarize: "Condense these notes into clear, executive bullet points focusing on regulatory impact.",
    noteFormalize: "Transform these informal notes into formal, professional regulatory language suitable for an FDA submission.",
    skillArchitect: "Act as a Skill Architect. Create a standardized Skill.md file based on the following user description. \n\nDescription: {{description}}\n\nRequirements:\n1. Valid YAML frontmatter (name, description).\n2. Detailed markdown instructions.\n3. Add 3 \"WOW\" AI features that enhance this specific skill (e.g., automated risk scoring, predicate mapping, adversarial red teaming).\n4. Include a section for \"Technical Data Models\" if applicable."
  }
};
