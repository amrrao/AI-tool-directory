"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

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
    window.location.href = "/auth/signin";
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {user ? (
        <button className="bg-red-500 text-white p-2 rounded-md" onClick={signOut}>Sign out</button>
      ) : (
        <button className="bg-blue-500 text-white p-2 rounded-md" onClick={signIn}>Sign in</button>
      )}
    </>
  );
}
