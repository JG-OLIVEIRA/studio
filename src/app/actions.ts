
'use server';

import * as DataService from '@/lib/data-service';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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


// Admin actions

/**
 * Server action for admin login.
 */
export async function login(password: string) {
    if (password === process.env.ADMIN_SECRET) {
      cookies().set('admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return { success: true };
    }
    return { success: false, error: 'Senha incorreta.' };
}

/**
 * Server action for admin logout.
 */
export async function logout() {
    cookies().set('admin-auth', '', { expires: new Date(0) });
    redirect('/admin/login');
}


/**
 * Server action to approve a reported review.
 */
export async function approveReviewAction(reviewId: number) {
    await DataService.approveReview(reviewId);
    revalidatePath('/admin/dashboard');
}

/**
 * Server action to delete a reported review.
 */
export async function deleteReviewAction(reviewId: number) {
    await DataService.deleteReview(reviewId);
    revalidatePath('/admin/dashboard');
}
