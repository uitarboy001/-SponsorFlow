import { createClient } from '@supabase/supabase-js';

// บังคับให้ใช้ตัวแปรจาก Environment เท่านั้น
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);