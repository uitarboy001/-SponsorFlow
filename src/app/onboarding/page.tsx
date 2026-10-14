'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form State
  const [newsletterName, setNewsletterName] = useState('');
  const [tagline, setTagline] = useState('');
  const [slug, setSlug] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUserId(session.user.id);
      }
    });
  }, [router]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedSlug = rawValue
      .toLowerCase()
      // อนุญาตให้พิมพ์ a-z, 0-9 และขีดกลาง (-) ได้ ตัวอื่นแปลงเป็นขีดกลางให้หมด
      .replace(/[^a-z0-9\-]+/g, '-') 
      // ป้องกันการพิมพ์ขีดกลางเบิ้ลติดกันหลายตัว (เช่น my---url จะถูกยุบเหลือ my-url)
      .replace(/-+/g, '-') 
      // ห้ามมีขีดกลางโผล่มาเป็นตัวแรกสุด (แต่ปล่อยให้พิมพ์ตัวท้ายสุดได้ จะได้ไม่ขัดใจตอนพิมพ์)
      .replace(/^-+/, ''); 

    setSlug(formattedSlug);
  };

  // -----------------------------------------
  // ฟังก์ชันใหม่: เพิ่มปุ่ม Sign Out เพื่อเคลียร์ Session ผี
  // -----------------------------------------
  async function handleSignOut() {
    await supabase.auth.signOut();
    // บังคับเปลี่ยนหน้าด้วย window.location เพื่อเคลียร์แคชให้สะอาดหมดจด
    window.location.href = '/login'; 
  }

  async function handleOnboardingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!userId) {
      setErrorMsg('User authentication error. Please try logging in again.');
      setLoading(false);
      return;
    }

    try {
      const { data: existingSlug } = await supabase
        .from('creators')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (existingSlug) {
        throw new Error('This URL slug is already taken. Please choose another one.');
      }

      const { error: insertError } = await supabase
        .from('creators')
        .insert({
          id: userId,
          slug: slug,
          newsletter_name: newsletterName,
          tagline: tagline,
          subscriber_count: 0, 
        });

      if (insertError) {
         if (insertError.code === '23505') {
            throw new Error('Profile already exists. Redirecting to dashboard...');
         }
         throw insertError;
      }

      router.push('/dashboard');

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile. Please try again.');
      if (err.message.includes('Profile already exists')) {
          setTimeout(() => router.push('/dashboard'), 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center font-mono text-sm">
        Verifying session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans relative">
      
      {/* เพิ่มปุ่ม Sign Out ตรงมุมขวาบนของจอ */}
      <button
        onClick={handleSignOut}
        className="absolute top-6 right-6 text-xs text-neutral-500 hover:text-red-400 font-mono transition-colors border border-transparent hover:border-red-900/50 bg-neutral-900/30 hover:bg-neutral-900/80 px-3 py-1.5 rounded-md"
      >
        Sign Out
      </button>

      <div className="w-full max-w-lg bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 space-y-8 mt-8 md:mt-0">
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome to SponsorFlow! 🎉
          </h1>
          <p className="text-sm text-neutral-400">
            Let's set up your creator profile. This information will be displayed on your public booking page.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-sm p-3 rounded font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleOnboardingSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Newsletter / Project Name <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-neutral-500 mb-2">The public name sponsors will see.</p>
            <input
              type="text"
              required
              placeholder="e.g. The Tech Horizon"
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Custom Booking URL <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-neutral-500 mb-2">This will be your unique link to share with sponsors.</p>
            <div className="flex items-center">
              <span className="bg-neutral-900 border border-r-0 border-neutral-800 rounded-l-md px-3 py-3 text-neutral-500 text-sm font-mono whitespace-nowrap">
                sponsorflow.com/
              </span>
              <input
                type="text"
                required
                placeholder="my-newsletter"
                value={slug}
                onChange={handleSlugChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-r-md p-3 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Tagline (Optional)
            </label>
            <p className="text-xs text-neutral-500 mb-2">A short description of your audience or content.</p>
            <input
              type="text"
              placeholder="e.g. A weekly deep dive into AI, SaaS, and the creator economy."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-white placeholder-neutral-700 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-md transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-emerald-900/20"
          >
            {loading ? 'Creating Profile...' : 'Complete Setup & Go to Dashboard →'}
          </button>
        </form>

      </div>
    </div>
  );
}