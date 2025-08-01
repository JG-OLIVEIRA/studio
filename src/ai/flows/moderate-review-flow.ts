'use server';
/**
 * @fileoverview A review moderation AI flow.
 *
 * This file defines a Genkit flow that uses an AI model to determine if a
 * user-submitted review is appropriate for the platform.
 */
import { ai } from '@/ai';
import { z } from 'zod';

// Zod schema for the input of the moderation flow.
export const ModerationInputSchema = z.string();

// Zod schema for the output of the moderation flow.
export const ModerationOutputSchema = z.object({
  isAppropriate: z
    .boolean()
    .describe('Whether the review is appropriate or not.'),
  reason: z
    .string()
    .optional()
    .describe(
      'A brief reason if the review is inappropriate. Provide this only if isAppropriate is false.'
    ),
});

export type ModerationOutput = z.infer<typeof ModerationOutputSchema>;

// Define the prompt for the AI model.
const moderationPrompt = ai.definePrompt({
  name: 'reviewModerationPrompt',
  input: { schema: z.object({ reviewText: ModerationInputSchema }) },
  output: { schema: ModerationOutputSchema },
  prompt: `
    You are a content moderator for a university professor review website.
    Your task is to determine if a review is appropriate for the platform.
    The review must be respectful and focus on the professor's teaching, didactics, and the student's learning experience.

    A review is INAPPROPRIATE if it contains:
    - Hate speech, discrimination, or slurs of any kind.
    - Personal attacks, insults, or degrading comments about the professor's appearance, personal life, or character.
    - Profanity, vulgar language, or sexually explicit content.
    - Threats of violence or harassment.
    - False information, spam, or off-topic content.

    Review the following text and determine if it is appropriate.

    Review: {{{reviewText}}}
  `,
});

// Define the Genkit flow for moderation.
export const moderateReviewFlow = ai.defineFlow(
  {
    name: 'moderateReviewFlow',
    inputSchema: ModerationInputSchema,
    outputSchema: ModerationOutputSchema,
  },
  async (reviewText) => {
    // If the review text is empty or just whitespace, consider it appropriate.
    if (!reviewText || !reviewText.trim()) {
      return { isAppropriate: true };
    }

    const { output } = await moderationPrompt({ reviewText });
    return output!;
  }
);
