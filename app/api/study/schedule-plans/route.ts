// app/api/study/schedule-plans/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/schedule-plans?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const plans = await StudyService.getSchedulePlans(userId);
    return Response.json(plans);
  } catch (error: any) {
    console.error('Erro ao obter planos de agenda:', error);
    return Response.json({ error: error.message || 'Erro ao obter planos de agenda' }, { status: 500 });
  }
}

// POST /api/study/schedule-plans
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.userId || !data.name || data.totalHorasSemanais === undefined || 
        data.duracaoSessao === undefined || !data.subModoPomodoro || !data.sessoesPorMateria) {
      return Response.json({ 
        error: 'UserId, name, totalHorasSemanais, duracaoSessao, subModoPomodoro e sessoesPorMateria são obrigatórios' 
      }, { status: 400 });
    }

    const plan = await StudyService.addSchedulePlan(data);
    return Response.json(plan, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar plano de agenda:', error);
    return Response.json({ error: error.message || 'Erro ao adicionar plano de agenda' }, { status: 500 });
  }
}