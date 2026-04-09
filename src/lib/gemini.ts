
import { GoogleGenAI, Type } from "@google/genai";
import { ReviewResults, Entity, LLMSettings } from "../types";

export async function runSequentialReview(
  input: string,
  template: string,
  language: 'Traditional Chinese' | 'English',
  settings: LLMSettings,
  onProgress: (step: number, message: string) => void
): Promise<ReviewResults> {
  const ai = new GoogleGenAI({ apiKey: settings.apiKey });
  const model = settings.modelFlash;
  const proModel = settings.modelPro;

  // Step 1: Web Search Summary
  onProgress(1, "Searching FDA guidance and predicate trends...");
  const webSummaryResponse = await (ai as any).models.generateContent({
    model: proModel,
    contents: settings.prompts.webSummary
      .replace('{{language}}', language)
      .replace('{{input}}', input),
    config: {
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true }
    }
  });
  const webSummary = webSummaryResponse.text || "Failed to generate web summary.";

  // Step 2: 510(k) Summary
  onProgress(2, "Synthesizing technical 510(k) summary...");
  const fdaSummaryResponse = await (ai as any).models.generateContent({
    model: proModel,
    contents: settings.prompts.fdaSummary
      .replace('{{language}}', language)
      .replace('{{webSummary}}', webSummary)
      .replace('{{input}}', input),
  });
  const fdaSummary = fdaSummaryResponse.text || "Failed to generate FDA summary.";

  // Step 3: Dataset Extraction
  onProgress(3, "Extracting 50 key entities into JSON dataset...");
  const datasetResponse = await (ai as any).models.generateContent({
    model,
    contents: settings.prompts.datasetExtraction
      .replace('{{fdaSummary}}', fdaSummary),
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
  const reportResponse = await (ai as any).models.generateContent({
    model: proModel,
    contents: settings.prompts.reviewReport
      .replace('{{language}}', language)
      .replace('{{template}}', template || "Default Template: Include Executive Summary, Administrative ID, Device Description, Substantial Equivalence, Performance Data, and Conclusion.")
      .replace('{{webSummary}}', webSummary.substring(0, 2000) + "...")
      .replace('{{fdaSummary}}', fdaSummary.substring(0, 2000) + "...")
      .replace('{{dataset}}', JSON.stringify(dataset.slice(0, 10)) + "..."),
  });
  const report = reportResponse.text || "Failed to generate report.";

  // Step 5: Skill.md Creation
  onProgress(5, "Architecting reusable Skill.md...");
  const skillMdResponse = await (ai as any).models.generateContent({
    model,
    contents: settings.prompts.skillCreation,
  });
  const skillMd = skillMdResponse.text || "Failed to generate Skill.md.";

  // Generate Follow-up Questions for Form
  onProgress(6, "Finalizing follow-up questions...");
  const questionsResponse = await (ai as any).models.generateContent({
    model,
    contents: settings.prompts.formQuestions
      .replace('{{dataset}}', JSON.stringify(dataset)),
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
    followUpQuestions: [], 
    formQuestions
  };
}
