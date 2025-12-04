// app/api/study/schedule-plans/[id]/route.ts
import { NextRequest } from 'next/server';
import { StudyService } from '@/services/study-service';

// DELETE /api/study/schedule-plans/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const success = await StudyService.deleteSchedulePlan(id);
        if (success) {
            return Response.json({ message: 'Plano de agenda deletado com sucesso' });
        } else {
            return Response.json({ error: 'Plano de agenda não encontrado' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Erro ao deletar plano de agenda:', error);
        return Response.json({ error: error.message || 'Erro ao deletar plano de agenda' }, { status: 500 });
    }
}