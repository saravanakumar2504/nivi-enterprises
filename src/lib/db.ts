import { MongoClient, type MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

// Augment the global object to cache the connection across hot-reloads and warm serverless invocations.
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise: Promise<MongoClient> = (() => {
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri, options).connect();
  }

  return globalWithMongo._mongoClientPromise;
})();

export default clientPromise;
