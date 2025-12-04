import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI não está definido. As operações do MongoDB não funcionarão.');
  // Retorna uma promessa rejeitada para operações futuras
  clientPromise = Promise.reject(new Error('MONGODB_URI não está definido'));
} else {
  if (process.env.NODE_ENV === 'development') {
    // Em modo de desenvolvimento, use uma variável global para evitar hot reloading issues
    if (!global._mongoClientPromise) {
      console.log('Criando nova conexão MongoDB...');
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
      global._mongoClientPromise.catch(err => {
        console.error('Erro na conexão MongoDB:', err);
      });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // Em produção, é seguro criar uma nova conexão
    console.log('Criando nova conexão MongoDB...');
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
    clientPromise.catch(err => {
      console.error('Erro na conexão MongoDB:', err);
    });
  }
}

export default clientPromise;