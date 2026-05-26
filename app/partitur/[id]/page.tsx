'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function DetailPartitur() {
  const { id } = useParams();
  const router = useRouter();
  const [lagu, setLagu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ambilDetail = async () => {
      const { data, error } = await supabase
        .from('jadwal')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setLagu(data);
      }
      setLoading(false);
    };
    if (id) ambilDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-pink-600 font-medium animate-pulse">Memuat materi latihan... 🎵</div>;
  if (!lagu) return <div className="p-8 text-center text-red-500 font-medium">Materi tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-pink-100">
        
        <button 
          onClick={() => router.push('/partitur')}
          className="mb-6 text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 transition"
        >
          ← Kembali ke Gudang Partitur
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-pink-700 mb-2">
          🎵 {lagu.keterangan_partitur}
        </h1>
        
        <div className="inline-block bg-pink-100 text-pink-800 font-medium text-sm px-4 py-1.5 rounded-full mb-6 border border-pink-200">
          📍 Nada Dasar: <span className="font-bold">{lagu.nada_dasar || 'Belum diatur'}</span>
        </div>

        <div className="mb-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-5 md:p-6 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-1.5">🎧 Audio Panduan Vokal</h3>
          <p className="text-xs text-pink-100 mb-4">Silakan pilih jenis suara kamu untuk mulai mendengarkan vokal guide:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lagu.link_sopran1 ? (
              <a href={lagu.link_sopran1} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition text-center shadow-inner group">
                <span className="font-bold text-base">🎶 Sopran 1</span>
                <span className="text-[11px] text-pink-100 mt-1 group-hover:scale-105 transition">👉 Ketuk untuk mendengarkan</span>
              </a>
            ) : (
              <div className="p-4 bg-black/10 text-pink-200 text-xs text-center rounded-xl italic flex items-center justify-center">Link Sopran 1 belum diisi</div>
            )}

            {lagu.link_sopran2 ? (
              <a href={lagu.link_sopran2} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition text-center shadow-inner group">
                <span className="font-bold text-base">🎶 Sopran 2</span>
                <span className="text-[11px] text-pink-100 mt-1 group-hover:scale-105 transition">👉 Ketuk untuk mendengarkan</span>
              </a>
            ) : (
              <div className="p-4 bg-black/10 text-pink-200 text-xs text-center rounded-xl italic flex items-center justify-center">Link Sopran 2 belum diisi</div>
            )}
          </div>
        </div>

        <h3 className="font-bold text-lg text-pink-800 mb-3 flex items-center gap-2">📄 Lembar Partitur Lagu</h3>
        {lagu.file_pdf_url ? (
          <div className="w-full aspect-[4/5] md:aspect-[3/4] border-2 border-pink-200 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
            <iframe src={`${lagu.file_pdf_url}#toolbar=0`} className="w-full h-full" title="Partitur PDF" />
          </div>
        ) : (
          <div className="p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-center text-sm">
            Partitur PDF belum diupload untuk lagu ini.
          </div>
        )}
      </div>
    </div>
  );
}