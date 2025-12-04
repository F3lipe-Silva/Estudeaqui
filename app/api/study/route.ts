// app/api/study/subjects/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/subjects?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const subjects = await StudyService.getSubjects(userId);
    return Response.json(subjects);
  } catch (error: any) {
    console.error('Erro ao obter matérias:', error);
    return Response.json({ error: error.message || 'Erro ao obter matérias' }, { status: 500 });
  }
}

// POST /api/study/subjects
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.userId || !data.name) {
      return Response.json({ error: 'UserId e name são obrigatórios' }, { status: 400 });
    }

    const subject = await StudyService.addSubject(data);
    return Response.json(subject, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar matéria:', error);
    return Response.json({ error: error.message || 'Erro ao adicionar matéria' }, { status: 500 });
  }
}