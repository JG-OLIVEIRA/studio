
"use client";

import { useState, useEffect } from 'react';
import type { Teacher } from '@/lib/types';
import WelcomeReviewDialog from './welcome-review-dialog';

interface WelcomeReviewHandlerProps {
    teachers: Teacher[];
    onSubmit: (data: any) => Promise<void>;
}

export default function WelcomeReviewHandler({ teachers, onSubmit }: WelcomeReviewHandlerProps) {
    const [teacherToPrompt, setTeacherToPrompt] = useState<Teacher | null>(null);

    useEffect(() => {
        // This logic now runs only on the client-side
        let selectedTeacher = null;
        
        const teachersWithNoReviews = teachers.filter(t => t.reviews.length === 0);
        if (teachersWithNoReviews.length > 0) {
            // Pick a random teacher with no reviews
            selectedTeacher = teachersWithNoReviews[Math.floor(Math.random() * teachersWithNoReviews.length)];
        } else {
            // If all teachers have reviews, find one with less than 2
            const teachersWithFewReviews = teachers.filter(t => t.reviews.length > 0 && t.reviews.length < 2);
            if (teachersWithFewReviews.length > 0) {
            // Pick a random teacher with few reviews
            selectedTeacher = teachersWithFewReviews[Math.floor(Math.random() * teachersWithFewReviews.length)];
            }
        }

        setTeacherToPrompt(selectedTeacher);
    }, [teachers]);

    if (!teacherToPrompt) {
        return null;
    }

    return (
        <WelcomeReviewDialog 
            teacherToPrompt={teacherToPrompt}
            onSubmit={onSubmit}
        />
    );
}
