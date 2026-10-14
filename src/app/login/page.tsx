'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // เพิ่ม State สำหรับสลับโหมด Sign In / Sign Up

  // เช็คตอนเปิดหน้าเว็บ ถ้าล็อกอินอยู่แล้ว ให้ตรวจสอบว่ามี Profile ไหม
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        checkProfileAndRedirect(session.user.id);
      }
    });
  }, [router]);

  // ฟังก์ชันแยกทาง: ไป Dashboard หรือ Onboarding?
  async function checkProfileAndRedirect(userId: string) {
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('id', userId)
      .single();

    if (creator) {
      router.replace('/dashboard'); // มีข้อมูลแล้ว ไปจัดการสล็อตได้เลย
    } else {
      router.replace('/onboarding'); // ยังไม่มีข้อมูล ไปตั้งชื่อ Slug ก่อน
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let authResult;
      
      if (isSignUp) {
        // สมัครสมาชิกใหม่
        authResult = await supabase.auth.signUp({ email, password });
      } else {
        // ล็อกอินปกติ
        authResult = await supabase.auth.signInWithPassword({ email, password });
      }

      if (authResult.error) throw authResult.error;

      // ถ้าสำเร็จ ให้เช็คโปรไฟล์ต่อ
      if (authResult.data.user) {
        await checkProfileAndRedirect(authResult.data.user.id);
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 space-y-6">
        
        <div className="space-y-1 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            SponsorFlow
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create an Account' : 'Creator Sign In'}
          </h1>
          <p className="text-xs text-neutral-400">
            {isSignUp 
              ? 'Start monetizing your newsletter today.' 
              : 'Enter your credentials to manage your newsletter slots.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-neutral-400 mb-1 font-mono">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@newsletter.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1 font-mono">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-2.5 rounded-md transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up →' : 'Sign In →')}
          </button>
        </form>

        {/* ปุ่มสลับโหมด */}
        <div className="text-center mt-4">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}