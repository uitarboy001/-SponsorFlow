'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Sparkles, ExternalLink, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { createCheckoutSession } from '@/app/actions/checkout';

function BookingContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [creator, setCreator] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorEmail, setSponsorEmail] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setLoading(true);

      // ใช้ .from('creators')
      const { data: creatorData, error: creatorErr } = await supabase
        .from('creators')
        .select('*')
        .eq('slug', slug)
        .single();

      if (creatorData) {
        setCreator(creatorData);

        // ใช้ .from('slots')
        const { data: slotData } = await supabase
          .from('slots')
          .select('*')
          .eq('creator_id', creatorData.id)
          .order('issue_date', { ascending: true });

        if (slotData && slotData.length > 0) {
          setSlots(slotData);
          const firstAvailable = slotData.find((s) => s.status === 'available');
          if (firstAvailable) setSelectedSlotId(firstAvailable.id);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  const currentSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  const handleCheckout = async () => {
    if (!selectedSlotId || !sponsorName || !sponsorEmail || !headline || !bodyText || !targetUrl) {
      alert('กรุณากรอกข้อมูลโฆษณาและอีเมลให้ครบทุกช่องก่อนดำเนินการ');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCheckoutSession({
        slotId: selectedSlotId,
        creatorSlug: slug,
        sponsorName,
        sponsorEmail,
        adHeadline: headline,
        adBody: bodyText,
        adTargetUrl: targetUrl,
      });

      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Stripe');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-stone-500 font-sans">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-stone-700 font-sans">
        <h1 className="text-xl font-bold mb-2">ไม่พบ Newsletter นี้</h1>
        <p className="text-sm text-stone-500">กรุณาตรวจสอบ URL อีกครั้ง</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-amber-100">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Accepting verified sponsorships</span>
          </div>
          <div className="flex items-center gap-1 text-stone-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Direct to Creator via Stripe</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* ฝั่งซ้าย: Media Kit + Live Preview */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-stone-400 uppercase font-semibold">
                Creator Profile
              </span>
              <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1 tracking-tight">
                {creator.newsletter_name}
              </h1>
              <p className="text-stone-600 text-sm mt-2 leading-relaxed">{creator.tagline}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                <div className="text-xl font-bold font-serif text-stone-900">
                  {creator.subscriber_count?.toLocaleString()}+
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Subscribers</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                <div className="text-xl font-bold font-serif text-emerald-700">{creator.avg_open_rate}%</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Avg Open Rate</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs">
                <div className="text-xs font-bold text-stone-800 line-clamp-1 mt-1">
                  {creator.audience_tags?.[0] || 'General'}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Audience</div>
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono mb-3">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Live Newsletter Preview
                </span>
                <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                  {currentSlot?.issue_date}
                </span>
              </div>

              <div className="border border-stone-200 rounded-xl p-4 bg-[#FCFBF9]">
                <div className="text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">
                  SPONSORED
                </div>
                <div className="font-semibold text-stone-900 text-sm">
                  {headline || 'Your Compelling Headline Goes Here'}
                </div>
                <p className="text-stone-600 text-xs mt-1.5 leading-relaxed line-clamp-3">
                  {bodyText || 'Your ad body copy will render here inside the actual newsletter email.'}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                  <span>{targetUrl || 'https://yourwebsite.com'}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา: Slot List + Input Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 p-8 shadow-xs space-y-8">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-emerald-600 uppercase font-semibold">
                Self-Service Booking
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">Book Your Sponsor Slot</h2>
            </div>

            {/* Step 1: สล็อต */}
            <div>
              <label className="block text-xs font-mono uppercase text-stone-500 mb-3 font-semibold">
                Step 1 • Select Upcoming Issue
              </label>
              <div className="space-y-2.5">
                {slots.map((slot) => {
                  const isAvailable = slot.status === 'available';
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        !isAvailable
                          ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                          : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                        <div>
                          <div className="font-medium text-sm leading-none">{slot.issue_date}</div>
                          <div className={`text-xs mt-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                            {slot.issue_topic}
                          </div>
                        </div>
                      </div>
                      <div>
                        {isAvailable ? (
                          <span
                            className={`text-sm font-semibold font-mono px-2.5 py-1 rounded-md ${
                              isSelected ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-900'
                            }`}
                          >
                            ${slot.price_usd} USD
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 font-mono bg-stone-200/60 px-2 py-0.5 rounded">
                            Booked 🔒
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: ฟอร์มกรอกชิ้นงาน */}
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-mono uppercase text-stone-500 font-semibold">
                Step 2 • Ad Creative Submission
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Company / Sponsor Name</label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="e.g. Acme Inc"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Billing Email</label>
                  <input
                    type="email"
                    value={sponsorEmail}
                    onChange={(e) => setSponsorEmail(e.target.value)}
                    placeholder="sponsor@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-stone-700">Headline</label>
                  <span className="text-[11px] font-mono text-stone-400">{headline.length}/80</span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Catchy value proposition..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-stone-700">Ad Body Copy</label>
                  <span className="text-[11px] font-mono text-stone-400">{bodyText.length}/250</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Describe your product..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Target Link (with UTM)</label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://yourproduct.com?ref=newsletter"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Step 3: ชำระเงิน */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-stone-600 text-sm">Selected Slot Total:</span>
                <span className="text-2xl font-bold font-serif text-stone-900">
                  ${currentSlot?.price_usd || 0} USD
                </span>
              </div>

              <button
                type="button"
                disabled={submitting || !currentSlot}
                onClick={handleCheckout}
                className="w-full py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเชื่อมต่อไปยัง Stripe...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ${currentSlot?.price_usd || 0} & Reserve Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-stone-500 font-sans">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          กำลังโหลด...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}