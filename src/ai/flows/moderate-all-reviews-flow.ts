
'use server';

/**
 * @fileOverview This file defines a Genkit flow for moderating all reviews in the database.
 *
 * runFullModeration - A function that fetches all reviews and runs moderation on them.
 * ProblematicReview - The type for a review that was flagged by the AI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllReviewsForModeration } from '@/lib/data-service';
import { moderateReview, type ModerateReviewOutput } from './moderate-review-flow';
import type { Review } from '@/lib/types';


const ProblematicReviewSchema = z.object({
  id: z.number(),
  text: z.string(),
  rating: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  reported: z.boolean(),
  createdAt: z.string(),
  teacherName: z.string(),
  subjectName: z.string(),
  reason: z.string(),
});
export type ProblematicReview = z.infer<typeof ProblematicReviewSchema>;

export async function runFullModeration(): Promise<ProblematicReview[]> {
    return runFullModerationFlow();
}

const runFullModerationFlow = ai.defineFlow(
  {
    name: 'runFullModerationFlow',
    inputSchema: z.void(),
    outputSchema: z.array(ProblematicReviewSchema),
  },
  async () => {
    console.log("Iniciando verificação completa de moderação por IA...");
    const reviewsToModerate = await getAllReviewsForModeration();
    console.log(`Encontradas ${reviewsToModerate.length} avaliações para verificar.`);

    const problematicReviews: ProblematicReview[] = [];

    // Process reviews in parallel to speed up the process
    const moderationPromises = reviewsToModerate.map(async (review) => {
        try {
            const moderationResult = await moderateReview({ reviewText: review.text });
            if (moderationResult.isProblematic && moderationResult.reason) {
                return {
                    ...review,
                    reason: moderationResult.reason,
                };
            }
        } catch (error) {
            console.error(`Erro ao moderar a avaliação ID ${review.id}:`, error);
        }
        return null;
    });

    const results = await Promise.all(moderationPromises);

    // Filter out the null results (non-problematic reviews)
    const filteredResults = results.filter((r): r is ProblematicReview => r !== null);
    
    console.log(`Verificação por IA concluída. Encontradas ${filteredResults.length} avaliações problemáticas.`);
    return filteredResults;
  }
);
