"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";

// Official pattern from: https://supabase.com/docs/reference/javascript/auth-signout
export default function AuthButton() {
  const { user, loading } = useAuth();

  async function signIn() {
    // Redirect to sign-in page (handled by Auth UI component)
    window.location.href = "/auth/signin";
  }

  async function signOut() {
    // Official pattern: https://supabase.com/docs/reference/javascript/auth-signout
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
