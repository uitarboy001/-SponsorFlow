'use server';

import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY?.trim() || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

export async function createCheckoutSession(formData: {
  slotId: string;
  creatorSlug: string;
  sponsorName: string;
  sponsorEmail: string;
  adHeadline: string;
  adBody: string;
  adTargetUrl: string;
}) {
  // สังเกตตรง .from('slots')
const { data: slot, error: slotError } = await supabase
  .from('slots')
  .select('*, creators(*)')
  .eq('id', formData.slotId)
  .single();

  if (slotError || !slot) {
    throw new Error('ไม่พบข้อมูลรอบสล็อตนี้');
  }

  if (slot.status !== 'available') {
    throw new Error('สล็อตนี้ถูกจองไปแล้ว');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: formData.sponsorEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sponsorship: ${slot.creators?.newsletter_name || 'Newsletter'}`,
            description: `Issue Date: ${slot.issue_date} (${slot.issue_topic})`,
          },
          unit_amount: slot.price_usd * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      slotId: formData.slotId,
      creatorId: slot.creator_id,
      sponsorName: formData.sponsorName,
      sponsorEmail: formData.sponsorEmail,
      adHeadline: formData.adHeadline,
      adBody: formData.adBody,
      adTargetUrl: formData.adTargetUrl,
    },
    success_url: `${appUrl}/${formData.creatorSlug}?success=true`,
    cancel_url: `${appUrl}/${formData.creatorSlug}?canceled=true`,
  });

  return { url: session.url };
}