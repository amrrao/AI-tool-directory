"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // get current user on load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google", // or github
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {user ? (
        <button onClick={signOut}>Sign out</button>
      ) : (
        <button onClick={signIn}>Sign in</button>
      )}
    </>
  );
}
