
'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance and
 * contains the moderation flow for validating user-submitted reviews.
 */
import { genkit } from 'genkit';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Initialize Genkit with the Google AI plugin for generative models
// and the Firebase plugin for production-grade observability.
export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(), // Using Firebase plugin for observability
  ],
  // Log metadata and flow states to the console for local development.
  logSinks: ['console'],
  // Enable OpenTelemetry for tracing and performance monitoring.
  enableTracingAndMetrics: true,
});

// Zod schema for the output of the moderation flow.
const ModerationSchema = z.object({
    permissao: z.boolean().describe('Se a avaliação tem permissão para ser publicada.'),
    motivo: z.string().optional().describe('O motivo pelo qual a avaliação não pode ser publicada. Forneça uma razão clara e concisa.'),
});

// Genkit flow for moderating review text.
export const moderateReviewFlow = ai.defineFlow(
  {
    name: 'moderateReviewFlow',
    inputSchema: z.string(),
    outputSchema: ModerationSchema,
  },
  async (reviewText) => {
    const prompt = `
        Você é um moderador de conteúdo para um site de avaliação de professores. Sua tarefa é determinar se a seguinte avaliação de um aluno pode ser publicada.

        Regras de Moderação:
        1.  **Proibido Discurso de Ódio e Assédio**: Não publique avaliações que contenham discurso de ódio, ataques pessoais, ameaças, assédio ou qualquer forma de bullying direcionado ao professor ou a outras pessoas.
        2.  **Foco na Didática**: A avaliação deve se concentrar na experiência de aprendizado, na didática do professor, no material do curso e em aspectos profissionais.
        3.  **Proibido Conteúdo Explícito ou Ofensivo**: Não publique avaliações com linguagem sexualmente explícita, profanidade excessiva ou conteúdo ofensivo.
        4.  **Proibido Informações Pessoais**: Não publique avaliações que contenham informações pessoais do professor ou de outros alunos (e-mail, telefone, etc.).
        5.  **Permitido Críticas Construtivas**: Críticas sobre a metodologia de ensino, dificuldade da matéria, ou clareza das explicações são permitidas, desde que sejam expressas de forma respeitosa e construtiva.

        Texto da Avaliação para Análise:
        "${reviewText}"

        Com base nas regras, decida se a avaliação tem permissão para ser publicada. Responda no formato JSON especificado. Se a permissão for negada, forneça um motivo claro e conciso.
    `;
    
    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-1.5-flash',
      output: {
        schema: ModerationSchema,
      },
      config: {
        temperature: 0.1,
      },
    });

    return llmResponse.output() ?? { permissao: false, motivo: 'Falha ao processar a moderação.' };
  }
);
