import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limiter';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  // Rate limit webhook endpoint (by IP since we don't have user context yet)
  const limitResult = rateLimit(req, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 webhook events per minute (Stripe can send many)
  });

  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Official pattern from: https://stripe.com/docs/webhooks/signatures
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature - official Stripe method
    // https://stripe.com/docs/webhooks/signatures#verify-manually
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  // Handle different event types
  // Official pattern: https://stripe.com/docs/webhooks
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Official pattern: https://stripe.com/docs/payments/checkout/build-subscriptions#handle-success
      // For subscriptions, retrieve the subscription from the session
      if (session.mode === 'subscription' && session.subscription) {
        // Retrieve the full subscription object
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ['default_payment_method'] }
        );

        // Find user by customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (user) {
          // Subscription successfully created
          // Official pattern: https://stripe.com/docs/billing/subscriptions/overview
          console.log('Subscription created for user:', user.id, 'Subscription ID:', subscription.id);
          // TODO: Store subscription_id in your database if needed
        }
      } else if (session.mode === 'payment' && session.customer) {
        // One-time payment completed
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', session.customer as string)
          .single();

        if (user) {
          console.log('Payment completed for user:', user.id);
        }
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      // Official pattern: https://stripe.com/docs/billing/subscriptions/overview#subscription-events
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find user by customer ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single();

      if (user) {
        // Subscription created or updated
        // Official pattern: https://stripe.com/docs/api/subscriptions/object
        console.log(`Subscription ${event.type} for user:`, user.id, {
          subscriptionId: subscription.id,
          status: subscription.status,
        });
        // TODO: Update subscription status in your database
      }
      break;
    }

    case 'customer.subscription.deleted': {
      // Official pattern: https://stripe.com/docs/billing/subscriptions/cancel
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find user by customer ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single();

      if (user) {
        // Subscription cancelled
        console.log('Subscription cancelled for user:', user.id, 'Subscription ID:', subscription.id);
        // TODO: Update subscription status to cancelled in your database
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}