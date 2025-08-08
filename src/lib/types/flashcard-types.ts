export interface ReviewSession {
  id: string;
  userId: string;
  flashcardsToReview: Flashcard[];
  currentIndex: number;
  startTime: Date;
  completed: boolean;
  totalCards: number;
  correctCount: number;
  timeSpent: number; // in seconds
}
export interface Flashcard {
  id: string;
  userId: string;
  question: string;
  answer: string;
  createdAt: Date;
  lastReview: Date; // data da última revisão
  nextReview: Date; // próxima revisão
  difficulty: number; // 1-10
  stability: number; // dias até esquecimento
  retrievability: number; // probabilidade de lembrar 0-1
  reviewCount: number; // contador de revisões
  lastRating: number; // 1-4 (Novamente, Difícil, Bom, Fácil)
  consecutiveFailures: number; // New property to track problematic cards
}