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
  originalInput?: string; // Novo campo para armazenar o input original do usuário
}


export default function InstructorAiTab() {
  const [messages, setMessages] = useState<InstructorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cespeMode, setCespeMode] = useState(false); // Novo estado para o modo CESPE
  const [showAnkiCsvButton, setShowAnkiCsvButton] = useState(false); // Novo estado
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
    if (!input.trim() || isLoading) return;

    let messageToSend = input;
    if (cespeMode) {
      messageToSend = `Com base no seguinte tópico/texto, elabore afirmações complexas e aprofundadas no estilo CESPE/Cebraspe (Certo ou Errado) ou questões de múltipla escolha (A, B, C, D, E), conforme a necessidade e a complexidade do tema. As afirmações/questões devem abordar nuances, exceções e detalhes específicos do assunto, evitando generalidades. Para cada afirmação/questão, forneça um gabarito e uma justificativa completa e bem fundamentada, **incluindo exemplos práticos ou analogias para facilitar o entendimento**, explicando o porquê da resposta.

      Tópico/Texto: "${input}"`;
    }

    const userMessage: InstructorMessage = { role: 'user', content: input }; // Exibe o input original do usuário
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
      const modelMessage: InstructorMessage = {
        role: 'model',
        content: data.response,
        originalInput: cespeMode ? input : undefined, // Salvar o input original se for modo CESPE
      };
      setMessages((prev) => {
        const newMessages = [...prev, modelMessage];
        // Habilitar o botão CSV apenas se a última mensagem foi no modo CESPE
        // e o conteúdo da resposta for o esperado para questões
        if (cespeMode && data.response && typeof data.response === 'string') {
          // Uma heurística simples para verificar se a resposta parece uma questão CESPE
          // Pode ser aprimorada para uma validação mais robusta
          if (data.response.includes('Certo') || data.response.includes('Errado') || data.response.includes('Gabarito')) {
            setShowAnkiCsvButton(true);
          } else {
            setShowAnkiCsvButton(false);
          }
        } else {
          setShowAnkiCsvButton(false);
        }
        return newMessages;
      });

    } catch (error: any) {
      const errorMessage: InstructorMessage = {
        role: 'model',
        content: `Desculpe, ocorreu um erro ao me conectar. \n\n**Detalhes:**\n\`\`\`\n${error.message}\n\`\`\`\n\n Verifique o console do navegador e do servidor para mais informações.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setShowAnkiCsvButton(false); // Desabilitar o botão em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAnkiCsv = () => {
    if (!messages.length) return;

    // A última mensagem do modelo deve conter as questões CESPE
    const lastModelMessage = messages[messages.length - 1];
    if (lastModelMessage.role !== 'model') {
      console.error("Última mensagem não é do modelo.");
      return;
    }

    const rawText = lastModelMessage.content;
    const lines = rawText.split('\n').filter(line => line.trim() !== '');

    let csvContent = "Frente;Verso;Tags\n"; // Cabeçalho CSV
    let currentQuestion = "";
    let currentAnswer = "";
    let isQuestion = true; // Alterna entre pergunta e resposta/justificativa

    const questions: { question: string; answer: string }[] = [];
    let tempQuestion = '';
    let tempAnswer = '';
    let readingAnswer = false;

    for (const line of lines) {
      const affirmationMatch = line.match(/^(Afirmação|Questão):\s*(.*)/i);
      const gabaritoMatch = line.match(/^(Gabarito|Justificativa):\s*(.*)/i);

      if (affirmationMatch) {
        if (tempQuestion && tempAnswer) {
          questions.push({ question: tempQuestion.trim(), answer: tempAnswer.trim() });
        }
        tempQuestion = affirmationMatch[2];
        tempAnswer = '';
        readingAnswer = true; // Começa a ler a resposta para esta nova pergunta
      } else if (gabaritoMatch) {
        tempAnswer += gabaritoMatch[0].trim() + '\n'; // Adiciona a linha de gabarito/justificativa
        readingAnswer = true;
      } else if (readingAnswer && line.trim() !== '') {
        // Continuação da resposta/justificativa
        tempAnswer += line.trim() + '\n';
      }
    }

    // Adicionar a última questão/resposta se houver
    if (tempQuestion && tempAnswer) {
      questions.push({ question: tempQuestion.trim(), answer: tempAnswer.trim() });
    }

    for (const q of questions) {
      const sanitizedQuestion = q.question.replace(/"/g, '""').replace(/;/g, ',');
      const sanitizedAnswer = q.answer.replace(/"/g, '""').replace(/;/g, ',');
      const tags = lastModelMessage.originalInput ? `CESPE,${lastModelMessage.originalInput.replace(/"/g, '""').replace(/;/g, ',')}` : "CESPE";
      csvContent += `"${sanitizedQuestion}";"${sanitizedAnswer}";"${tags}"\n`;
    }

    // Adicionar a última questão/resposta se houver
    if (currentQuestion && currentAnswer) {
      const tags = lastModelMessage.originalInput ? `CESPE,${lastModelMessage.originalInput.replace(/"/g, '""').replace(/;/g, ',')}` : "CESPE";
      csvContent += `"${currentQuestion.replace(/"/g, '""').replace(/;/g, ',')}";"${currentAnswer.replace(/"/g, '""').replace(/;/g, ',')}";"${tags}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'questoes_cespe_anki.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Opcional: toast de sucesso
    // toast({ title: "CSV para Anki gerado com sucesso!", description: "O download deve começar em instantes." });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>Instrutor AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col">
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
                        'max-w-[80%] rounded-lg px-4 py-3 text-sm prose dark:prose-invert prose-p:my-0 prose-headings:my-2',
                        message.role === 'user'
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
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
      <CardFooter className="pt-6 flex-shrink-0 flex flex-col gap-2">
        <div className="flex w-full items-center justify-between mb-2">
          <Button
            variant={cespeMode ? "default" : "outline"}
            onClick={() => setCespeMode(prev => !prev)}
            disabled={isLoading}
          >
            {cespeMode ? "Desativar Modo CESPE" : "Ativar Modo CESPE"}
          </Button>
          {showAnkiCsvButton && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateAnkiCsv}
              disabled={isLoading}
            >
              Gerar CSV para Anki
            </Button>
          )}
        </div>
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
            placeholder={cespeMode ? "Digite o tópico para a questão CESPE..." : "Digite sua dúvida sobre os estudos..."}
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
