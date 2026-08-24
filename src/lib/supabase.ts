// Reuses the same Supabase project as the Awwal app, scoped to its own
// table (qalam_progress) so nothing collides with Awwal's schema. Anon key
// only — safe to ship in the client bundle, access is enforced by RLS.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — email login and progress sync are disabled."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
