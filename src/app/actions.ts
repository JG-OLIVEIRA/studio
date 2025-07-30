'use server';

import { generateReviewInsights, type GenerateReviewInsightsInput, type GenerateReviewInsightsOutput } from "@/ai/flows/generate-review-insights";
import * as DataService from '@/lib/data-service';
import { revalidatePath } from 'next/cache';

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
 */
export async function handleAddTeacherOrReview(data: {
    teacherName: string;
    subjectName: string;
    reviewText: string;
    reviewRating: number;
}) {
    await DataService.addTeacherOrReview(data);
    revalidatePath('/'); // Revalidate the home page to show the new data
}

/**
 * Server action to fetch all subjects data.
 * It calls the data service to interact with the database.
 */
export async function getSubjectsData() {
    return DataService.getSubjects();
}

/**
 * Server action to delete a review.
 */
export async function deleteReview(reviewId: number) {
    await DataService.deleteReview(reviewId);
    revalidatePath('/');
}

/**
 * Server action to upvote a review.
 */
export async function upvoteReview(reviewId: number) {
    await DataService.upvoteReview(reviewId);
    revalidatePath('/');
}

/**
 * Server action to downvote a review.
 */
export async function downvoteReview(reviewId: number) {
    await DataService.downvoteReview(reviewId);
    revalidatePath('/');
}
