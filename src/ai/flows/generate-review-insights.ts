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
      'AI-generated insights from the student reviews, written in a humorous and funny style.'
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
  prompt: `Você é um assistente de IA com um ótimo senso de humor, encarregado de analisar avaliações de alunos para professores.

  Professor: {{{teacherName}}}
  Matéria: {{{subject}}}
  Avaliações:
  {{#each reviews}}
  - {{{this}}}
  {{/each}}

  Sua missão é dupla:
  1.  Gerar um resumo conciso (menos de 200 palavras) e ENGRAÇADO sobre os pontos fortes e fracos do professor. Use um tom divertido, como se estivesse contando um segredo para um colega.
  2.  Com base nas avaliações, calcule a "Chance de Passar Sem Estudar". Esta é uma nota de 1 a 5, onde 1 é "esquece, precisa virar um monge tibetano nos estudos" e 5 é "dá pra passar jogando videogame o semestre todo". Seja honesto, mas divertido na sua avaliação.

  A resposta deve ser em português do Brasil.
  `,
});

const generateReviewInsightsFlow = ai.defineFlow(
  {
    name: 'generateReviewInsightsFlow',
    inputSchema: GenerateReviewInsightsInputSchema,
    outputSchema: GenerateReviewInsightsOutputSchema,
  },
  async (input) => {
    // Handle the case where there are no reviews to avoid calling the AI with an empty prompt.
    if (!input.reviews || input.reviews.length === 0) {
      return {
        insights: 'Ainda não há avaliações suficientes para que a IA possa gerar uma análise divertida. Adicione uma avaliação para começar!',
        passWithoutStudyingChance: 1,
      };
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
