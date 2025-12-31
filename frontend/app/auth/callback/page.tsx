"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      const token_hash = searchParams.get("token_hash");
      const queryType = searchParams.get("type");

      try {
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (!error) {
            router.push("/");
            return;
          }
        } else if (token_hash && queryType) {
          const { error } = await supabase.auth.verifyOtp({
            type: queryType as any,
            token_hash,
          });

          if (!error) {
            router.push("/");
            return;
          }
        }

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

