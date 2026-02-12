import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For data operations (service role key bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// For auth operations (anon key for Supabase Auth OTP)
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
