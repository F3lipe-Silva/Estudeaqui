// app/api/study/logs/[id]/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// PUT /api/study/logs/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const data = await request.json();
        
        const updatedLog = await StudyService.updateStudyLog(id, data);
        return Response.json(updatedLog);
    } catch (error: any) {
        console.error('Erro ao atualizar log de estudo:', error);
        return Response.json({ error: error.message || 'Erro ao atualizar log de estudo' }, { status: 500 });
    }
}

// DELETE /api/study/logs/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const success = await StudyService.deleteStudyLog(id);
        if (success) {
            return Response.json({ message: 'Log de estudo deletado com sucesso' });
        } else {
            return Response.json({ error: 'Log de estudo não encontrado' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Erro ao deletar log de estudo:', error);
        return Response.json({ error: error.message || 'Erro ao deletar log de estudo' }, { status: 500 });
    }
}