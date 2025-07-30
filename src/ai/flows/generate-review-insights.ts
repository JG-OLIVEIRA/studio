'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating insights from teacher reviews.
 *
 * generateReviewInsights - A function that generates AI insights from teacher reviews.
 * GenerateReviewInsightsInput - The input type for the generateReviewInsights function.
 * GenerateReviewInsightsOutput - The return type for the generateReviewInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReviewInsightsInputSchema = z.object({
  teacherName: z.string().describe('The name of the teacher.'),
  subject: z.string().describe('The subject taught by the teacher.'),
  reviews: z.array(z.string()).describe('An array of student reviews for the teacher.'),
});
export type GenerateReviewInsightsInput = z.infer<typeof GenerateReviewInsightsInputSchema>;

const GenerateReviewInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-generated insights from the student reviews.'),
});
export type GenerateReviewInsightsOutput = z.infer<typeof GenerateReviewInsightsOutputSchema>;

export async function generateReviewInsights(input: GenerateReviewInsightsInput): Promise<GenerateReviewInsightsOutput> {
  return generateReviewInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReviewInsightsPrompt',
  input: {schema: GenerateReviewInsightsInputSchema},
  output: {schema: GenerateReviewInsightsOutputSchema},
  prompt: `You are an AI assistant tasked with generating insights from student reviews for teachers.

  Teacher Name: {{{teacherName}}}
  Subject: {{{subject}}}
  Reviews:
  {{#each reviews}}
  - {{{this}}}
  {{/each}}

  Generate a concise summary of the key strengths and weaknesses highlighted in the reviews. Focus on providing actionable insights for the teacher.
  Response should be less than 200 words.
  `,
});

const generateReviewInsightsFlow = ai.defineFlow(
  {
    name: 'generateReviewInsightsFlow',
    inputSchema: GenerateReviewInsightsInputSchema,
    outputSchema: GenerateReviewInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
