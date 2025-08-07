'use server';

/**
 * @fileoverview This file contains server-only imports and setup for Genkit.
 * By isolating these here, we prevent them from being bundled in the client-side
 * code, which would cause build errors.
 */

// These imports are for the side-effect of ensuring the Next.js bundler
// includes these server-side modules. They are initialized in `src/ai/genkit.ts`.
