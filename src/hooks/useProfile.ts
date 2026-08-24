import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

/** True if the *currently signed-in* user already has a qalam_profiles row. Used right after email-code verification, before the session-state listener has necessarily settled. */
export async function hasProfile(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return false;
  const { data } = await supabase.from("qalam_profiles").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

/** Claim a leaderboard display name for the current user. Surfaces a friendly message if it's taken. */
export async function claimUsername(username: string): Promise<{ error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: "You're not signed in." };
  const { error } = await supabase.from("qalam_profiles").insert({ user_id: userId, username });
  if (error) {
    if (error.code === "23505") return { error: "That username is taken — try another." };
    return { error: error.message };
  }
  return { error: null };
}

/** The signed-in user's own chosen username, for display (e.g. "Sign out" line, leaderboard highlight). */
export function useProfile(userId: string | null) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !userId) {
      setUsername(null);
      return;
    }
    setLoading(true);
    supabase
      .from("qalam_profiles")
      .select("username")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setUsername(data?.username ?? null);
        setLoading(false);
      });
  }, [userId]);

  const refresh = useCallback(() => {
    if (!isSupabaseConfigured || !userId) return;
    supabase
      .from("qalam_profiles")
      .select("username")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setUsername(data?.username ?? null));
  }, [userId]);

  return { username, loading, refresh };
}
