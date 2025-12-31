"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Prevent prerendering - this page requires browser APIs
export const dynamic = 'force-dynamic';

// Official pattern from: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#handling-callbacks
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Handle OAuth redirects (hash-based tokens)
      // Official pattern: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#oauth-callbacks
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      // Handle email confirmation (query-based tokens)
      // Official pattern: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#email-confirmation
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      try {
        // OAuth callback: set session from hash tokens
        // Official pattern: https://supabase.com/docs/reference/javascript/auth-setsession
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (!error) {
            router.push("/");
            return;
          }
        }
        
        // Email confirmation: verify OTP token
        // Official pattern: https://supabase.com/docs/reference/javascript/auth-verifyotp
        // Documentation: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#email-confirmation
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as 'email' | 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
            token_hash,
          });

          if (!error) {
            router.push("/");
            return;
          }
        }

        // If neither callback type worked, redirect to sign-in with error
        router.push("/auth/signin?error=verification_failed");
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/auth/signin?error=verification_failed");
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>Verifying your email...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
}

// Wrap in Suspense boundary as required by Next.js 15
// Official pattern: https://nextjs.org/docs/app/api-reference/functions/use-search-params
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

