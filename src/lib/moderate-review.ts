
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
    permissao: z.boolean().describe('Se a avaliação tem permissão para ser publicada. Deve ser `false` se houver discurso de ódio, ataques pessoais, spam, ou conteúdo não relacionado.'),
    motivo: z.string().describe('Uma breve explicação (em português) do motivo pelo qual a avaliação não foi permitida. Seja claro e conciso. Ex: "A avaliação contém ataques pessoais."'),
});

export const moderateReviewFlow = ai.defineFlow(
  {
    name: 'moderateReviewFlow',
    inputSchema: ModerationInputSchema,
    outputSchema: ModerationOutputSchema,
  },
  async (reviewText) => {
    const prompt = `
        Analise a seguinte avaliação de um professor. A avaliação deve ser construtiva e respeitosa.
        Determine se a avaliação é permitida com base nas seguintes regras:
        1.  Não é permitido discurso de ódio, assédio, ou qualquer forma de linguagem ofensiva.
        2.  Não são permitidos ataques pessoais diretos ao professor que não sejam relacionados à sua didática ou postura profissional.
        3.  Não é permitido spam, propaganda ou conteúdo não relacionado a uma avaliação de um professor.
        4.  Críticas à didática, método de avaliação, ou organização são permitidas, desde que feitas de forma respeitosa.

        Avaliação: "${reviewText}"

        Com base nessas regras, defina os campos 'permissao' e 'motivo'.
    `;
    
    const llmResponse = await ai.generate({
      prompt: prompt,
      model: googleAI.model('gemini-1.5-flash'),
      output: {
        schema: ModerationOutputSchema,
      },
      config: {
        temperature: 0.1,
      },
    });

    const output = llmResponse.output();
    if (!output) {
        // In case the model fails to return a structured response, we deny permission by default for safety.
        return { permissao: false, motivo: 'Não foi possível analisar a avaliação.' };
    }
    return output;
  }
);
