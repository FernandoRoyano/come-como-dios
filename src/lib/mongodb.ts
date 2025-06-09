import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Por favor define la variable de entorno MONGODB_URI en .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extiende el tipo global para evitar el error de tipo en TypeScript
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para no crear múltiples conexiones
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crea una nueva conexión cada vez
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
