'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance.
 * It configures the AI with Google AI and Firebase plugins for production-grade
 * functionality within the application.
 */
import { genkit } from 'genkit';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';

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