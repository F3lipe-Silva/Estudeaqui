import { NextRequest } from 'next/server';
import { getData, insertData } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Testar conexão buscando dados
    const data = await getData('test_collection');
    return Response.json({
      message: 'Conexão com MongoDB bem-sucedida!',
      database: 'estudeaqui',
      collection: 'test_collection',
      documentCount: data.length,
      sampleData: data.slice(0, 5) // Retorna até 5 documentos de exemplo
    });
  } catch (error: any) {
    return Response.json({ error: 'Erro na conexão com MongoDB', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Testar inserção de dados
    const testData = {
      _id: `test_${Date.now()}`,
      message: 'Documento de teste do Estudeaqui',
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    const result = await insertData('test_collection', testData);
    return Response.json({
      message: 'Dados inseridos com sucesso!',
      insertedId: result.insertedId
    });
  } catch (error: any) {
    return Response.json({ error: 'Erro ao inserir dados', details: error.message }, { status: 500 });
  }
}