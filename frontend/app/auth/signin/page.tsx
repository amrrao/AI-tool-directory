"use client";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";

// Official pattern from: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
export default function SignInPage() {
  // Get the callback URL for email confirmations and OAuth redirects
  // Official pattern: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#redirect-urlsxx
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return '/auth/callback';
  };

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={[]} // Email/password only - no OAuth providers
      view="sign_in"
      redirectTo={getRedirectUrl()} // Required for email confirmations
      // Official Auth UI props: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#props
    />
  );
}