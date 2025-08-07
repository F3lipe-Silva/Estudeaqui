'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit and export the 'ai' object.
export const ai = genkit({
  plugins: [
    // Configure the Google AI plugin with your API key.
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  // Log all traces to the console.
  // In a production environment, you may want to disable the developer UI.
  // enableDevUi: false,
  // Flow state is stored in memory by default. For production, you should
  // configure a different state store.
  // flowStateStore: 'firebase',
});

// Define the 'eq' helper globally for Genkit
ai.defineHelper('eq', (a: any, b: any) => {
  return a === b;
});

// Register custom Handlebars helper

export {googleAI}; // Exportar googleAI também
