
import { MongoClient, Db } from 'mongodb';

// Check if MONGO_URI is defined in environment variables
if (!process.env.MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

const uri: string = process.env.MONGO_URI;
// Define your desired database name. This will be the database created if it doesn't exist.
const dbName: string = process.env.MONGO_DB_NAME || 'chefai'; // Default to 'chefai' if not specified

// Cached connection variables to prevent opening multiple connections
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connects to the MongoDB database.
 * Uses a cached connection if available to improve performance.
 * @returns {Promise<{ client: MongoClient; db: Db }>} An object containing the MongoClient instance and the Db instance.
 * @throws {Error} If connection to MongoDB fails.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // If a connection is already cached, return it immediately
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new MongoClient instance
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    // Select the database
    const db = client.db(dbName);

    // Cache the client and database for future use
    cachedClient = client;
    cachedDb = db;

    console.log('Successfully connected to MongoDB!'); // Optional: for logging
    return { client, db };
  } catch (error) {
    // Log and re-throw the error if connection fails
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}