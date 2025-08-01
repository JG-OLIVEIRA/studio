
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating insights from teacher reviews.
 *
 * generateReviewInsights - A function that generates AI insights from teacher reviews.
 * GenerateReviewInsightsInput - The input type for the generateReviewInsights function.
 * GenerateReviewInsightsOutput - The return type for the generateReviewinsights function.
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
  insights: z
    .string()
    .describe(
      'AI-generated insights from the student reviews, focusing on teaching style, difficulty, and exams.'
    ),
  passWithoutStudyingChance: z
    .number()
    .min(1)
    .max(5)
    .describe(
      'A score from 1 to 5 indicating the chance of a student passing with this teacher without studying, based on the reviews.'
    ),
});
export type GenerateReviewInsightsOutput = z.infer<typeof GenerateReviewInsightsOutputSchema>;

export async function generateReviewInsights(input: GenerateReviewInsightsInput): Promise<GenerateReviewInsightsOutput> {
  return generateReviewInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReviewInsightsPrompt',
  input: {schema: GenerateReviewInsightsInputSchema},
  output: {schema: GenerateReviewInsightsOutputSchema},
  prompt: `Você é um assistente de IA encarregado de analisar avaliações de alunos para professores.

  Professor: {{{teacherName}}}
  Matéria: {{{subject}}}
  Avaliações:
  {{#each reviews}}
  - {{{this}}}
  {{/each}}

  Sua missão é dupla:
  1.  Gerar um resumo curto e objetivo sobre os pontos principais das avaliações. Foque em:
      - **Didática e Dificuldade:** Como é o nível de dificuldade para entender a matéria com este professor? A didática é clara?
      - **Provas e Avaliações:** O que os alunos dizem sobre as provas? São justas, difíceis, baseadas na matéria dada?
  2.  Com base nas avaliações, calcule a "Chance de Passar Sem Estudar". Esta é uma nota de 1 a 5, onde 1 é "esquece, precisa estudar muito" e 5 é "dá pra passar com o pé nas costas". Seja realista.

  A resposta deve ser em português do Brasil. O resumo deve ser conciso e direto ao ponto.
  `,
});

const generateReviewInsightsFlow = ai.defineFlow(
  {
    name: 'generateReviewInsightsFlow',
    inputSchema: GenerateReviewInsightsInputSchema,
    outputSchema: GenerateReviewInsightsOutputSchema,
  },
  async (input) => {
    // Filter out reviews that are empty or just whitespace.
    const nonEmptyReviews = input.reviews.filter(review => review && review.trim() !== '');

    // Handle the case where there are no reviews with text to avoid calling the AI with an empty prompt.
    if (nonEmptyReviews.length === 0) {
      return {
        insights: 'Ainda não há avaliações escritas suficientes para que a IA possa gerar uma análise. Adicione uma avaliação para começar!',
        passWithoutStudyingChance: 1,
      };
    }
    
    const {output} = await prompt({
      ...input,
      reviews: nonEmptyReviews,
    });
    return output!;
  }
);
