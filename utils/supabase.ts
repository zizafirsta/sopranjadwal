import { createClient } from '@supabase/supabase-js';

// Ambil variabel environment, jika tidak ada berikan string kosong agar build Next.js tidak crash
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Inisialisasi client Supabase dengan aman
export const supabase = createClient(supabaseUrl, supabaseAnonKey);