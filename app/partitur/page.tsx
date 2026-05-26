'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface Lagu {
  id: number;
  keterangan_partitur: string | null;
  nada_dasar: string | null;
  file_pdf_url: string | null;
  link_sopran1: string | null;
  link_sopran2: string | null;
}

export default function DaftarPartitur() {
  const router = useRouter();
  const [materiLatihan, setMateriLatihan] = useState<Lagu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ambilMateri = async () => {
      // Mengambil khusus data lagu yang diinput dari admin lewat penanda status 'materi_lagu'
      const { data, error } = await supabase
        .from('jadwal')
        .select('*')
        .eq('status', 'materi_lagu')
        .order('id', { ascending: false });

      if (!error && data) {
        setMateriLatihan(data as Lagu[]);
      }
      setLoading(false);
    };
    ambilMateri();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 text-pink-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="mb-6 text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 transition"
        >
          ← Kembali ke Menu Utama
        </button>

        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <img src="/2.png" alt="Sopran" className="h-16 object-contain" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-pink-700">Gudang Partitur & Panduan Suara 🎼</h1>
          <p className="text-xs md:text-sm text-pink-600 bg-white/60 px-4 py-1 rounded-full border border-pink-200">
            Akses lembar partitur PDF dan dengarkan rekaman panduan vokal Sopran 1 & 2
          </p>
        </div>

        {loading ? (
          <div className="text-center p-12 text-pink-600 font-medium animate-pulse">Memuat daftar lagu... 🎶</div>
        ) : materiLatihan.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 text-center text-slate-400 border border-dashed border-pink-200 shadow-sm">
            Belum ada materi lagu yang di-upload oleh Kak Ziza. 🌸
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materiLatihan.map((m) => (
              <div 
                key={m.id} 
                className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-pink-200 shadow-md flex flex-col justify-between group hover:shadow-xl hover:border-pink-300 transition-all duration-300"
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-pink-600 transition">
                    🎼 {m.keterangan_partitur}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs font-semibold">
                    {m.nada_dasar && <span className="bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full">📍 {m.nada_dasar}</span>}
                    {m.file_pdf_url && <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">📄 PDF Ready</span>}
                    {(m.link_sopran1 || m.link_sopran2) && <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">🎧 Audio Guide</span>}
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/partitur/${m.id}`)}
                  className="w-full mt-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-98"
                >
                  Buka Ruang Latihan 🚀
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}