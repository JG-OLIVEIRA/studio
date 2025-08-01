
'use server';

/**
 * @fileOverview This file defines a Genkit flow for moderating teacher reviews in real-time.
 *
 * realtimeModerateReview - A function that checks if a review text is problematic as it's being typed.
 * ModerateReviewInput - The input type for the realtimeModerateReview function.
 * ModerateReviewOutput - The return type for the realtimeModerateReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateReviewInputSchema = z.object({
  reviewText: z.string().describe('The partial or full text content of the student review.'),
});
export type ModerateReviewInput = z.infer<typeof ModerateReviewInputSchema>;

const ModerateReviewOutputSchema = z.object({
  isProblematic: z.boolean().describe('Whether the review is problematic or not.'),
  reason: z.string().optional().describe('A short, user-facing reason why the text is problematic.'),
});
export type ModerateReviewOutput = z.infer<typeof ModerateReviewOutputSchema>;

export async function realtimeModerateReview(input: ModerateReviewInput): Promise<ModerateReviewOutput> {
  return realtimeModerateReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realtimeModerateReviewPrompt',
  input: {schema: ModerateReviewInputSchema},
  output: {schema: ModerateReviewOutputSchema},
  model: 'googleai/gemini-2.0-flash', // Use a faster model for real-time feedback
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are a real-time content moderation AI for a teacher review website. Your task is to analyze the following student review text as it's being typed and determine if it violates community guidelines. Be very fast and concise.

  Community Guidelines to check for:
  1.  **Personal attacks or hate speech:** No insults, threats, harassment, or derogatory comments.
  2.  **Serious accusations:** Do not allow criminal accusations (e.g., "he assaults students").
  3.  **Profanity:** Do not allow vulgar or obscene language.
  4.  **Spam/Low-quality:** No repetitive, nonsensical, or clearly non-genuine text (e.g., "asdasdasd asdasdasd").

  Review Text:
  "{{{reviewText}}}"

  Analyze the text. If it violates a guideline, return \`isProblematic: true\` and a very brief, helpful reason (max 10 words, in Portuguese) explaining the problem. The reason should help the user fix their review. If the text is fine, return \`isProblematic: false\`.

  Examples:
  - Text: "O professor é um idiota" -> isProblematic: true, reason: "A avaliação contém um ataque pessoal. Por favor, seja respeitoso."
  - Text: "A aula foi um pouco desorganizada." -> isProblematic: false
  - Text: "Este professor comete crimes" -> isProblematic: true, reason: "A avaliação contém uma acusação grave. Use canais apropriados."
  - Text: "muito bom muito bom muito bom" -> isProblematic: true, reason: "O texto parece ser repetitivo ou spam."
  - Text: "que m*rda de aula" -> isProblematic: true, reason: "Por favor, evite usar linguagem vulgar ou ofensiva."

  Your response must be immediate and brief.
  `,
});

const realtimeModerateReviewFlow = ai.defineFlow(
  {
    name: 'realtimeModerateReviewFlow',
    inputSchema: ModerateReviewInputSchema,
    outputSchema: ModerateReviewOutputSchema,
  },
  async (input) => {
    // Basic check for length to avoid calling AI on very short, meaningless strings.
    if (input.reviewText.trim().length < 5) {
        return { isProblematic: false };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
