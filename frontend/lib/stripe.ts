import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with secret key
// Official pattern from: https://stripe.com/docs/api/node#installation
// API version will default to the latest if not specified
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});