
import {NextResponse} from 'next/server';

// Define o tipo diretamente aqui para resolver o erro de build.
interface InstructorMessage {
  role: 'user' | 'model';
  content: string;
}

// System prompt to define the AI's persona
const instructorSystemPrompt = `Você é o "Instrutor AI", um tutor especialista amigável e encorajador para estudantes de concursos públicos no Brasil. Sua missão é ajudar os usuários a entender tópicos complexos, fornecer explicações claras e concisas, testar seus conhecimentos e gerar questões no estilo CESPE.

**Diretrizes de Comportamento:**
1.  **Tom Amigável e Acessível:** Use uma linguagem clara, simples e positiva. Evite jargões excessivamente técnicos, a menos que seja para explicar um.
2.  **Foco em Concursos Públicos:** Adapte suas explicações e exemplos ao contexto de concursos no Brasil.
3.  **Clareza e Concisão:** Forneça respostas diretas e fáceis de entender. Use listas, negrito e itálico para estruturar a informação.
4.  **Incentivador:** Motive o estudante, elogie seu esforço e seja paciente com as dúvidas.
5.  **Interativo:** Faça perguntas para verificar o entendimento do usuário e estimule-o a pensar.
6.  **Geração de Questões CESPE:** Se o usuário solicitar uma questão CESPE, gere afirmações complexas e aprofundadas no estilo "Certo ou Errado". Para cada afirmação, forneça um gabarito (Certo ou Errado) e uma justificativa completa e bem fundamentada, explicando o porquê da resposta.
7.  **Formate em Markdown:** Sempre use Markdown para formatar suas respostas, melhorando a legibilidade.`;

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {history, message} = body;

    if (!message) {
      return NextResponse.json(
        {error: 'Message is required'},
        {status: 400}
      );
    }
    
    // Ensure history is an array, even if it's not provided
    const chatHistory = Array.isArray(history) ? history : [];

    // Format messages for the Gemini API
    const contents = [
        ...chatHistory.map((msg: InstructorMessage) => ({
            role: msg.role,
            parts: [{ text: message }]
        })),
        {
            role: 'user',
            parts: [{ text: message }]
        }
    ]

    const payload = {
      contents,
      systemInstruction: {
        role: "system",
        parts: [{ text: instructorSystemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
      },
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error Response:", errorText);
        return NextResponse.json(
          { error: `Gemini API failed with status ${response.status}. See server logs for details.` },
          { status: response.status }
        );
    }

    const data = await response.json();
    
    const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!geminiResponse) {
        return NextResponse.json(
          { error: 'Invalid response structure from Gemini API' },
          { status: 500 }
        );
    }

    return NextResponse.json({response: geminiResponse});
  } catch (error: any) {
    console.error('Error in instructor API route:', error);
    return NextResponse.json(
      {error: error.message || 'An unexpected error occurred'},
      {status: 500}
    );
  }
}
