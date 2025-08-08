import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { Flashcard, ReviewSession } from '@/lib/types/flashcard-types';
import { calculateNextReview, createInitialFSRSFlashcard } from '@/lib/flashcard-logic';

const flashcardsCollection = collection(db, 'flashcards');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const q = query(flashcardsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const flashcards: Flashcard[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Flashcard));

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, question, answer } = await request.json();

    if (!userId || !question || !answer) {
      return NextResponse.json({ error: 'User ID, question, and answer are required' }, { status: 400 });
    }

    const newFlashcard: Omit<Flashcard, 'id'> = createInitialFSRSFlashcard(userId, question, answer);

    const docRef = await addDoc(flashcardsCollection, newFlashcard);
    return NextResponse.json({ id: docRef.id, ...newFlashcard }, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, question, answer, rating } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Flashcard ID is required' }, { status: 400 });
    }

    const flashcardRef = doc(db, 'flashcards', id);
    const flashcardData = (await getDocs(query(flashcardsCollection, where('__name__', '==', id)))).docs[0].data() as Flashcard;

    let updatedFlashcard: Flashcard;

    if (rating !== undefined) {
      // If rating is provided, calculate next review date using FSRS
      updatedFlashcard = calculateNextReview(flashcardData, rating);
    } else {
      // Otherwise, just update question and answer
      updatedFlashcard = { ...flashcardData, question, answer };
    }

    await updateDoc(flashcardRef, updatedFlashcard as any); // Firebase updateDoc expects a plain object
    return NextResponse.json({ message: 'Flashcard updated successfully' });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flashcard ID is required' }, { status: 400 });
    }

    const flashcardRef = doc(db, 'flashcards', id);
    await deleteDoc(flashcardRef);
    return NextResponse.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 });
  }
}