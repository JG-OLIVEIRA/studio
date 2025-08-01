
'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance and
 * contains the moderation flow for validating user-submitted reviews.
 */

import { genkit } from 'genkit';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(),
  ],
  logSinks: ['console'],
  enableTracingAndMetrics: true,
});

const ModerationInputSchema = z.string();
const ModerationOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the content is appropriate or not.'),
  reason: z.string().describe('A brief reason for the decision, especially if not appropriate.'),
});

const moderationPrompt = ai.definePrompt({
  name: 'moderationPrompt',
  input: { schema: ModerationInputSchema },
  output: { schema: ModerationOutputSchema },
  prompt: `
    You are a content moderator for a university teacher review website. 
    Your task is to determine if a student's review is appropriate.
    The review must be respectful and focus on the teacher's pedagogy, didactics, and the student's learning experience.
    The review is INAPPROPRIATE if it contains:
    - Personal attacks, insults, or ad hominem arguments.
    - Hate speech, discrimination, or harassment.
    - Swear words, profanity, or vulgar language.
    - Unsubstantiated accusations or potentially libelous claims.
    - Spam, advertisements, or irrelevant content.

    Analyze the following review and determine if it is appropriate.

    Review: {{{prompt}}}
  `,
});

export const moderateReviewFlow = ai.defineFlow(
  {
    name: 'moderateReviewFlow',
    inputSchema: ModerationInputSchema,
    outputSchema: ModerationOutputSchema,
  },
  async (reviewText) => {
    const { output } = await moderationPrompt(reviewText);
    return output!;
  }
);
