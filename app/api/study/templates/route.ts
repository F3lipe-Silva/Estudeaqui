// app/api/study/templates/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// GET /api/study/templates?userId=...
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'UserId é obrigatório' }, { status: 400 });
    }

    const templates = await StudyService.getTemplates(userId);
    return Response.json(templates);
  } catch (error: any) {
    console.error('Erro ao obter templates:', error);
    return Response.json({ error: error.message || 'Erro ao obter templates' }, { status: 500 });
  }
}

// POST /api/study/templates
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.userId || !data.name || !data.subjects) {
      return Response.json({ error: 'UserId, name e subjects são obrigatórios' }, { status: 400 });
    }

    const template = await StudyService.addTemplate(data);
    return Response.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao adicionar template:', error);
    return Response.json({ error: error.message || 'Erro ao adicionar template' }, { status: 500 });
  }
}