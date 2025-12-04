// app/api/study/pomodoro-settings/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/pomodoro-settings?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const settings = await StudyService.getPomodoroSettings(userId);
    return Response.json(settings);
  } catch (error: any) {
    console.error('Erro ao obter configurações Pomodoro:', error);
    return Response.json({ error: error.message || 'Erro ao obter configurações Pomodoro' }, { status: 500 });
  }
}

// POST /api/study/pomodoro-settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.userId || !data.settings) {
      return Response.json({ error: 'UserId e settings são obrigatórios' }, { status: 400 });
    }

    const settings = await StudyService.savePomodoroSettings(data);
    return Response.json(settings, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar configurações Pomodoro:', error);
    return Response.json({ error: error.message || 'Erro ao salvar configurações Pomodoro' }, { status: 500 });
  }
}