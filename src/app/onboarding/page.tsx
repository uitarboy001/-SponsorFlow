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

  // 1. ตรวจสอบว่าล็อกอินอยู่ไหม
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login'); // ถ้ายังไม่ล็อกอิน ให้กลับไปหน้าล็อกอิน
      } else {
        setUserId(session.user.id);
      }
    });
  }, [router]);

  // ฟังก์ชันแปลงข้อความธรรมดาให้กลายเป็น Slug แบบอัตโนมัติ (เผื่อผู้ใช้ขี้เกียจพิมพ์)
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // กรองเอาเฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และขีดกลาง
    const formattedSlug = rawValue
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, ''); 
    setSlug(formattedSlug);
  };

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
      // 2. เช็คก่อนว่า Slug นี้มีคนอื่นใช้หรือยัง (เพราะ URL ห้ามซ้ำกัน)
      const { data: existingSlug } = await supabase
        .from('creators')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (existingSlug) {
        throw new Error('This URL slug is already taken. Please choose another one.');
      }

      // 3. บันทึกข้อมูลลงตาราง creators
      const { error: insertError } = await supabase
        .from('creators')
        .insert({
          id: userId, // สำคัญมาก! ผูกข้อมูลนี้กับ ID ของบัญชีที่เพิ่งสมัคร
          slug: slug,
          newsletter_name: newsletterName,
          tagline: tagline,
          subscriber_count: 0, // ค่าเริ่มต้น
        });

      if (insertError) {
         // จับ Error กรณีเผลอกดซ้ำหรือมีปัญหาเรื่องสิทธิ์
         if (insertError.code === '23505') {
            throw new Error('Profile already exists. Redirecting to dashboard...');
         }
         throw insertError;
      }

      // 4. บันทึกเสร็จ ไปหน้า Dashboard ได้เลย
      router.push('/dashboard');

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile. Please try again.');
      // ถ้า Profile มีอยู่แล้วจริงๆ ให้พากลับ Dashboard
      if (err.message.includes('Profile already exists')) {
          setTimeout(() => router.push('/dashboard'), 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  // หน้าจอ Loading รอตรวจสอบ Auth
  if (!userId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center font-mono text-sm">
        Verifying session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 space-y-8">
        
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
          
          {/* Newsletter Name */}
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

          {/* URL Slug */}
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

          {/* Tagline */}
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