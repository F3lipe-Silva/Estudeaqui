// app/api/study/topics/[id]/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// PUT /api/study/topics/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await request.json();
        
        const updatedTopic = await StudyService.updateTopic(id, data);
        return Response.json(updatedTopic);
    } catch (error: any) {
        console.error('Erro ao atualizar tópico:', error);
        return Response.json({ error: error.message || 'Erro ao atualizar tópico' }, { status: 500 });
    }
}

// DELETE /api/study/topics/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        const success = await StudyService.deleteTopic(id);
        if (success) {
            return Response.json({ message: 'Tópico deletado com sucesso' });
        } else {
            return Response.json({ error: 'Tópico não encontrado' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Erro ao deletar tópico:', error);
        return Response.json({ error: error.message || 'Erro ao deletar tópico' }, { status: 500 });
    }
}