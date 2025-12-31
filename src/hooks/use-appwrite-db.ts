import { databases, APPWRITE_CONFIG } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export interface DatabaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export class AppwriteDB<T extends DatabaseDocument> {
  private collectionId: string;

  constructor(collectionId: string) {
    this.collectionId = collectionId;
  }

  // Criar documento
  async create(data: Omit<T, keyof DatabaseDocument>): Promise<T> {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        ID.unique(),
        data
      );
      return response as unknown as T;
    } catch (error) {
      throw error;
    }
  }

  // Listar documentos
  async list(queries?: any[]): Promise<T[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        queries
      );
      return response.documents as unknown as T[];
    } catch (error) {
      throw error;
    }
  }

  // Obter documento por ID
  async get(documentId: string): Promise<T> {
    try {
      const response = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        documentId
      );
      return response as unknown as T;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar documento
  async update(documentId: string, data: Partial<T>): Promise<T> {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        documentId,
        data
      );
      return response as unknown as T;
    } catch (error) {
      throw error;
    }
  }

  // Deletar documento
  async delete(documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        this.collectionId,
        documentId
      );
    } catch (error) {
      throw error;
    }
  }

  // Query helper
  query() {
    return Query;
  }
}

// Instâncias para coleções específicas
export const usersDB = new AppwriteDB<any>(APPWRITE_CONFIG.collections.users);
export const coursesDB = new AppwriteDB<any>(APPWRITE_CONFIG.collections.courses);
export const lessonsDB = new AppwriteDB<any>(APPWRITE_CONFIG.collections.lessons);
export const progressDB = new AppwriteDB<any>(APPWRITE_CONFIG.collections.progress);
