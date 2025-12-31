import { createClient } from "@supabase/supabase-js";

// Official pattern from: https://supabase.com/docs/reference/javascript/creating-a-client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

// Create Supabase client for client-side usage
// Documentation: https://supabase.com/docs/reference/javascript/creating-a-client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Store session in localStorage
    autoRefreshToken: true, // Automatically refresh expired tokens
    detectSessionInUrl: true, // Detect auth tokens in URL (for email confirmations)
  },
});