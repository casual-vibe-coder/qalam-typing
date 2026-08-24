import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Sends a 6-digit code by email — no magic-link redirect config needed,
  // works the same on any device including a partner opening it fresh.
  const sendCode = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    return { error: error?.message ?? null };
  }, []);

  const verifyCode = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { session, loading, sendCode, verifyCode, signOut, isConfigured: isSupabaseConfigured };
}
