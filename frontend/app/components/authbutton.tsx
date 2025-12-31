"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";

export default function AuthButton() {
  const { user, loading } = useAuth();

  async function signIn() {
    window.location.href = "/auth/signin";
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <button className="bg-gray-400 text-white p-2 rounded-md" disabled>
        Loading...
      </button>
    );
  }

  return (
    <>
      {user ? (
        <button className="bg-red-500 text-white p-2 rounded-md" onClick={signOut}>
          Sign out
        </button>
      ) : (
        <button className="bg-blue-500 text-white p-2 rounded-md" onClick={signIn}>
          Sign in
        </button>
      )}
    </>
  );
}
