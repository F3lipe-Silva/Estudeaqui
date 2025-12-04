// app/api/study/templates/[id]/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// DELETE /api/study/templates/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const success = await StudyService.deleteTemplate(id);
        if (success) {
            return Response.json({ message: 'Template deletado com sucesso' });
        } else {
            return Response.json({ error: 'Template não encontrado' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Erro ao deletar template:', error);
        return Response.json({ error: error.message || 'Erro ao deletar template' }, { status: 500 });
    }
}