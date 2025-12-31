import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limiter';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Create Supabase client with the access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    // Verify the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Apply rate limiting (per user ID for authenticated users)
    // 10 checkout sessions per minute per user
    const limitResult = rateLimit(req, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute
      identifier: `user_${user.id}`, // Rate limit per user
    });

    if (!limitResult.allowed) {
      const retryAfter = Math.ceil((limitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Too many checkout requests. Please try again later.',
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
          },
        }
      );
    }

    const { priceId, successUrl, cancelUrl } = await req.json();

    // Validate priceId format
    if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    // Validate URLs if provided
    if (successUrl && typeof successUrl === 'string') {
      try {
        new URL(successUrl);
      } catch {
        return NextResponse.json({ error: 'Invalid success URL' }, { status: 400 });
      }
    }

    if (cancelUrl && typeof cancelUrl === 'string') {
      try {
        new URL(cancelUrl);
      } catch {
        return NextResponse.json({ error: 'Invalid cancel URL' }, { status: 400 });
      }
    }

    // Fetch the price to determine if it's recurring or one-time
    // Official pattern from: https://stripe.com/docs/api/prices/retrieve
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (error: any) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }
    const isRecurring = price.type === 'recurring';
    // Official pattern from: https://stripe.com/docs/payments/checkout/modes
    const mode = isRecurring ? 'subscription' : 'payment';

    // Create checkout session
    // Official pattern from: https://stripe.com/docs/api/checkout/sessions/create
    // For subscriptions: https://stripe.com/docs/payments/checkout/build-subscriptions
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode as 'payment' | 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.nextUrl.origin}/cancel`,
    };

    // For subscriptions, customer is required (not customer_email)
    // Official pattern: https://stripe.com/docs/payments/checkout/build-subscriptions#create-checkout-session
    if (isRecurring) {
      // Get or create Stripe customer for subscriptions
      // Security: RLS policy enforces auth.uid() = id, so user can only access their own row
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id) // RLS policy ensures user can only access their own data
        .single();

      let customerId: string;
      if (userData?.stripe_customer_id) {
        customerId = userData.stripe_customer_id;
      } else {
        // Create new Stripe customer
        // Official pattern from: https://stripe.com/docs/api/customers/create
        const customer = await stripe.customers.create({
          email: user.email!,
          metadata: {
            supabase_user_id: user.id,
          },
        });

        customerId = customer.id;

        // Save to Supabase
        // Security: RLS policy (auth.uid() = id) ensures user can only update their own row
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id); // RLS enforces ownership, not this filter
      }

      // For subscriptions, always set customer (required by Stripe)
      sessionParams.customer = customerId;
    } else {
      // For one-time payments, use customer_email
      if (user.email) {
        sessionParams.customer_email = user.email;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json(
      { 
        sessionId: session.id,
        url: session.url 
      },
      {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}