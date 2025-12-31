import { Client, Account, Databases, Storage, Functions } from 'appwrite';

// Configuração do cliente Appwrite (servidor em nuvem)
const client = new Client()
  .setEndpoint('https://appwrite.nozdog.xyz/v1')
  .setProject('695585ac003bbff13197');

// Exportar instâncias dos serviços
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Configurações padrão
export const APPWRITE_CONFIG = {
  endpoint: 'https://appwrite.nozdog.xyz/v1',
  projectId: '695585ac003bbff13197',
  databaseId: 'estudeaqui_db', // Você precisará criar este banco
  collections: {
    users: 'users',
    courses: 'courses',
    lessons: 'lessons',
    progress: 'progress',
    enrollments: 'enrollments',
    certificates: 'certificates',
    reviews: 'reviews'
  },
  buckets: {
    avatars: 'avatars',
    materials: 'materials',
    videos: 'videos'
  }
};

export default client;
