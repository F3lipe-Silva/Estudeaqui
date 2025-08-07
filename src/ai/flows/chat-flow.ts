
'use server';
/**
 * @fileOverview A flow for handling conversational chat.
 *
 * - chat: Handles a new message in a conversation.
 * - ChatMessage: The type for a single message in the chat history.
 * - ChatInput: The input type for the chat flow.
 * - ChatOutput: The output type for the chat flow.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@/ai/genkit'; // Importar googleAI daqui
import {z} from 'zod';
import { ChatMessage, ChatInput, ChatOutput, ChatInputSchema, ChatOutputSchema } from './chat-types';


const systemPrompt = `Você é um tutor especialista e amigável para concursos públicos. Sua missão é ajudar os usuários a esclarecer dúvidas, entender tópicos complexos e se manterem motivados. Responda à última mensagem do usuário de forma clara, concisa e encorajadora.`;

const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: {schema: ChatInputSchema},
    output: {schema: ChatOutputSchema},
    system: systemPrompt,
    prompt: `{{#each history}}
{{#if isUser}}
User: {{{content}}}
{{else}}
Assistant: {{{content}}}
{{/if}}
{{/each}}

User: {{{message}}}
Assistant:`,
    config: {
        model: googleAI.model('gemini-1.5-flash'), // Usar a referência completa ao modelo
        temperature: 0.7,
    },
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const processedHistory = input.history.map(msg => ({
      ...msg,
      isUser: msg.role === 'user',
      isAssistant: msg.role === 'model',
    }));
    const { output } = await chatPrompt({ ...input, history: processedHistory });
    return output!;
  }
);


export async function chat(input: ChatInput): Promise<ChatOutput> {
  const result = await chatFlow(input);
  return result;
}
