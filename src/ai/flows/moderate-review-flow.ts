
'use server';

/**
 * @fileOverview This file defines a Genkit flow for moderating teacher reviews.
 *
 * moderateReview - A function that checks if a review text is problematic.
 * ModerateReviewInput - The input type for the moderateReview function.
 * ModerateReviewOutput - The return type for the moderateReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateReviewInputSchema = z.object({
  reviewText: z.string().describe('The text content of the student review.'),
});
export type ModerateReviewInput = z.infer<typeof ModerateReviewInputSchema>;

const ModerateReviewOutputSchema = z.object({
  isProblematic: z.boolean().describe('Whether the review is problematic or not.'),
  reason: z.string().optional().describe('The reason why the review is considered problematic. This will be shown to the user.'),
});
export type ModerateReviewOutput = z.infer<typeof ModerateReviewOutputSchema>;

export async function moderateReview(input: ModerateReviewInput): Promise<ModerateReviewOutput> {
  return moderateReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateReviewPrompt',
  input: {schema: ModerateReviewInputSchema},
  output: {schema: ModerateReviewOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `Você é um moderador de conteúdo de IA para um site de avaliação de professores. Sua tarefa é analisar a seguinte avaliação de um aluno e determinar se ela viola alguma das diretrizes da comunidade.

  Diretrizes da Comunidade:
  1.  **Sem ataques pessoais ou discurso de ódio:** Não são permitidos insultos, ameaças, assédio, ou comentários depreciativos baseados em raça, etnia, religião, gênero, orientação sexual, etc.
  2.  **Seja respeitoso e construtivo:** Concentre-se na experiência de aprendizado e na didática do professor. Críticas são bem-vindas, desde que sejam expressas de forma respeitosa.
  3.  **Sem informações falsas ou acusações graves:** Não faça acusações criminosas ou alegações factuais graves que não possam ser comprovadas.
  4.  **Mantenha o foco no tópico:** A avaliação deve ser sobre o professor e a matéria, não sobre outros alunos ou assuntos irrelevantes.
  5.  **Não use linguagem vulgar ou obscena.**

  Texto da Avaliação:
  "{{{reviewText}}}"

  Analise o texto e decida se ele é problemático (isProblematic: true) ou não (isProblematic: false). Se for problemático, forneça um motivo claro e conciso (em português) que será exibido ao usuário, explicando qual diretriz foi violada. O motivo deve ser útil e educacional, ajudando o usuário a reformular sua avaliação.

  Exemplos:
  -   Avaliação: "O professor é um idiota e não sabe nada." -> isProblematic: true, reason: "A avaliação contém um ataque pessoal. Por favor, concentre-se na didática e evite insultos."
  -   Avaliação: "Eu odeio essa matéria, é a pior de todas." -> isProblematic: false (É uma opinião sobre a matéria, não um ataque ao professor).
  -   Avaliação: "A aula foi um pouco desorganizada, tive dificuldade em acompanhar." -> isProblematic: false.
  -   Avaliação: "Este professor assedia alunas." -> isProblematic: true, reason: "A avaliação contém uma acusação grave. Por favor, relate questões sérias à administração da universidade, não através de uma avaliação anônima."

  Se a avaliação estiver de acordo com as diretrizes, retorne isProblematic: false, sem um motivo.
  `,
});

export const moderateReviewFlow = ai.defineFlow(
  {
    name: 'moderateReviewFlow',
    inputSchema: ModerateReviewInputSchema,
    outputSchema: ModerateReviewOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
