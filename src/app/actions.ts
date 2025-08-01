
'use server';

import * as DataService from '@/lib/data-service';
import { revalidatePath } from 'next/cache';

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
