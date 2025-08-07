
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import 'firebase/firestore'; // side-effect only import

// This is a server-only import and should not be used in client-side code.
// It is used to ensure that the server-side dependencies are bundled correctly.
// See: https://firebase.google.com/docs/build/extend-with-genkit
import "@/lib/genkit-server";

// Initialize Genkit and export the 'ai' object.
export const ai = genkit({
  plugins: [
    // Configure the Google AI plugin with your API key.
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    // If you are using Firebase, configure the Firebase plugin.
    // firebase(),
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
