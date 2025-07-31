
import { MongoClient, ServerApiVersion } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase (ensure these environment variables are correctly set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// MongoDB Connection Details from .env.local
const uri = process.env.MONGO_URI as string;
const dbName = process.env.MONGO_DB_NAME as string;

if (!uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}
if (!dbName) {
  throw new Error('Please define the MONGO_DB_NAME environment variable inside .env.local');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Could not connect to the database.");
  }
}

// Export a GET function for App Router API routes to fetch recipes
export async function GET(req: NextRequest) {
  // 1. Authenticate the user
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error("Supabase authentication error:", authError?.message);
    return NextResponse.json({ message: 'Unauthorized. Invalid or expired token.' }, { status: 401 });
  }

  try {
    // 2. Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('saved_recipes'); 

    // 3. Fetch recipes for the authenticated user
    // Ensure userId in MongoDB matches Supabase user.id (which is a string)
    const savedRecipes = await collection.find({ userId: user.id }).sort({ savedAt: -1 }).toArray();

    // --- ADDED DEBUG LOG IN API ---
    console.log("API: Recipes being sent to frontend:", JSON.stringify(savedRecipes, null, 2));
    // --- END DEBUG LOG ---

    // 4. Return the recipes
    return NextResponse.json({ recipes: savedRecipes }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching recipes from MongoDB:', error);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message || 'An unexpected error occurred on the server.'
      : 'An unexpected error occurred. Please try again later.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}