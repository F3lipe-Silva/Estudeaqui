// app/api/study/sequence/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/sequence?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const sequence = await StudyService.getStudySequence(userId);
    return Response.json(sequence);
  } catch (error: any) {
    console.error('Erro ao obter sequência de estudo:', error);
    return Response.json({ error: error.message || 'Erro ao obter sequência de estudo' }, { status: 500 });
  }
}

// POST /api/study/sequence
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.userId || !data.name || !data.sequence) {
      return Response.json({ error: 'UserId, name e sequence são obrigatórios' }, { status: 400 });
    }

    const sequence = await StudyService.saveStudySequence(data);
    return Response.json(sequence, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar sequência de estudo:', error);
    return Response.json({ error: error.message || 'Erro ao salvar sequência de estudo' }, { status: 500 });
  }
}