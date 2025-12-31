import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security: RLS policy enforces auth.uid() = id, so user can only access their own row
    // The .eq() filter is for clarity/performance, but RLS is the actual security layer
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id) // RLS policy ensures user can only access their own data
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({ subscription: null });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
    });

    return NextResponse.json({
      subscription: subscriptions.data[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}