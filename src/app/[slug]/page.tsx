'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, ExternalLink, ArrowRight, Loader2, Mail, Check, TrendingUp, Users, Info, Upload } from 'lucide-react';
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
  const [adImageUrl, setAdImageUrl] = useState(''); // New state for ad image

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setLoading(true);

      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('slug', slug)
        .single();

      if (creatorData) {
        setCreator(creatorData);

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
      alert('Please fill in all required details before proceeding.');
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
        // In a real app, you would pass adImageUrl to checkout/db as well
      });

      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  // Helper to format date like "Dec 12, 2027"
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFC] flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#FDFDFC] flex flex-col items-center justify-center text-slate-600">
        <Mail className="w-10 h-10 text-slate-300 mb-4" />
        <h1 className="text-xl font-medium mb-1">Creator Not Found</h1>
        <p className="text-sm text-slate-500">Please check the URL and try again.</p>
      </div>
    );
  }

  return (
    // Updated background with a subtle gradient matching the premium design
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] via-[#FDFDFC] to-[#FDF5ED] text-slate-900 font-sans selection:bg-emerald-100 pb-24">
      
      {/* Clean Header */}
      <header className="bg-white/60 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider text-[10px] font-bold text-slate-600">Accepting Sponsors</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 bg-white/80 border border-slate-200/60 px-3 py-1.5 rounded-md shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secured by Stripe</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Profile & Preview */}
          <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-28">
            
            {/* Profile Info */}
            <div className="flex flex-row items-center gap-5 mb-4">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {creator.image_url ? (
                  <img 
                    src={creator.image_url} 
                    alt={creator.newsletter_name} 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.25rem] shadow-sm object-cover border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-800 text-white rounded-[1.25rem] shadow-sm flex items-center justify-center text-3xl sm:text-4xl font-serif border border-slate-200">
                    {creator.newsletter_name.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Name & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight line-clamp-2">
                  {creator.newsletter_name}
                </h1>
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed line-clamp-2">
                  {creator.tagline}
                </p>
              </div>
            </div>

            {/* Subtle Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative group cursor-default">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Subscribers
                  <Info className="w-3 h-3 text-slate-300 ml-auto" />
                </div>
                <div className="text-2xl font-serif font-bold text-slate-800">
                  {creator.subscriber_count?.toLocaleString() || 0}
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> AVG Open Rate
                </div>
                <div className="text-2xl font-serif font-bold text-slate-800">
                  {creator.avg_open_rate || 0}%
                </div>
              </div>

              <div className="col-span-2 bg-white px-5 py-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">Audience</span>
                <span className="text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full truncate">
                  {creator.audience_tags?.[0] || 'General'}
                </span>
              </div>
            </div>

            {/* Email Preview */}
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Live Ad Preview</div>
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  </div>
                </div>
                
                <div className="p-6 md:p-8">
                  {/* Ad Image Preview */}
                  <div className="w-full aspect-[2/1] rounded-xl overflow-hidden mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-center p-4">
                    {adImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={adImageUrl} alt="Ad banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="font-semibold text-white/90 drop-shadow-sm text-sm sm:text-base">
                            Your uploaded image/banner<br/>goes here (2:1)
                        </div>
                    )}
                  </div>

                  <div className="border-l-[3px] border-emerald-500 pl-4 py-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">
                      Sponsored
                    </div>
                    <div className="font-bold text-slate-900 text-lg leading-snug break-words">
                      {headline || 'Your Compelling Headline Goes Here'}
                    </div>
                    <p className="text-slate-600 text-[13px] mt-2 leading-relaxed break-words whitespace-pre-wrap">
                      {bodyText || 'This is where your ad body copy will render inside the actual newsletter email. Make it engaging!'}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                      <span className="break-all line-clamp-1">{targetUrl || 'yourwebsite.com'}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Booking Flow */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 p-6 sm:p-10 lg:p-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-10">Book your sponsorship</h2>

            {/* STEP 1 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Select Issue Date</h3>
              </div>
              
              <div className="space-y-3">
                {slots.map((slot) => {
                  const isAvailable = slot.status === 'available';
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 ${
                        !isAvailable
                          ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="text-left flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className={`font-semibold text-sm sm:text-base ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                            {formatDate(slot.issue_date)}
                          </div>
                          <div className="hidden sm:block text-slate-300">•</div>
                          <div className="text-xs sm:text-sm text-slate-500">
                            {slot.issue_topic}
                          </div>
                        </div>
                      </div>
                      <div>
                        {isAvailable ? (
                          <span className={`text-base font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                            ${slot.price_usd}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-md">
                            Booked
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2 */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Ad Creative Details</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Name</label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="e.g. Acme Inc"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Billing Email</label>
                    <input
                      type="email"
                      value={sponsorEmail}
                      onChange={(e) => setSponsorEmail(e.target.value)}
                      placeholder="sponsor@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-700">Headline</label>
                          <span className="text-[10px] font-mono text-slate-400">{headline.length}/80</span>
                        </div>
                        <input
                          type="text"
                          maxLength={80}
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          placeholder="Catchy value proposition..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white shadow-sm"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-700">Body Copy</label>
                          <span className="text-[10px] font-mono text-slate-400">{bodyText.length}/250</span>
                        </div>
                        <textarea
                          rows={4}
                          maxLength={250}
                          value={bodyText}
                          onChange={(e) => setBodyText(e.target.value)}
                          placeholder="Describe your product or service..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white shadow-sm resize-none"
                        />
                      </div>
                  </div>

                  {/* Image Upload Area */}
                  <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Upload Ad Graphic (Optional)</span>
                      </label>
                      <div className="w-full h-[180px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-4 hover:bg-slate-100 transition-colors cursor-pointer group">
                          <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-slate-600 transition-colors" />
                          <div className="text-sm font-medium text-slate-700">Upload banner or logo</div>
                          <div className="text-[11px] text-slate-500 mt-1">(Aspect ratio 2:1, PNG/JPG up to 5MB)</div>
                          {/* In a real app, this would be an actual file input triggering an upload to Supabase Storage */}
                          <input 
                            type="text" 
                            placeholder="Or paste image URL here" 
                            className="mt-3 text-xs w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none text-center"
                            value={adImageUrl}
                            onChange={(e) => setAdImageUrl(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                      </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">Target Link (with UTMs)</label>
                      <span className="text-[10px] font-mono text-slate-400">0/250</span>
                  </div>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://yourproduct.com?ref=newsletter"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* CHECKOUT BUTTON */}
            <div className="pt-8 mt-4 border-t border-slate-100/80">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-medium text-slate-500">Total Investment</span>
                <span className="text-3xl font-serif font-bold text-slate-900">
                  ${currentSlot?.price_usd || 0} <span className="text-sm font-sans font-medium text-slate-500">USD</span>
                </span>
              </div>

              <div className="flex flex-col items-center">
                  <button
                    type="button"
                    disabled={submitting || !currentSlot}
                    onClick={handleCheckout}
                    className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-900/10 mb-3"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing securely...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Secure Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>secured by</span>
                      <span className="font-bold text-slate-600">Stripe</span>
                  </div>
              </div>
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
        <div className="min-h-screen bg-[#FDFDFC] flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}