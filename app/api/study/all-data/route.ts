// app/api/study/all-data/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/all-data?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const allData = await StudyService.getAllUserData(userId);
    return Response.json(allData);
  } catch (error: any) {
    console.error('Erro ao obter todos os dados do usuário:', error);
    return Response.json({ error: error.message || 'Erro ao obter todos os dados do usuário' }, { status: 500 });
  }
}