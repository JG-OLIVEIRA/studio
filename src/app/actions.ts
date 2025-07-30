'use server';

import { generateReviewInsights, type GenerateReviewInsightsInput, type GenerateReviewInsightsOutput } from "@/ai/flows/generate-review-insights";

export async function getAIInsights(input: GenerateReviewInsightsInput): Promise<GenerateReviewInsightsOutput> {
  try {
    const output = await generateReviewInsights(input);
    return output;
  } catch (error) {
    console.error("Error generating review insights:", error);
    throw new Error("Failed to generate AI insights. Please try again later.");
  }
}
