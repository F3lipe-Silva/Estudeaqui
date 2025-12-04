// app/api/study/topics/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/topics?subjectId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('subjectId');

    if (!subjectId) {
      return Response.json({ error: 'SubjectId é obrigatório' }, { status: 400 });
    }

    const topics = await StudyService.getTopics(subjectId);
    return Response.json(topics);
  } catch (error: any) {
    console.error('Erro ao obter tópicos:', error);
    return Response.json({ error: error.message || 'Erro ao obter tópicos' }, { status: 500 });
  }
}

// POST /api/study/topics
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar campos obrigatórios
    if (!data.subjectId || !data.name) {
      return Response.json({ error: 'SubjectId e name são obrigatórios' }, { status: 400 });
    }

    const topic = await StudyService.addTopic(data);
    return Response.json(topic, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar tópico:', error);
    return Response.json({ error: error.message || 'Erro ao adicionar tópico' }, { status: 500 });
  }
}