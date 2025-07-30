import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb'; // Import ObjectId
import { createClient } from '@supabase/supabase-js'; // Import Supabase client for auth
import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest and NextResponse for App Router


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string; // THIS IS CRUCIAL FOR BACKEND AUTH
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// MongoDB Connection Details from .env.local
const uri = process.env.MONGO_URI as string;
const dbName = process.env.MONGO_DB_NAME as string;

// Ensure URI and DB Name are provided
if (!uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}
if (!dbName) {
  throw new Error('Please define the MONGO_DB_NAME environment variable inside .env.local');
}

// Global variable to store cached client promise
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

// Export a POST function for App Router API routes
export async function POST(req: NextRequest) { 
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error("Supabase authentication error:", authError?.message);
    return NextResponse.json({ message: 'Unauthorized. Invalid or expired token.' }, { status: 401 });
  }

  // Parse JSON body from NextRequest
  const { recipeData, imageUrl } = await req.json(); // Use req.json() to parse the body

  // Basic validation for incoming data
  if (!recipeData || typeof recipeData !== 'object' || !imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json({ message: 'Invalid or missing recipe data or image URL.' }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('saved_recipes'); // Your MongoDB collection name

    // Construct the document to be saved
    const documentToInsert = {
      userId: user.id, // Supabase user ID is a string, store it as such
      recipe: recipeData, // The entire recipe JSON object
      imageUrl: imageUrl, // The DALL-E image URL
      savedAt: new Date(), // Timestamp of when it was saved
    };

    // Insert the document into the collection
    const result = await collection.insertOne(documentToInsert);

    // Respond with success using NextResponse
    if (result.acknowledged) {
      return NextResponse.json({
        message: 'Recipe saved successfully!',
        savedRecipeId: result.insertedId, // MongoDB's generated _id
      }, { status: 201 });
    } else {
      // This case should theoretically not be hit if acknowledged is true
      throw new Error('Failed to insert recipe into database (acknowledged false).');
    }

  } catch (error: any) {
    console.error('Error saving recipe to MongoDB:', error);
    // Send a more detailed error message in development for debugging
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message || 'An unexpected error occurred on the server.'
      : 'An unexpected error occurred. Please try again later.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}