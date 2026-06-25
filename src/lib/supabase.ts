import { createClient } from '@supabase/supabase-js';

// 1. Try to read from environment variables first
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// 2. Hardcoded fallback so TanStack Start server rendering NEVER crashes on boot
if (!supabaseUrl || !supabaseAnonKey) {
  supabaseUrl = "https://imhdudmrpygfzkloudpx.supabase.co";
  supabaseAnonKey = "sb_publishable_J9MdowG-EfULmwtUSQTHYg_yhm2bLB9";
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);