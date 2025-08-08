import { Flashcard } from "./types/flashcard-types";

// Qualidade da resposta (baseado no FSRS: 1=Again, 2=Hard, 3=Good, 4=Easy)
type Rating = 1 | 2 | 3 | 4;

// Default FSRS parameters (these can be adjusted or personalized per user)
// These weights are based on the FSRS4Anki project's default parameters for optimal recall.
const DEFAULT_FSRS_PARAMETERS = {
  requestRetention: 0.9, // Target retention rate (e.g., 90%)
  maximumInterval: 36500, // Maximum interval in days (e.g., 100 years)
  weights: [
    0.5,   // w0: initial stability for new cards
    1.2,   // w1: initial difficulty for new cards
    2.0,   // w2: difficulty impact on stability after first review
    0.5,   // w3: retention impact on stability
    0.8,   // w4: ease factor impact on stability
    1.4,   // w5: stability multiplier for again
    0.1,   // w6: difficulty multiplier for again
    0.7,   // w7: retention multiplier for hard
    0.2,   // w8: difficulty multiplier for hard
    1.0,   // w9: retention multiplier for good
    0.05,  // w10: difficulty multiplier for good
    1.5,   // w11: retention multiplier for easy
    0.15,  // w12: difficulty multiplier for easy
    0.01,  // w13: initial stability for new cards (again)
    0.05,  // w14: initial stability for new cards (hard)
    0.15,  // w15: initial stability for new cards (good)
    0.5    // w16: initial stability for new cards (easy)
  ],
};

// Função para criar um novo flashcard com parâmetros FSRS iniciais
export const createInitialFSRSFlashcard = (
  userId: string,
  question: string,
  answer: string
): Flashcard => {
  const now = new Date();
  return {
    id: "", // Será preenchido pelo banco de dados
    userId,
    question,
    answer,
    createdAt: now,
    lastReview: now,
    nextReview: now, // Disponível imediatamente para primeira revisão
    difficulty: DEFAULT_FSRS_PARAMETERS.weights[1], // Initial difficulty based on FSRS parameters
    stability: DEFAULT_FSRS_PARAMETERS.weights[0], // Initial stability based on FSRS parameters
    retrievability: 0.9, // Retrievability inicial alta
    reviewCount: 0,
    lastRating: 0, // 0 para flashcards novos
    consecutiveFailures: 0,
  };
};

export const calculateNextReview = (
  flashcard: Flashcard,
  rating: Rating,
  params = DEFAULT_FSRS_PARAMETERS
): Flashcard => {
  const { weights, maximumInterval, requestRetention } = params;

  let { difficulty, stability, retrievability, reviewCount, lastReview } = flashcard;

  const now = new Date();
  const elapsedDays = lastReview ? (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24) : 0;

  let newDifficulty = difficulty;
  let newStability = stability;
  let newRetrievability = retrievability;

  // Update Difficulty
  if (reviewCount === 0) {
    // Initial difficulty adjustment based on first rating
    newDifficulty = weights[1] - weights[2] * (rating - 1);
  } else {
    // Subsequent difficulty adjustment
    if (rating === 1) { // Again
      newDifficulty = newDifficulty + weights[6];
    } else if (rating === 2) { // Hard
      newDifficulty = newDifficulty + weights[8];
    } else if (rating === 3) { // Good
      newDifficulty = newDifficulty + weights[10];
    } else if (rating === 4) { // Easy
      newDifficulty = newDifficulty + weights[12];
    }
  }
  newDifficulty = Math.max(1, Math.min(10, newDifficulty)); // Clamp difficulty between 1 and 10

  // Update Stability and Retrievability
  if (reviewCount === 0) {
    // Initial stability based on first rating
    newStability = weights[0] + weights[13 + rating -1];
    newRetrievability = 0.9; // Initial retrievability for new cards
  } else {
    // Subsequent reviews
    // Calculate retrievability before current review
    const r_before = Math.exp(Math.log(0.9) * elapsedDays / stability);

    // Update stability based on rating
    if (rating === 1) { // Again
      newStability = weights[5] * newDifficulty;
    } else if (rating === 2) { // Hard
      newStability = stability * (1 + weights[7] * newDifficulty * Math.sqrt(elapsedDays / stability));
    } else if (rating === 3) { // Good
      newStability = stability * (1 + weights[9] * newDifficulty * Math.sqrt(elapsedDays / stability));
    } else if (rating === 4) { // Easy
      newStability = stability * (1 + weights[11] * newDifficulty * Math.sqrt(elapsedDays / stability));
    }

    // Update retrievability
    newRetrievability = r_before + (rating - 3) * 0.1; // Simplified for now, FSRS is more complex here
  }

  // Ensure minimum stability and clamp retrievability
  newStability = Math.max(0.1, newStability);
  newRetrievability = Math.max(0, Math.min(1, newRetrievability));

  // Calculate next review interval
  // The FSRS formula for next interval is more complex, involving desired retention
  const nextReviewInterval = Math.min(Math.round(newStability * Math.log(requestRetention) / Math.log(0.9)), maximumInterval);
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewInterval);
  nextReviewDate.setHours(0, 0, 0, 0); // Reset time for consistency

  return {
    ...flashcard,
    lastReview: now,
    nextReview: nextReviewDate,
    difficulty: newDifficulty,
    stability: newStability,
    retrievability: newRetrievability,
    reviewCount: reviewCount + 1,
    lastRating: rating,
    consecutiveFailures: rating === 1 ? flashcard.consecutiveFailures + 1 : 0,
  };
};