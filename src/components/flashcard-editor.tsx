"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { Flashcard } from '@/lib/types/flashcard-types';

interface FlashcardEditorProps {
  onSave: () => void;
  initialData?: Flashcard;
}

const FlashcardEditor: React.FC<FlashcardEditorProps> = ({ onSave, initialData }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      setError('User not authenticated.');
      return;
    }
    if (!question || !answer) {
      setError('Question and Answer cannot be empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = '/api/flashcards';
      const body = initialData
        ? JSON.stringify({ id: initialData.id, question, answer })
        : JSON.stringify({ userId: user.uid, question, answer });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        throw new Error('Failed to save flashcard.');
      }

      setQuestion('');
      setAnswer('');
      onSave();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700">
          Pergunta
        </label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Digite a pergunta do flashcard"
          className="mt-1 block w-full"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
          Resposta
        </label>
        <Textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Digite a resposta do flashcard"
          className="mt-1 block w-full"
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : initialData ? 'Atualizar Flashcard' : 'Criar Flashcard'}
      </Button>
    </form>
  );
};

export default FlashcardEditor;