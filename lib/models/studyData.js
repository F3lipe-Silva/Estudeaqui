// lib/models/studyData.js
import { getDatabase, ObjectId } from '@/lib/db';

// Funções para gerenciar matérias
export async function createSubject(subjectData) {
  try {
    const db = await getDatabase();
    const collection = db.collection('subjects');
    const result = await collection.insertOne({
      ...subjectData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Erro ao criar matéria:', error);
    throw error;
  }
}

export async function getSubjects() {
  try {
    const db = await getDatabase();
    const collection = db.collection('subjects');
    const subjects = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return subjects;
  } catch (error) {
    console.error('Erro ao buscar matérias:', error);
    throw error;
  }
}

export async function getSubjectById(id) {
  try {
    const db = await getDatabase();
    const collection = db.collection('subjects');
    const subject = await collection.findOne({ _id: new ObjectId(id) });
    return subject;
  } catch (error) {
    console.error('Erro ao buscar matéria por ID:', error);
    throw error;
  }
}

// Funções para gerenciar tópicos
export async function createTopic(topicData) {
  try {
    const db = await getDatabase();
    const collection = db.collection('topics');
    const result = await collection.insertOne({
      ...topicData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Erro ao criar tópico:', error);
    throw error;
  }
}

export async function getTopicsBySubject(subjectId) {
  try {
    const db = await getDatabase();
    const collection = db.collection('topics');
    const topics = await collection.find({ subjectId: new ObjectId(subjectId) }).toArray();
    return topics;
  } catch (error) {
    console.error('Erro ao buscar tópicos por matéria:', error);
    throw error;
  }
}

// Funções para gerenciar logs de estudo
export async function createStudyLog(logData) {
  try {
    const db = await getDatabase();
    const collection = db.collection('study_logs');
    const result = await collection.insertOne({
      ...logData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Erro ao criar log de estudo:', error);
    throw error;
  }
}

export async function getStudyLogsBySubject(subjectId) {
  try {
    const db = await getDatabase();
    const collection = db.collection('study_logs');
    const logs = await collection
      .find({ subjectId: new ObjectId(subjectId) })
      .sort({ createdAt: -1 })
      .toArray();
    return logs;
  } catch (error) {
    console.error('Erro ao buscar logs de estudo:', error);
    throw error;
  }
}

// Funções para gerenciar usuários
export async function createUser(userData) {
  try {
    const db = await getDatabase();
    const collection = db.collection('users');
    const result = await collection.insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
    return result;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const db = await getDatabase();
    const collection = db.collection('users');
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}