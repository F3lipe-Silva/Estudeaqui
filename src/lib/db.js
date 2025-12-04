// Exemplo de como usar a conexão MongoDB no seu aplicativo

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getDatabase() {
  try {
    console.log('Obtendo conexão com banco de dados...');
    const client = await clientPromise;
    console.log('Conexão MongoDB obtida com sucesso');
    const db = client.db('estudeaqui');
    console.log('Banco de dados "estudeaqui" selecionado');
    return db;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

// Exemplo de função para buscar dados
export async function getData(collectionName) {
  try {
    const db = await getDatabase();
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    // Retorna array vazio em caso de erro
    return [];
  }
}

// Exemplo de função para inserir dados
export async function insertData(collectionName, data) {
  try {
    const db = await getDatabase();
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    return result;
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    throw error;
  }
}

// Função auxiliar para converter string para ObjectId
export { ObjectId };