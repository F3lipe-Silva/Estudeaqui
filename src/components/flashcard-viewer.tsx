"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Flashcard } from '@/lib/types/flashcard-types';
import { cn } from '@/lib/utils'; // Assuming cn for utility classes

interface FlashcardViewerProps {
  flashcard: Flashcard;
  onReview: (quality: number) => void;
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (flashcardId: string) => void;
  sessionId: string;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  flashcard,
  onReview,
  onEdit,
  onDelete,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (rating: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/review-sessions', { // Changed to review-sessions API
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: "current_session_id", flashcardId: flashcard.id, rating }), // Pass session ID and rating
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard review.');
      }
      onReview(rating); // Pass rating to onReview
      setShowAnswer(false); // Reset for next flashcard
    } catch (err: any) {
      setError(err.message || 'An error occurred during review.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/flashcards?id=${flashcard.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard.');
      }
      onDelete(flashcard.id);
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Flashcard</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="min-h-[100px] flex items-center justify-center p-4 border rounded-md mb-4">
          {!showAnswer ? (
            <p className="text-lg font-semibold">{flashcard.question}</p>
          ) : (
            <p className="text-lg">{flashcard.answer}</p>
          )}
        </div>
        <div className="flex justify-between items-center">
          <Button onClick={() => setShowAnswer(!showAnswer)} disabled={loading}>
            {showAnswer ? 'Esconder Resposta' : 'Mostrar Resposta'}
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onEdit(flashcard)} disabled={loading}>
              Editar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Excluir
            </Button>
          </div>
        </div>

        {showAnswer && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-md font-semibold mb-2">Avalie sua resposta:</h3>
            <div className="grid grid-cols-4 gap-2"> {/* Changed to 4 columns for FSRS ratings */}
              {[
                { label: 'Novamente', rating: 1, color: 'red' },
                { label: 'Difícil', rating: 2, color: 'orange' },
                { label: 'Bom', rating: 3, color: 'yellow' },
                { label: 'Fácil', rating: 4, color: 'green' },
              ].map(({ label, rating, color }) => (
                <Button
                  key={rating}
                  onClick={() => handleReview(rating)}
                  disabled={loading}
                  className={cn(
                    'flex-1',
                    color === 'red' && 'bg-red-500 hover:bg-red-600 text-white',
                    color === 'orange' && 'bg-orange-500 hover:bg-orange-600 text-white',
                    color === 'yellow' && 'bg-yellow-500 hover:bg-yellow-600 text-white',
                    color === 'green' && 'bg-green-500 hover:bg-green-600 text-white'
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        <div>
          <p>Próxima revisão: {flashcard.nextReview ? new Date(flashcard.nextReview).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="text-right">
          <p>Dificuldade: {flashcard.difficulty.toFixed(2)}</p>
          <p>Estabilidade: {flashcard.stability.toFixed(2)}</p>
          <p>Retrievability: {flashcard.retrievability.toFixed(2)}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FlashcardViewer;