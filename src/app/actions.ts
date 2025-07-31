
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
    // Return a structured error response that the component can handle gracefully.
    return {
      insights: "A IA não conseguiu gerar uma análise para este professor no momento. Isso pode acontecer se as avaliações forem muito curtas ou por um problema temporário. Tente novamente mais tarde.",
      passWithoutStudyingChance: 0, // Return a default/neutral value
    };
  }
}

/**
 * Server action to handle form submission for adding a teacher or review.
 * It calls the data service to interact with the database.
 */
export async function handleAddTeacherOrReview(data: {
    teacherName: string;
    subjectNames: string[]; // Alterado para aceitar múltiplos nomes de matérias
    reviewText: string;
    reviewRating: number;
}) {
    await DataService.addTeacherOrReview(data);
    revalidatePath('/'); // Revalida a página principal e a de matérias
    revalidatePath('/subjects');
}


/**
 * Server action to fetch all subjects data.
 * It calls the data service to interact with the database.
 */
export async function getSubjectsData() {
    return DataService.getSubjects();
}

/**
 * Server action to upvote a review.
 */
export async function upvoteReview(reviewId: number) {
    await DataService.upvoteReview(reviewId);
    revalidatePath('/');
    revalidatePath('/subjects');
}

/**
 * Server action to downvote a review.
 */
export async function downvoteReview(reviewId: number) {
    await DataService.downvoteReview(reviewId);
    revalidatePath('/');
    revalidatePath('/subjects');
}

/**
 * Server action to fetch all teachers.
 */
export async function getAllTeachers() {
    return DataService.getAllTeachers();
}
