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

  if (loading) return <div className="p-8 text-center text-pink-600 font-medium">Memuat materi latihan... 🎵</div>;
  if (!jadwal) return <div className="p-8 text-center text-red-500 font-medium">Materi tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-pink-100">
        
        {/* Tombol Kembali ke Daftar Partitur */}
        <button 
          onClick={() => router.push('/partitur')}
          className="mb-6 text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 transition"
        >
          ← Kembali ke Gudang Partitur
        </button>

        {/* Judul & Nada Dasar */}
        <h1 className="text-2xl md:text-3xl font-bold text-pink-700 mb-2">
          🎵 {jadwal.keterangan_partitur || 'Materi Latihan Sopran'}
        </h1>
        
        <div className="inline-block bg-pink-100 text-pink-800 font-medium text-sm px-4 py-1.5 rounded-full mb-6 border border-pink-200">
          📍 Nada Dasar: <span className="font-bold">{jadwal.nada_dasar || 'Belum diatur oleh Kak Ziza'}</span>
        </div>

        {/* SEKSI TOMBOL LINK AUDIO SOPRAN 1 & SOPRAN 2 */}
        <div className="mb-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-5 md:p-6 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-1.5">🎧 Audio Panduan Vokal</h3>
          <p className="text-xs text-pink-100 mb-4">Pilih jenis suara kamu untuk mulai mendengarkan panduan latihan:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tombol Tautan Sopran 1 */}
            {jadwal.link_sopran1 ? (
              <a 
                href={jadwal.link_sopran1} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition text-center shadow-inner group cursor-pointer"
              >
                <span className="font-bold text-base">🎶 Sopran 1</span>
                <span className="text-[11px] text-pink-100 mt-1 group-hover:scale-105 transition duration-200">👉 Ketuk untuk mendengarkan</span>
              </a>
            ) : (
              <div className="p-4 bg-black/10 border border-white/5 text-pink-200 text-xs text-center rounded-xl flex items-center justify-center italic">
                Link Sopran 1 belum diisi oleh Kak Ziza
              </div>
            )}

            {/* Tombol Tautan Sopran 2 */}
            {jadwal.link_sopran2 ? (
              <a 
                href={jadwal.link_sopran2} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition text-center shadow-inner group cursor-pointer"
              >
                <span className="font-bold text-base">🎶 Sopran 2</span>
                <span className="text-[11px] text-pink-100 mt-1 group-hover:scale-105 transition duration-200">👉 Ketuk untuk mendengarkan</span>
              </a>
            ) : (
              <div className="p-4 bg-black/10 border border-white/5 text-pink-200 text-xs text-center rounded-xl flex items-center justify-center italic">
                Link Sopran 2 belum diisi oleh Kak Ziza
              </div>
            )}
          </div>
        </div>

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
            Partitur PDF belum diupload untuk jadwal materi ini.
          </div>
        )}

      </div>
    </div>
  );
}