"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";

// Official pattern from: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
export default function SignInPage() {
  const router = useRouter();

  // Redirect to home if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };

    checkSession();

    // Listen for auth state changes (when user signs in)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // User successfully signed in, redirect to home
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Get the callback URL for email confirmations and OAuth redirects
  // Official pattern: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#redirect-urls
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