import { type SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const isSupabaseConfigured: boolean =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl !== "undefined" &&
  supabaseAnonKey !== "undefined";

let _client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    _client = createClient(supabaseUrl as string, supabaseAnonKey as string);
  } catch (e) {
    console.warn("[Supabase] Failed to initialize client:", e);
    _client = null;
  }
} else {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
      "Data will not persist. Set these in src/frontend/.env to enable Supabase.",
  );
}

export const supabase = _client;
