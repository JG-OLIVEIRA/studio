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
  prompt: `Você é um assistente de IA encarregado de gerar insights a partir de avaliações de alunos para professores.

  Nome do Professor: {{{teacherName}}}
  Matéria: {{{subject}}}
  Avaliações:
  {{#each reviews}}
  - {{{this}}}
  {{/each}}

  Gere um resumo conciso dos principais pontos fortes e fracos destacados nas avaliações. Concentre-se em fornecer insights práticos para o professor.
  A resposta deve ter menos de 200 palavras e ser em português do Brasil.
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
