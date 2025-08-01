
'use server';

import * as DataService from '@/lib/data-service';
import { revalidatePath } from 'next/cache';

/**
 * Server action to handle form submission for adding a teacher or review.
 * It calls the data service to interact with the database.
 */
export async function handleAddTeacherOrReview(data: {
    teacherName: string;
    subjectNames: string[]; 
    reviewText?: string; // Allow undefined
    reviewRating: number;
}) {
    // Pass the data, ensuring reviewText is a string
    await DataService.addTeacherOrReview({
        ...data,
        reviewText: data.reviewText || '',
    });
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
 * Server action to report a review.
 */
export async function reportReview(reviewId: number) {
    await DataService.reportReview(reviewId);
    revalidatePath('/');
    revalidatePath('/subjects');
}


/**
 * Server action to fetch all teachers.
 */
export async function getAllTeachers() {
    return DataService.getAllTeachers();
}

/**
 * Server action to approve a reported review, potentially deleting it.
 */
export async function approveReportedReview(reviewId: number) {
    await DataService.approveReport(reviewId);
    revalidatePath('/moderation');
}

/**
 * Server action to reject a reported review, marking it as safe.
 */
export async function rejectReportedReview(reviewId: number) {
    await DataService.rejectReport(reviewId);
    revalidatePath('/moderation');
}
