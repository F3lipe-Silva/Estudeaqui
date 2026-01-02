import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  QueryConstraint,
  DocumentData,
  Timestamp
} from 'firebase/firestore';

// Keep config structure for compatibility
const COLLECTION_NAMES = {
  users: 'users',
  courses: 'courses',
  lessons: 'lessons',
  progress: 'progress',
  enrollments: 'enrollments',
  certificates: 'certificates',
  reviews: 'reviews'
};

export interface DatabaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

// Helper to parse Appwrite-style query strings to Firestore constraints
const parseQuery = (queries?: any[]): QueryConstraint[] => {
  if (!queries) return [];
  
  const constraints: QueryConstraint[] = [];
  
  queries.forEach(q => {
    if (typeof q !== 'string') return;
    
    // equal("field", "value")
    const equalMatch = q.match(/equal\("([^"]+)",\s*"([^"]+)"\)/);
    if (equalMatch) {
      constraints.push(where(equalMatch[1], '==', equalMatch[2]));
      return;
    }
    
    // orderDesc("field")
    const orderDescMatch = q.match(/orderDesc\("([^"]+)"\)/);
    if (orderDescMatch) {
      constraints.push(orderBy(orderDescMatch[1], 'desc'));
      return;
    }

    // orderAsc("field")
    const orderAscMatch = q.match(/orderAsc\("([^"]+)"\)/);
    if (orderAscMatch) {
      constraints.push(orderBy(orderAscMatch[1], 'asc'));
      return;
    }

    // limit(n)
    const limitMatch = q.match(/limit\((\d+)\)/);
    if (limitMatch) {
      constraints.push(limit(parseInt(limitMatch[1])));
      return;
    }
  });

  return constraints;
};

const mapDoc = (docSnap: DocumentData): any => {
  const data = docSnap.data();
  return {
    ...data,
    $id: docSnap.id,
    $createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    $updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  };
};

export class AppwriteDB<T extends DatabaseDocument> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Criar documento
  async create(data: Omit<T, keyof DatabaseDocument>): Promise<T> {
    try {
      const now = new Date();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      const newDoc = await getDoc(docRef);
      
      return mapDoc(newDoc) as T;
    } catch (error) {
      throw error;
    }
  }

  // Listar documentos
  async list(queries?: any[]): Promise<T[]> {
    try {
      const constraints = parseQuery(queries);
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(mapDoc) as T[];
    } catch (error) {
      throw error;
    }
  }

  // Obter documento por ID
  async get(documentId: string): Promise<T> {
    try {
      const docRef = doc(db, this.collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      return mapDoc(docSnap) as T;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar documento
  async update(documentId: string, data: Partial<T>): Promise<T> {
    try {
      const docRef = doc(db, this.collectionName, documentId);
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      await updateDoc(docRef, updateData);
      const updatedDoc = await getDoc(docRef);
      
      return mapDoc(updatedDoc) as T;
    } catch (error) {
      throw error;
    }
  }

  // Deletar documento
  async delete(documentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, documentId));
    } catch (error) {
      throw error;
    }
  }

  // Query helper (mocked for compatibility if needed, mostly handled by list parsing)
  query() {
    return {
      equal: (attr: string, value: string) => `equal("${attr}", "${value}")`,
      orderDesc: (attr: string) => `orderDesc("${attr}")`,
      orderAsc: (attr: string) => `orderAsc("${attr}")`,
      limit: (n: number) => `limit(${n})`,
    };
  }
}

// Instâncias para coleções específicas
export const usersDB = new AppwriteDB<any>(COLLECTION_NAMES.users);
export const coursesDB = new AppwriteDB<any>(COLLECTION_NAMES.courses);
export const lessonsDB = new AppwriteDB<any>(COLLECTION_NAMES.lessons);
export const progressDB = new AppwriteDB<any>(COLLECTION_NAMES.progress);
