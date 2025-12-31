import { loadStripe, Stripe } from '@stripe/stripe-js';

// Official pattern from: https://stripe.com/docs/stripe-js#loading-stripejs
let stripePromise: Promise<Stripe | null>;

export const getStripeClient = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

