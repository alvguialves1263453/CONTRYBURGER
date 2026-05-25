import { createClient } from "@supabase/supabase-js";

// Fetch from Vite's import.meta.env or Node's process.env if available, with robust fallbacks
const meta = import.meta as any;
const supabaseUrl = 
  (meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== "undefined" && process?.env?.SUPABASE_URL) || 
  "https://placeholder-project.supabase.co"; // Safe fallback to prevent crash

const supabaseAnonKey = 
  (meta.env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== "undefined" && process?.env?.SUPABASE_ANON_KEY) || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_compilation"; // Safe fallback to prevent crash

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper check to verify if the client has been fully configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    supabaseAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_compilation"
  );
};
