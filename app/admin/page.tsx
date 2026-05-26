'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface Lagu {
  id: number;
  keterangan_partitur: string | null;
  nada_dasar: string | null;
  file_pdf_url: string | null;
  link_sopran1: string | null;
  link_sopran2: string | null;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [daftarLagu, setDaftarLagu] = useState<Lagu[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // State Form
  const [mode, setMode] = useState<'tambah' | 'edit'>('tambah');
  const [selectedLaguId, setSelectedLaguId] = useState<string>('');
  const [judulLagu, setJudulLagu] = useState<string>('');
  const [nadaDasar, setNadaDasar] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [linkSopran1, setLinkSopran1] = useState<string>('');
  const [linkSopran2, setLinkSopran2] = useState<string>('');

  const ambilSemuaLagu = async () => {
    // Mengambil data khusus tipe materi lagu (kita tandai dengan status 'materi_lagu' atau filter dari keterangan_partitur)
    const { data, error } = await supabase
      .from('jadwal')
      .select('*')
      .eq('status', 'materi_lagu')
      .order('id', { ascending: false });

    if (!error && data) {
      setDaftarLagu(data as Lagu[]);
    }
  };

  useEffect(() => {
    ambilSemuaLagu();
  }, []);

  const handleLaguChange = (id: string) => {
    setSelectedLaguId(id);
    if (!id) {
      resetForm();
      return;
    }
    const lagu = daftarLagu.find((l) => l.id === Number(id));
    if (lagu) {
      setJudulLagu(lagu.keterangan_partitur || '');
      setNadaDasar(lagu.nada_dasar || '');
      setLinkSopran1(lagu.link_sopran1 || '');
      setLinkSopran2(lagu.link_sopran2 || '');
    }
  };

  const resetForm = () => {
    setJudulLagu('');
    setNadaDasar('');
    setLinkSopran1('');
    setLinkSopran2('');
    setPdfFile(null);
    setSelectedLaguId('');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => { (input as HTMLInputElement).value = ''; });
  };

  const handleSimpanLagu = async (e: FormEvent) => {
    e.preventDefault();
    if (!judulLagu.trim()) {
      alert('Judul lagu wajib diisi yaa! 🌸');
      return;
    }

    setLoading(true);
    let pdfUrl = null;

    try {
      // 1. Upload PDF ke Storage jika ada
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `pdf_${Date.now()}.${fileExt}`;
        const { data: dataPdf, error: errPdf } = await supabase.storage
          .from('partitur-files')
          .upload(fileName, pdfFile);
        
        if (errPdf) throw new Error(`Gagal upload PDF: ${errPdf.message}`);
        
        if (dataPdf) {
          const { data } = supabase.storage.from('partitur-files').getPublicUrl(fileName);
          pdfUrl = data.publicUrl;
        }
      }

      // 2. Siapkan Payload Data
      const dataLagu: any = {
        keterangan_partitur: judulLagu,
        nada_dasar: nadaDasar || null,
        link_sopran1: linkSopran1 || null,
        link_sopran2: linkSopran2 || null,
        status: 'materi_lagu', // Penanda bahwa ini murni data lagu gudang, bukan kalender booking
      };

      if (pdfUrl) {
        dataLagu.file_pdf_url = pdfUrl;
      }

      // 3. Eksekusi Tambah Baru atau Update Edit
      if (mode === 'tambah') {
        const { error } = await supabase.from('jadwal').insert([dataLagu]);
        if (error) throw error;
        alert(`Hore! Lagu "${judulLagu}" berhasil ditambahkan ke gudang partitur! 🌸`);
      } else {
        const { error } = await supabase
          .from('jadwal')
          .update(dataLagu)
          .eq('id', Number(selectedLaguId));
        if (error) throw error;
        alert(`Lagu "${judulLagu}" berhasil diperbarui! 🎀`);
      }

      resetForm();
      ambilSemuaLagu();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-pink-900 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-8 border-b-2 border-pink-200 pb-4">
          <img src="/3.png" alt="Ziza Sched" className="h-20 object-contain" />
        </div>

        {/* Mode Navigasi Admin */}
        <div className="flex gap-4 mb-6 justify-center">
          <button 
            onClick={() => { setMode('tambah'); resetForm(); }}
            className={`px-6 py-2 rounded-xl font-bold transition shadow-sm ${mode === 'tambah' ? 'bg-pink-500 text-white' : 'bg-white text-pink-600 border border-pink-200'}`}
          >
            ➕ Tambah Lagu Baru
          </button>
          <button 
            onClick={() => { setMode('edit'); resetForm(); }}
            className={`px-6 py-2 rounded-xl font-bold transition shadow-sm ${mode === 'edit' ? 'bg-pink-500 text-white' : 'bg-white text-pink-600 border border-pink-200'}`}
          >
            ✏️ Edit Lagu yang Ada
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM INPUT UTAMA */}
          <div className="bg-white p-6 rounded-2xl border-2 border-pink-200 shadow-lg h-fit">
            <h2 className="text-lg font-bold mb-4 text-pink-700">
              {mode === 'tambah' ? '✨ Input Musik & Audio Baru' : '📝 Perbarui Data Musik'}
            </h2>
            
            <form onSubmit={handleSimpanLagu} className="space-y-4">
              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Pilih Lagu yang Mau Diedit</label>
                  <select
                    value={selectedLaguId}
                    onChange={(e) => handleLaguChange(e.target.value)}
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg"
                  >
                    <option value="">-- Pilih Judul Lagu --</option>
                    {daftarLagu.map((l) => (
                      <option key={l.id} value={l.id}>{l.keterangan_partitur}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">Judul Lagu</label>
                <input 
                  type="text" 
                  value={judulLagu}
                  onChange={(e) => setJudulLagu(e.target.value)}
                  placeholder="Ketik nama lagu di sini..."
                  className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">Nada Dasar</label>
                <input 
                  type="text" 
                  value={nadaDasar} 
                  onChange={(e) => setNadaDasar(e.target.value)} 
                  placeholder="Misal: Do = D" 
                  className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">File Partitur (PDF)</label>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">Link Panduan Sopran 1</label>
                <input 
                  type="url" 
                  value={linkSopran1} 
                  onChange={(e) => setLinkSopran1(e.target.value)} 
                  placeholder="Link audio Sopran 1..." 
                  className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">Link Panduan Sopran 2</label>
                <input 
                  type="url" 
                  value={linkSopran2} 
                  onChange={(e) => setLinkSopran2(e.target.value)} 
                  placeholder="Link audio Sopran 2..." 
                  className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg shadow-md transition disabled:bg-gray-300"
              >
                {loading ? 'Menyimpan...' : mode === 'tambah' ? 'Simpan Musik Baru 🚀' : 'Simpan Pembaruan 🎀'}
              </button>
            </form>
          </div>

          {/* SISI KANAN: GUDANG MONITORING LAGU AKTIF */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-pink-200 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-pink-700">🎼 List Lagu Aktif di Gudang Partitur</h2>
            {daftarLagu.length === 0 ? (
              <p className="text-slate-400 italic">Belum ada lagu yang diinput.</p>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {daftarLagu.map((l) => (
                  <div key={l.id} className="p-4 rounded-xl border border-pink-100 bg-pink-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">🎼 {l.keterangan_partitur}</h3>
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold">
                        {l.nada_dasar && <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded">📍 {l.nada_dasar}</span>}
                        {l.file_pdf_url && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">📄 PDF Ready</span>}
                        {l.link_sopran1 && <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">🎵 S1 Ready</span>}
                        {l.link_sopran2 && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">🎵 S2 Ready</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/partitur/${l.id}`)}
                      className="text-xs px-3 py-1.5 bg-pink-100 text-pink-700 font-bold rounded-lg border border-pink-200 hover:bg-pink-200 transition"
                    >
                      Buka Ruang Latihan 🚀
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}