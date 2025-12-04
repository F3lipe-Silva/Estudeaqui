// app/api/study/logs/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/logs?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const logs = await StudyService.getStudyLogs(userId);
    return Response.json(logs);
  } catch (error: any) {
    console.error('Erro ao obter logs de estudo:', error);
    return Response.json({ error: error.message || 'Erro ao obter logs de estudo' }, { status: 500 });
  }
}

// POST /api/study/logs
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.userId || !data.subjectId || !data.date || data.duration === undefined) {
      return Response.json({ error: 'UserId, subjectId, date e duration são obrigatórios' }, { status: 400 });
    }

    const log = await StudyService.addStudyLog(data);
    return Response.json(log, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar log de estudo:', error);
    return Response.json({ error: error.message || 'Erro ao adicionar log de estudo' }, { status: 500 });
  }
}