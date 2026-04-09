
import { GoogleGenAI, Type } from "@google/genai";
import { ReviewResults, Entity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function runSequentialReview(
  input: string,
  template: string,
  language: 'Traditional Chinese' | 'English',
  onProgress: (step: number, message: string) => void
): Promise<ReviewResults> {
  const model = "gemini-2.0-flash";
  const proModel = "gemini-1.5-pro";

  // Step 1: Web Search Summary
  onProgress(1, "Searching FDA guidance and predicate trends...");
  const webSummaryResponse = await ai.models.generateContent({
    model: proModel,
    contents: `Based on the following 510(k) information, search for the most recent and relevant FDA guidance documents, predicate trends, and regulatory requirements. Create a comprehensive summary in ${language} of approximately 2000-3000 words. Focus on compliance, safety signals, and technical expectations.
    
    Input Information:
    ${input}`,
    config: {
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true }
    }
  });
  const webSummary = webSummaryResponse.text || "Failed to generate web summary.";

  // Step 2: 510(k) Summary
  onProgress(2, "Synthesizing technical 510(k) summary...");
  const fdaSummaryResponse = await ai.models.generateContent({
    model: proModel,
    contents: `Create a comprehensive 510(k) technical summary in ${language} of approximately 3000-4000 words. Base this on the original user input and the following regulatory context:
    
    Regulatory Context:
    ${webSummary}
    
    User Input:
    ${input}
    
    Include sections for Device Description, Indications for Use, Comparison to Predicates, and Performance Testing.`,
  });
  const fdaSummary = fdaSummaryResponse.text || "Failed to generate FDA summary.";

  // Step 3: Dataset Extraction
  onProgress(3, "Extracting 50 key entities into JSON dataset...");
  const datasetResponse = await ai.models.generateContent({
    model,
    contents: `Extract exactly 50 key entities from the following 510(k) summary. Return the result as a JSON array of objects with fields: id (string), category (Technical/Regulatory/Clinical/Administrative), name (string), value (string), description (string).
    
    Summary:
    ${fdaSummary}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Technical', 'Regulatory', 'Clinical', 'Administrative'] },
            name: { type: Type.STRING },
            value: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['id', 'category', 'name', 'value', 'description']
        }
      }
    }
  });
  
  let dataset: Entity[] = [];
  try {
    dataset = JSON.parse(datasetResponse.text || "[]");
  } catch (e) {
    console.error("Failed to parse dataset JSON", e);
  }

  // Step 4: Review Report
  onProgress(4, "Generating comprehensive review report...");
  const reportResponse = await ai.models.generateContent({
    model: proModel,
    contents: `Create a comprehensive 510(k) review report in ${language} of approximately 3000-4000 words using the provided template. 
    
    Template:
    ${template || "Default Template: Include Executive Summary, Administrative ID, Device Description, Substantial Equivalence, Performance Data, and Conclusion."}
    
    Context:
    - Web Summary: ${webSummary.substring(0, 2000)}...
    - 510(k) Summary: ${fdaSummary.substring(0, 2000)}...
    - Dataset: ${JSON.stringify(dataset.slice(0, 10))}...
    
    Requirements:
    1. Include 5 detailed tables.
    2. Incorporate the 20 most critical entities from the dataset.
    3. Attach a detailed review checklist.
    4. End with 20 comprehensive follow-up questions designed to probe for weaknesses (Adversarial Red Team approach).`,
  });
  const report = reportResponse.text || "Failed to generate report.";

  // Step 5: Skill.md Creation
  onProgress(5, "Architecting reusable Skill.md...");
  const skillMdResponse = await ai.models.generateContent({
    model,
    contents: `Create a standardized Skill.md file based on the logic used in this review process. This skill should be for "Creating Comprehensive Review Reports for Similar Devices". 
    
    Add 3 "WOW" AI features to this skill:
    1. Automated Risk Scoring based on MAUDE safety signals.
    2. Real-time Predicate Mapping Visualization logic.
    3. Adversarial Rejection Trigger Simulation.
    
    Format as a valid Markdown file with YAML frontmatter.`,
  });
  const skillMd = skillMdResponse.text || "Failed to generate Skill.md.";

  // Generate Follow-up Questions for Form
  onProgress(6, "Finalizing follow-up questions...");
  const questionsResponse = await ai.models.generateContent({
    model,
    contents: `Generate 20 comprehensive follow-up questions for the 510(k) submission form based on the extracted dataset. These should be technical and regulatory in nature. Return as a JSON array of strings.
    
    Dataset: ${JSON.stringify(dataset)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  const formQuestions = JSON.parse(questionsResponse.text || "[]");

  return {
    webSummary,
    fdaSummary,
    dataset,
    report,
    skillMd,
    followUpQuestions: [], // Extracted from report text usually, but we can generate separately if needed
    formQuestions
  };
}
