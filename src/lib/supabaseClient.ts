// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing from environment variables.");
  
  throw new Error("Supabase URL and Anon Key must be defined.");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);