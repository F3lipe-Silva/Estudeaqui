import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, limit } from 'firebase/firestore';
import { Flashcard, ReviewSession } from '@/lib/types/flashcard-types';
import { calculateNextReview } from '@/lib/flashcard-logic';

const flashcardsCollection = collection(db, 'flashcards');
const reviewSessionsCollection = collection(db, 'reviewSessions');

export async function POST(request: NextRequest) {
  try {
    const { userId, maxCards = 20 } = await request.json(); // Default limit is 20

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Filter cards that need review (nextReview <= now) and order by retrievability (lowest first)
    const q = query(
      flashcardsCollection,
      where('userId', '==', userId),
      where('nextReview', '<=', new Date()),
      orderBy('retrievability', 'asc'),
      limit(maxCards) // Apply limit directly in the query
    );
    const querySnapshot = await getDocs(q);
    const flashcardsToReview: Flashcard[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to Date objects
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
      lastReview: doc.data().lastReview?.toDate ? doc.data().lastReview.toDate() : new Date(doc.data().lastReview),
      nextReview: doc.data().nextReview?.toDate ? doc.data().nextReview.toDate() : new Date(doc.data().nextReview),
    } as Flashcard));

    if (flashcardsToReview.length === 0) {
      return NextResponse.json({ message: 'No flashcards to review' }, { status: 200 });
    }

    const newSession: Omit<ReviewSession, 'id'> = {
      userId,
      flashcardsToReview,
      currentIndex: 0,
      startTime: new Date(),
      completed: false,
      totalCards: flashcardsToReview.length,
      correctCount: 0,
      timeSpent: 0,
    };


    const docRef = await addDoc(reviewSessionsCollection, newSession);
    return NextResponse.json({ id: docRef.id, ...newSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating review session:', error);
    return NextResponse.json({ error: 'Failed to create review session' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId'); // Assuming we might fetch by user and latest incomplete session

    if (sessionId) {
      const sessionDoc = await getDocs(query(reviewSessionsCollection, where('__name__', '==', sessionId)));
      if (sessionDoc.empty) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      const sessionData = sessionDoc.docs[0].data() as ReviewSession;
      return NextResponse.json(sessionData);
    } else if (userId) {
      // Fetch the latest incomplete session for the user
      const q = query(
        reviewSessionsCollection,
        where('userId', '==', userId),
        where('completed', '==', false),
        orderBy('startTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return NextResponse.json({ message: 'No active review session found' }, { status: 200 });
      }
      const sessionData = querySnapshot.docs[0].data() as ReviewSession;
      return NextResponse.json(sessionData);
    } else {
      return NextResponse.json({ error: 'Session ID or User ID is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching review session:', error);
    return NextResponse.json({ error: 'Failed to fetch review session' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, flashcardId, rating } = await request.json();

    if (!sessionId || !flashcardId || rating === undefined) {
      return NextResponse.json({ error: 'Session ID, Flashcard ID, and Rating are required' }, { status: 400 });
    }

    // Fetch the current session
    const sessionDocRef = doc(db, 'reviewSessions', sessionId);
    const sessionDoc = await getDocs(query(reviewSessionsCollection, where('__name__', '==', sessionId)));
    if (sessionDoc.empty) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const currentSession = sessionDoc.docs[0].data() as ReviewSession;

    // Find the flashcard within the session
    const flashcardIndex = currentSession.flashcardsToReview.findIndex(fc => fc.id === flashcardId);
    if (flashcardIndex === -1) {
      return NextResponse.json({ error: 'Flashcard not found in session' }, { status: 404 });
    }

    const flashcardToUpdate = currentSession.flashcardsToReview[flashcardIndex];

    // Calculate next review parameters using FSRS
    const updatedFlashcard = calculateNextReview(flashcardToUpdate, rating);

    // Update the flashcard in Firestore
    const flashcardRef = doc(db, 'flashcards', flashcardId);
    await updateDoc(flashcardRef, {
        ...updatedFlashcard,
        createdAt: updatedFlashcard.createdAt, // Ensure Date objects are converted for Firestore
        lastReview: updatedFlashcard.lastReview,
        nextReview: updatedFlashcard.nextReview,
    } as any);

    // Update session state
    const newFlashcardsToReview = [...currentSession.flashcardsToReview];
    newFlashcardsToReview[flashcardIndex] = updatedFlashcard;

    const updatedSession: ReviewSession = {
      ...currentSession,
      flashcardsToReview: newFlashcardsToReview,
      currentIndex: currentSession.currentIndex + 1,
      correctCount: rating >= 3 ? currentSession.correctCount + 1 : currentSession.correctCount,
      completed: (currentSession.currentIndex + 1) >= currentSession.totalCards,
      timeSpent: currentSession.timeSpent + (new Date().getTime() - currentSession.startTime.getTime()) / 1000, // Placeholder for time spent
    };

    await updateDoc(sessionDocRef, updatedSession as any);

    return NextResponse.json({ message: 'Review processed successfully', updatedFlashcard, updatedSession });
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json({ error: 'Failed to process review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const sessionDocRef = doc(db, 'reviewSessions', sessionId);
    await updateDoc(sessionDocRef, { completed: true }); // Mark session as completed
    return NextResponse.json({ message: 'Review session marked as completed' });
  } catch (error) {
    console.error('Error marking session as completed:', error);
    return NextResponse.json({ error: 'Failed to mark session as completed' }, { status: 500 });
  }
}