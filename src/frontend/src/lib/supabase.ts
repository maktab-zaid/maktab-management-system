import { type SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — Supabase disabled. App will run with empty data.",
  );
}

// Use an explicit `any`-typed client so that .from() table calls accept
// arbitrary row shapes without a generated Database type definition.
// biome-ignore lint/suspicious/noExplicitAny: no generated DB schema — permissive typing required
export const supabase: SupabaseClient<any> | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : null;
