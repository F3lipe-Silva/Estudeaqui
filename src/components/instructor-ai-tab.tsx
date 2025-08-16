'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, BrainCircuit, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// Define o tipo diretamente aqui para resolver o erro de build.
interface InstructorMessage {
  role: 'user' | 'model';
  content: string;
}


export default function InstructorAiTab() {
  const [messages, setMessages] = useState<InstructorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ankiCsvMode, setAnkiCsvMode] = useState(false); // Novo estado para o modo Anki CSV
  const [markdownMode, setMarkdownMode] = useState(false);
  const [repeatQuestionMode, setRepeatQuestionMode] = useState(false); // Novo estado para repetir a pergunta
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (markdownMode) {
      const modelMessage: InstructorMessage = { role: 'model', content: `${input};${input}` };
      setMessages((prev) => [...prev, modelMessage]);
      setInput('');
      return;
    }

    const userMessage: InstructorMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    const messageToSend = input;
    
    setInput('');

    try {
      const response = await fetch('/api/instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          message: messageToSend, // Envia a mensagem formatada para o backend
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      let modelContent = data.response;
      if (repeatQuestionMode) {
        modelContent = `${userMessage.content};${data.response}`; // Adiciona a pergunta do usuário na resposta
      }

      const modelMessage: InstructorMessage = {
        role: 'model',
        content: modelContent,
      };
      setMessages((prev) => {
        const newMessages = [...prev, modelMessage];
        // Habilitar o botão CSV se o modo Anki CSV estiver ativo e o conteúdo da resposta for o esperado para questões
        if (ankiCsvMode && data.response && typeof data.response === 'string') {
          if (data.response.includes('Certo') || data.response.includes('Errado') || data.response.includes('Gabarito')) {
            // Se o modo Anki CSV está ativo e a resposta parece uma questão, gerar CSV
            setTimeout(() => handleGenerateAnkiCsv(), 0); // Gerar CSV assincronamente
          }
        }
        return newMessages;
      });

    } catch (error: any) {
      const errorMessage: InstructorMessage = {
        role: 'model',
        content: `Desculpe, ocorreu um erro ao me conectar.

**Detalhes:**

${error.message}

 Verifique o console do navegador e do servidor para mais informações.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sanitizeCsvField = (text: string): string => {
    // Substitui todos os ';' por ',' exceto o separador principal
    let sanitizedText = text.replace(/;/g, ',');
    // Escapa aspas duplas por aspas duplas duplas
    sanitizedText = sanitizedText.replace(/"/g, '""');
    // Converte Markdown para HTML para suportar formatação no Anki
    // Isso é uma simplificação; uma biblioteca completa de markdown para HTML seria ideal
    sanitizedText = sanitizedText
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Negrito
      .replace(/\*(.*?)\*/g, '<i>$1</i>')   // Itálico
      .replace(/`(.*?)`/g, '<code>$1</code>'); // Código (monoespaçado)
    return sanitizedText;
  };

  const handleGenerateAnkiCsv = () => {
    if (!messages.length) return;

    const lastModelMessage = messages[messages.length - 1];
    if (lastModelMessage.role !== 'model') {
      console.error("Última mensagem não é do modelo.");
      return;
    }

    const rawText = lastModelMessage.content;
    const questions: { question: string; answer: string }[] = [];

    // Regex para encontrar todas as questões e gabaritos/justificativas
    // Removido o flag 's' para compatibilidade e ajustado o regex para considerar quebras de linha
    const questionAnswerRegex = /(.*?)\s*◦\s*(Certo|Errado)\.\s*◦\s*Justificativa:\s*([\s\S]*?)(?=;\s*\d+\.\s*|$)/g;
    let match;

    while ((match = questionAnswerRegex.exec(lastModelMessage.content)) !== null) {
      const questionText = match[1].trim();
      const answerText = `◦ ${match[2]}. ◦ Justificativa: ${match[3].trim()}`;

      if (questionText && answerText) {
        questions.push({ question: questionText, answer: answerText });
      }
    }

    let csvContent = "Frente;Verso;Tags\n";

    for (const q of questions) {
      const sanitizedQuestion = sanitizeCsvField(q.question);
      const sanitizedAnswer = sanitizeCsvField(q.answer);
      const tags = "Anki";

      csvContent += `"${sanitizedQuestion}";"${sanitizedAnswer}";"${tags}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'questoes_anki.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Opcional: toast de sucesso
    // toast({ title: "CSV para Anki gerado com sucesso!", description: "O download deve começar em instantes." });
  };

  return (
    <Card className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-4rem)] flex flex-col"> {/* Adjusted height for mobile */}
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>Instrutor AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col p-4"> {/* Added padding */}
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <p>Olá! Sou seu Instrutor AI. Como posso te ajudar a estudar hoje?</p>
                    <p className="text-sm">Faça uma pergunta sobre Direito, Português ou peça para eu explicar um conceito.</p>
                </div>
            ) : (
                messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {message.role === 'model' && (
                        <div className="bg-primary rounded-full p-2 flex-shrink-0">
                         <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                        </div>
                    )}
                    <div
                        className={cn(
                        'max-w-[80%] rounded-lg px-4 py-3 text-sm',
                        message.role === 'user'
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted',
                        (markdownMode && !repeatQuestionMode) && 'prose dark:prose-invert prose-p:my-0 prose-headings:my-2'
                        )}
                    >
                        {
                          (markdownMode && !repeatQuestionMode) ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          ) : (
                            <div style={{whiteSpace: "pre-wrap"}}>{message.content}</div>
                          )
                        }
                    </div>
                     {message.role === 'user' && (
                        <div className="bg-muted rounded-full p-2 flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                    </div>
              ))
            )}
            {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <div className="bg-primary rounded-full p-2 flex-shrink-0 animate-pulse">
                        <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3 text-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-6 flex-shrink-0 flex flex-col gap-2 p-4"> {/* Added padding */}
        <form onSubmit={handleSendMessage} className="flex w-full items-start gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Digite sua dúvida sobre os estudos..."
            className="flex-grow resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
