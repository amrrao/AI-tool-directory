"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';

interface CheckoutButtonProps {
  priceId: string;
  children: React.ReactNode;
}

export default function CheckoutButton({ priceId, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }

    setLoading(true);

    try {
      // Get the session token to send with the request
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please sign in again.');
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url, sessionId } = await response.json();

      if (!url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect directly to Stripe Checkout URL
      // Official pattern from: https://stripe.com/docs/api/checkout/sessions/object#checkout_session_object-url
      // After redirectToCheckout deprecation: https://docs.stripe.com/changelog/clover/2025-09-30/remove-redirect-to-checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}