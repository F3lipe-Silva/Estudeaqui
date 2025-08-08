"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, ReviewSession } from '@/lib/types/flashcard-types';
import FlashcardEditor from '@/components/flashcard-editor';
import FlashcardViewer from '@/components/flashcard-viewer';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react'; // For loading spinner

const FlashcardsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [currentReviewSession, setCurrentReviewSession] = useState<ReviewSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Helper to convert Firestore Timestamps to Date objects
  const parseFlashcardDates = (fc: any): Flashcard => ({
    ...fc,
    createdAt: new Date(fc.createdAt),
    lastReview: new Date(fc.lastReview),
    nextReview: new Date(fc.nextReview),
  });

  const fetchFlashcards = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/flashcards?userId=${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flashcards.');
      }
      const data: Flashcard[] = await response.json();
      setFlashcards(data.map(parseFlashcardDates));
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching flashcards.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const startReviewSession = useCallback(async () => {
    if (!user?.uid) {
      setSessionError('User not authenticated to start a review session.');
      return;
    }

    setSessionLoading(true);
    setSessionError(null);
    try {
      const response = await fetch('/api/review-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start review session.');
      }

      const sessionData: ReviewSession = await response.json();
      const parsedSessionData: ReviewSession = {
        ...sessionData,
        startTime: new Date(sessionData.startTime),
        flashcardsToReview: sessionData.flashcardsToReview.map(parseFlashcardDates),
      };
      
      if (parsedSessionData.flashcardsToReview && parsedSessionData.flashcardsToReview.length > 0) {
        setCurrentReviewSession(parsedSessionData);
      } else {
        setSessionError('No flashcards to review at this time.');
        setCurrentReviewSession(null);
      }
    } catch (err: any) {
      setSessionError(err.message || 'An unexpected error occurred while starting session.');
      setCurrentReviewSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, [user]);

  const endReviewSession = useCallback(async () => {
    if (!currentReviewSession?.id) return;

    setSessionLoading(true);
    try {
      const response = await fetch(`/api/review-sessions?sessionId=${currentReviewSession.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to end review session.');
      }
      setCurrentReviewSession(null);
      fetchFlashcards(); // Refresh flashcards after session ends
    } catch (err: any) {
      setSessionError(err.message || 'Error ending session.');
    } finally {
      setSessionLoading(false);
    }
  }, [currentReviewSession, fetchFlashcards]);

  useEffect(() => {
    if (!authLoading) {
      fetchFlashcards();
    }
  }, [authLoading, fetchFlashcards]);

  const handleFlashcardSave = () => {
    setEditingFlashcard(null);
    fetchFlashcards(); // Refresh the list of flashcards
  };

  const handleReviewCompleted = () => {
    // This is called by FlashcardViewer after a review.
    // It implies the backend has updated the flashcard and session.
    // We need to re-fetch the session to get the updated state (e.g., next card, completion status).
    if (currentReviewSession) {
      // Advance to the next card in the session locally for immediate UI update
      const nextIndex = currentReviewSession.currentIndex + 1;
      if (nextIndex < currentReviewSession.totalCards) {
        setCurrentReviewSession(prev => prev ? { ...prev, currentIndex: nextIndex } : null);
      } else {
        // Session completed locally, trigger end session API call
        endReviewSession();
      }
    }
  };

  const handleDelete = () => {
    fetchFlashcards(); // Refresh the list of flashcards after deletion
    setCurrentReviewSession(null); // Reset session if a card from it was deleted
  };

  const currentFlashcard = currentReviewSession?.flashcardsToReview[currentReviewSession.currentIndex];

  if (authLoading || loading) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar flashcards: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Meus Flashcards</h1>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review">Revisar</TabsTrigger>
          <TabsTrigger value="create-edit">Criar/Editar</TabsTrigger>
        </TabsList>
        <TabsContent value="review" className="mt-4">
          {sessionLoading && (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando sessão...</span>
            </div>
          )}
          {sessionError && <p className="text-red-500 mb-4">{sessionError}</p>}

          {!sessionLoading && !currentReviewSession && (
            <div className="text-center">
              <p className="mb-4">Comece uma sessão de revisão para praticar seus flashcards.</p>
              <Button onClick={startReviewSession} disabled={flashcards.length === 0}>
                {flashcards.length === 0 ? 'Crie Flashcards Primeiro' : 'Iniciar Revisão'}
              </Button>
            </div>
          )}

          {!sessionLoading && currentReviewSession && currentFlashcard ? (
            <div>
              <FlashcardViewer
                flashcard={currentFlashcard}
                onReview={handleReviewCompleted}
                onEdit={setEditingFlashcard}
                onDelete={handleDelete}
                sessionId={currentReviewSession.id} // Pass session ID
              />
              <div className="mt-4 text-center">
                <p>Cartão {currentReviewSession.currentIndex + 1} de {currentReviewSession.totalCards}</p>
                <Button variant="outline" onClick={endReviewSession} className="mt-2">
                  Encerrar Sessão
                </Button>
              </div>
            </div>
          ) : (
            !sessionLoading && !sessionError && flashcards.length > 0 && (
              <p className="text-center">Nenhum flashcard para revisar no momento ou sessão concluída. Crie mais ou aguarde a próxima data de revisão.</p>
            )
          )}
        </TabsContent>
        <TabsContent value="create-edit" className="mt-4">
          <h2 className="text-xl font-semibold mb-3">
            {editingFlashcard ? 'Editar Flashcard' : 'Criar Novo Flashcard'}
          </h2>
          <FlashcardEditor onSave={handleFlashcardSave} initialData={editingFlashcard || undefined} />

          <h2 className="text-xl font-semibold mt-6 mb-3">Todos os Flashcards</h2>
          {flashcards.length > 0 ? (
            <ul className="space-y-2">
              {flashcards.map((fc) => (
                <li key={fc.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{fc.question}</p>
                    <p className="text-sm text-gray-500">Próxima Revisão: {new Date(fc.nextReview).toLocaleDateString()}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setEditingFlashcard(fc)}>
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Excluir</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente seu flashcard.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete()}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum flashcard criado ainda.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlashcardsPage;