// app/api/study/user-settings/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/user-settings?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const settings = await StudyService.getUserSettings(userId);
    return Response.json(settings);
  } catch (error: any) {
    console.error('Erro ao obter configurações do usuário:', error);
    return Response.json({ error: error.message || 'Erro ao obter configurações do usuário' }, { status: 500 });
  }
}

// POST /api/study/user-settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.userId || !data.settings) {
      return Response.json({ error: 'UserId e settings são obrigatórios' }, { status: 400 });
    }

    const settings = await StudyService.saveUserSettings(data);
    return Response.json(settings, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar configurações do usuário:', error);
    return Response.json({ error: error.message || 'Erro ao salvar configurações do usuário' }, { status: 500 });
  }
}