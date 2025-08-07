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

    const userMessage: InstructorMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          message: input,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      const modelMessage: InstructorMessage = { role: 'model', content: data.response };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (error: any) {
      const errorMessage: InstructorMessage = {
        role: 'model',
        content: `Desculpe, ocorreu um erro ao me conectar. \n\n**Detalhes:**\n\`\`\`\n${error.message}\n\`\`\`\n\n Verifique o console do navegador e do servidor para mais informações.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
      <CardFooter className="pt-6 flex-shrink-0">
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
