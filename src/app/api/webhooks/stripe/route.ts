import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ถ้าไม่มี Key ให้ใช้ String ว่างเพื่อให้ SDK ฟ้อง Error ชัดเจน
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

// บังคับใช้ Service Role Key เท่านั้น ห้าม Fallback ไปหา Anon Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature || '',
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Signature Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata?.slotId) {
      // ใช้ .from('slots')
      await supabaseAdmin
        .from('slots')
        .update({ status: 'booked' })
        .eq('id', metadata.slotId);

      // ใช้ .from('bookings') และชื่อฟิลด์ ad_body
      await supabaseAdmin.from('bookings').insert({
        slot_id: metadata.slotId,
        creator_id: metadata.creatorId,
        sponsor_name: metadata.sponsorName,
        sponsor_email: metadata.sponsorEmail,
        ad_headline: metadata.adHeadline,
        ad_body: metadata.adBody,
        ad_target_url: metadata.adTargetUrl,
        amount_paid_usd: (session.amount_total || 0) / 100,
        stripe_session_id: session.id,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}