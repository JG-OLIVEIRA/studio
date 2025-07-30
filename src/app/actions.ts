'use server';

import { generateReviewInsights, type GenerateReviewInsightsInput, type GenerateReviewInsightsOutput } from "@/ai/flows/generate-review-insights";
import * as DataService from '@/lib/data-service';

export async function getAIInsights(input: GenerateReviewInsightsInput): Promise<GenerateReviewInsightsOutput> {
  try {
    const output = await generateReviewInsights(input);
    return output;
  } catch (error) {
    console.error("Error generating review insights:", error);
    throw new Error("Failed to generate AI insights. Please try again later.");
  }
}

/**
 * Server action to handle form submission for adding a teacher or review.
 * It calls the data service to interact with the database.
 *
 * NOTE: This function is not strictly necessary as the client could call
 * `DataService.addTeacherOrReview` directly if it's marked with 'use server'.
 * However, having a dedicated actions file is a good practice for organizing
 * server-side logic that is callable from the client.
 */
export async function handleAddTeacherOrReview(data: {
    teacherName: string;
    subjectName: string;
    reviewAuthor: string;
    reviewText: string;
    reviewRating: number;
}) {
    await DataService.addTeacherOrReview(data);
}
