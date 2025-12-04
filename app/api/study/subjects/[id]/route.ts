// app/api/study/subjects/[id]/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// PUT /api/study/subjects/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await request.json();
        
        const updatedSubject = await StudyService.updateSubject(id, data);
        return Response.json(updatedSubject);
    } catch (error: any) {
        console.error('Erro ao atualizar matéria:', error);
        return Response.json({ error: error.message || 'Erro ao atualizar matéria' }, { status: 500 });
    }
}

// DELETE /api/study/subjects/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        const success = await StudyService.deleteSubject(id);
        if (success) {
            return Response.json({ message: 'Matéria deletada com sucesso' });
        } else {
            return Response.json({ error: 'Matéria não encontrada' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Erro ao deletar matéria:', error);
        return Response.json({ error: error.message || 'Erro ao deletar matéria' }, { status: 500 });
    }
}