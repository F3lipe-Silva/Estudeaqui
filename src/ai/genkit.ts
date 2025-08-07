// This file re-exports Genkit and Google AI objects from the server-side setup.
// This ensures that server-only imports are handled correctly by Next.js.

import {ai, googleAI} from '@/lib/genkit-server';

export {ai, googleAI};
