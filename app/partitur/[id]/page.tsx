'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function DetailPartitur() {
  const { id } = useParams();
  const router = useRouter();
  const [jadwal, setJadwal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ambilDetail = async () => {
      const { data, error } = await supabase
        .from('jadwal')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setJadwal(data);
      }
      setLoading(false);
    };
    if (id) ambilDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-pink-600">Memuat materi latihan... 🎵</div>;
  if (!jadwal) return <div className="p-8 text-center text-red-500">Materi tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-pink-100">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => router.push('/')}
          className="mb-6 text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 transition"
        >
          ← Kembali ke Kalender
        </button>

        {/* Judul & Nada Dasar */}
        <h1 className="text-2xl md:text-3xl font-bold text-pink-700 mb-2">
          🎵 {jadwal.keterangan_partitur || 'Materi Latihan Sopran'}
        </h1>
        
        <div className="inline-block bg-pink-100 text-pink-800 font-medium text-sm px-4 py-1.5 rounded-full mb-6 border border-pink-200">
          📍 Nada Dasar: <span className="font-bold">{jadwal.nada_dasar || 'Belum diatur oleh admin'}</span>
        </div>

        {/* BAGIAN AUDIO MP3 */}
        {jadwal.file_mp3_url ? (
          <div className="mb-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-md">
            <h3 className="font-semibold text-lg mb-2">🎧 Panduan Suara Sopran</h3>
            <p className="text-xs text-pink-100 mb-4">Ketuk untuk mendengarkan panduan vokal:</p>
            <audio controls className="w-full h-10 rounded-lg outline-none bg-white/20">
              <source src={jadwal.file_mp3_url} type="audio/mpeg" />
              Browser kamu tidak mendukung pemutar audio ini.
            </audio>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-slate-100 text-slate-500 text-sm text-center rounded-xl border border-dashed">
            🔒 Audio latihan belum diupload oleh Admin.
          </div>
        )}

        {/* BAGIAN VIEW PDF PARTITUR */}
        <h3 className="font-bold text-lg text-pink-800 mb-3 flex items-center gap-2">
          📄 Lembar Partitur Lagu
        </h3>
        {jadwal.file_pdf_url ? (
          <div className="w-full aspect-[4/5] md:aspect-[3/4] border-2 border-pink-200 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
            <iframe 
              src={`${jadwal.file_pdf_url}#toolbar=0`} 
              className="w-full h-full"
              title="Partitur PDF"
            />
          </div>
        ) : (
          <div className="p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-center text-sm">
            Partitur PDF belum diupload untuk jadwal ini.
          </div>
        )}

      </div>
    </div>
  );
}