import { calculateNextReview, createInitialFSRSFlashcard } from './flashcard-logic';
import { Flashcard } from './types/flashcard-types';

describe('FSRS Logic', () => {
  let initialFlashcard: Flashcard;

  beforeEach(() => {
    initialFlashcard = createInitialFSRSFlashcard('testUser', 'Test Question', 'Test Answer');
  });

  it('should create an initial flashcard with correct default FSRS parameters', () => {
    expect(initialFlashcard.userId).toBe('testUser');
    expect(initialFlashcard.question).toBe('Test Question');
    expect(initialFlashcard.answer).toBe('Test Answer');
    expect(initialFlashcard.difficulty).toBe(5);
    expect(initialFlashcard.stability).toBe(1);
    expect(initialFlashcard.retrievability).toBe(0.9);
    expect(initialFlashcard.reviewCount).toBe(0);
    expect(initialFlashcard.lastRating).toBe(0);
    expect(initialFlashcard.createdAt).toBeInstanceOf(Date);
    expect(initialFlashcard.lastReview).toBeInstanceOf(Date);
    expect(initialFlashcard.nextReview).toBeInstanceOf(Date);
    expect(initialFlashcard.nextReview.getTime()).toBe(initialFlashcard.createdAt.getTime()); // Should be immediately available
  });

  // Placeholder tests for calculateNextReview - these will be expanded with actual FSRS logic
  it('should update flashcard parameters based on rating (placeholder for FSRS logic)', () => {
    const ratedFlashcard = calculateNextReview(initialFlashcard, 3); // Assume 'Good' rating

    expect(ratedFlashcard.lastReview).toBeInstanceOf(Date);
    expect(ratedFlashcard.nextReview).toBeInstanceOf(Date);
    expect(ratedFlashcard.reviewCount).toBe(1);
    expect(ratedFlashcard.lastRating).toBe(3);

    // Assertions for difficulty, stability, retrievability will be more specific with full FSRS
    expect(ratedFlashcard.difficulty).not.toBe(initialFlashcard.difficulty);
    expect(ratedFlashcard.stability).not.toBe(initialFlashcard.stability);
    expect(ratedFlashcard.retrievability).not.toBe(initialFlashcard.retrievability);
  });

  it('should handle "Again" rating (placeholder)', () => {
    const ratedFlashcard = calculateNextReview(initialFlashcard, 1);
    expect(ratedFlashcard.lastRating).toBe(1);
    expect(ratedFlashcard.reviewCount).toBe(1);
  });

  it('should handle "Hard" rating (placeholder)', () => {
    const ratedFlashcard = calculateNextReview(initialFlashcard, 2);
    expect(ratedFlashcard.lastRating).toBe(2);
    expect(ratedFlashcard.reviewCount).toBe(1);
  });

  it('should handle "Easy" rating (placeholder)', () => {
    const ratedFlashcard = calculateNextReview(initialFlashcard, 4);
    expect(ratedFlashcard.lastRating).toBe(4);
    expect(ratedFlashcard.reviewCount).toBe(1);
  });
});