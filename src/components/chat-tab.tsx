
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2, FileText, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chat } from '@/ai/flows/chat-flow';
import { type ChatMessage } from '@/ai/flows/chat-types';
import { useToast } from '@/hooks/use-toast';

const initialMessages: ChatMessage[] = [
  {
    role: 'model',
    content: 'Olá! Eu sou sua assistente de estudos. Como posso te ajudar a se preparar para o seu concurso hoje?',
  },
];

export default function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (prompt?: string) => {
    const messageToSend = typeof prompt === 'string' ? prompt : input;
    if (messageToSend.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat({
        history: messages,
        message: messageToSend,
      });

      const isCsvResponse = messageToSend.toLowerCase().includes('formato csv') && response.response.includes(';');

      if (isCsvResponse) {
        try {
            const blob = new Blob([response.response], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'anki_flashcards.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            const downloadMessage: ChatMessage = {
                role: 'model',
                content: 'Seu arquivo CSV com os flashcards para o Anki foi gerado e o download deve começar em instantes.',
            };
            setMessages(prev => [...prev, downloadMessage]);
        } catch (e) {
            console.error("Error creating CSV download link:", e);
            // Fallback to showing content in chat if download fails
            const modelMessage: ChatMessage = { role: 'model', content: response.response };
            setMessages(prev => [...prev, modelMessage]);
        }
      } else {
         const modelMessage: ChatMessage = { role: 'model', content: response.response };
         setMessages(prev => [...prev, modelMessage]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Erro no Chat',
        description: 'Não foi possível obter uma resposta da IA. Tente novamente.',
        variant: 'destructive',
      });
       const errorMessage: ChatMessage = { role: 'model', content: "Desculpe, ocorreu um erro e não consigo responder no momento." };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePresetAction = (preset: 'anki' | 'cespe') => {
      let prompt = '';
      if (preset === 'anki') {
          prompt = 'Com base na última resposta que você gerou (contendo as questões no estilo CESPE), transforme-a em flashcards para o Anki no formato CSV (frente;verso;tags), com um cabeçalho. A "frente" do flashcard deve ser a afirmação da questão. O "verso" deve conter o gabarito (Certo ou Errado) e a justificativa completa. Não inclua mais nada na resposta além do conteúdo CSV.';
      } else if (preset === 'cespe') {
          prompt = 'Com base em nossa discussão detalhada sobre o último tópico, elabore 5 afirmações complexas e aprofundadas no estilo CESPE/Cebraspe (Certo ou Errado). As afirmações devem abordar nuances, exceções e detalhes específicos do assunto, evitando generalidades. Para cada afirmação, forneça um gabarito (Certo ou Errado) e uma justificativa completa e bem fundamentada, explicando o porquê da resposta.';
      }
      handleSend(prompt);
  }

  const hasUserMessages = messages.some(m => m.role === 'user');

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-9 w-9 border-2 border-primary/50">
                  <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-prose rounded-lg p-3 text-sm whitespace-pre-wrap',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p>{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-9 w-9">
                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4 justify-start">
               <Avatar className="h-9 w-9 border-2 border-primary/50">
                  <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <div className="space-y-3">
             {hasUserMessages && (
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePresetAction('anki')} disabled={isLoading}>
                        <FileText className="mr-2 h-4 w-4" />
                        Gerar CSV para Anki
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePresetAction('cespe')} disabled={isLoading}>
                        <Repeat className="mr-2 h-4 w-4" />
                        Transformar em Questão CESPE
                    </Button>
                </div>
             )}
            <div className="relative">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Digite sua dúvida aqui..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
