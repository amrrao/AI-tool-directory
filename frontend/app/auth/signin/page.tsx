"use client";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function SignInPage() {
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
        providers={[]}
        view="sign_in"
        redirectTo={getRedirectUrl()}
    />
  );
}