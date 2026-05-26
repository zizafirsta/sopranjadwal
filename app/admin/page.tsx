'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface DataRow {
  id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  nama_pendaftar: string | null;
  keterangan_partitur: string | null;
  nada_dasar?: string | null;
  file_pdf_url?: string | null;
  link_sopran1?: string | null;
  link_sopran2?: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [allData, setAllData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // --- STATE UNTUK FORM 1: BUAT SLOT JADWAL BARU DI KALENDER ---
  const [slotTanggal, setSlotTanggal] = useState<string>('');
  const [slotJamMulai, setSlotJamMulai] = useState<string>('');
  const [slotJamSelesai, setSlotJamSelesai] = useState<string>('');
  const [slotJudulLatihan, setSlotJudulLatihan] = useState<string>(''); // Sekarang pakai teks ketik sendiri

  // --- STATE UNTUK FORM 2: MANAJEMEN GUDANG MATERI LAGU ---
  const [modeMateri, setModeMateri] = useState<'tambah' | 'edit'>('tambah');
  const [selectedLaguId, setSelectedLaguId] = useState<string>('');
  const [gudangJudulLagu, setGudangJudulLagu] = useState<string>('');
  const [gudangNadaDasar, setGudangNadaDasar] = useState<string>('');
  const [gudangPdfFile, setGudangPdfFile] = useState<File | null>(null);
  const [gudangLinkSopran1, setGudangLinkSopran1] = useState<string>('');
  const [gudangLinkSopran2, setGudangLinkSopran2] = useState<string>('');

  const ambilDataSupabase = async () => {
    const { data, error } = await supabase
      .from('jadwal')
      .select('*')
      .order('tanggal', { ascending: false });

    if (!error && data) {
      setAllData(data as DataRow[]);
    }
  };

  useEffect(() => {
    ambilDataSupabase();
  }, []);

  // --- AKSI FORM 1: SIMPAN SLOT JADWAL BARU ---
  const handleTambahSlotJadwal = async (e: FormEvent) => {
    e.preventDefault();
    if (!slotTanggal || !slotJamMulai || !slotJamSelesai || !slotJudulLatihan.trim()) {
      alert('Semua data slot jadwal (termasuk judul latihan) wajib diisi ya! 🌸');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('jadwal').insert([
      {
        tanggal: slotTanggal,
        jam_mulai: slotJamMulai,
        jam_selesai: slotJamSelesai,
        keterangan_partitur: slotJudulLatihan, // Hasil ketik sendiri dimasukkan ke sini
        status: 'tersedia', // Slot kosong yang bisa diambil anak-anak
      },
    ]);

    setLoading(false);
    if (error) {
      alert(`Gagal membuat slot latihan: ${error.message}`);
    } else {
      alert(`Berhasil membuka slot jadwal latihan "${slotJudulLatihan}" di kalender! 📅`);
      setSlotTanggal('');
      setSlotJamMulai('');
      setSlotJamSelesai('');
      setSlotJudulLatihan('');
      ambilDataSupabase();
    }
  };

  // --- AKSI FORM 2: LOGIKA SELEKSI EDIT LAGU GUDANG ---
  const handleLaguGudangChange = (id: string) => {
    setSelectedLaguId(id);
    if (!id) {
      resetFormMateri();
      return;
    }
    const lagu = allData.find((l) => l.id === Number(id));
    if (lagu) {
      setGudangJudulLagu(lagu.keterangan_partitur || '');
      setGudangNadaDasar(lagu.nada_dasar || '');
      setGudangLinkSopran1(lagu.link_sopran1 || '');
      setGudangLinkSopran2(lagu.link_sopran2 || '');
    }
  };

  const resetFormMateri = () => {
    setGudangJudulLagu('');
    setGudangNadaDasar('');
    setGudangLinkSopran1('');
    setGudangLinkSopran2('');
    setGudangPdfFile(null);
    setSelectedLaguId('');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => { (input as HTMLInputElement).value = ''; });
  };

  // --- AKSI FORM 2: SIMPAN MATERI LAGU KE GUDANG ---
  const handleSimpanMateriGudang = async (e: FormEvent) => {
    e.preventDefault();
    if (!gudangJudulLagu.trim()) {
      alert('Judul lagu untuk gudang wajib diisi! 🌸');
      return;
    }

    setLoading(true);
    let pdfUrl = null;

    try {
      if (gudangPdfFile) {
        const fileExt = gudangPdfFile.name.split('.').pop();
        const fileName = `pdf_${Date.now()}.${fileExt}`;
        const { data: dataPdf, error: errPdf } = await supabase.storage
          .from('partitur-files')
          .upload(fileName, gudangPdfFile);
        
        if (errPdf) throw new Error(`Gagal upload PDF: ${errPdf.message}`);
        
        if (dataPdf) {
          const { data } = supabase.storage.from('partitur-files').getPublicUrl(fileName);
          pdfUrl = data.publicUrl;
        }
      }

      const dataPayload: any = {
        keterangan_partitur: gudangJudulLagu,
        nada_dasar: gudangNadaDasar || null,
        link_sopran1: gudangLinkSopran1 || null,
        link_sopran2: gudangLinkSopran2 || null,
        status: 'materi_lagu', 
      };

      if (pdfUrl) {
        dataPayload.file_pdf_url = pdfUrl;
      }

      if (modeMateri === 'tambah') {
        const { error } = await supabase.from('jadwal').insert([dataPayload]);
        if (error) throw error;
        alert(`Lagu "${gudangJudulLagu}" sukses masuk ke bagian Partitur & Audio! 🎼`);
      } else {
        const { error } = await supabase
          .from('jadwal')
          .update(dataPayload)
          .eq('id', Number(selectedLaguId));
        if (error) throw error;
        alert(`Pembaruan data lagu "${gudangJudulLagu}" berhasil disimpan! 🎀`);
      }

      resetFormMateri();
      ambilDataSupabase();
    } catch (err: any) {
      alert(err.message || 'Terjadi error.');
    } finally {
      setLoading(false);
    }
  };

  // Filter khusus untuk list monitoring di sebelah kanan
  const daftarSlotKalender = allData.filter(d => d.status !== 'materi_lagu');
  const daftarMateriLaguGudang = allData.filter(d => d.status === 'materi_lagu');

  return (
    <div className="min-h-screen bg-pink-50 text-pink-900 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-center border-b-2 border-pink-200 pb-4">
          <img src="/3.png" alt="Ziza Sched" className="h-20 object-contain" />
        </div>

        {/* ================= BARIS 1: MEKANISME KALENDER LATIHAN ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORM BUAT SLOT BARU */}
          <div className="bg-white p-5 rounded-2xl border-2 border-pink-200 shadow-md">
            <h2 className="text-base font-bold mb-3 text-pink-700 flex items-center gap-1">📅 1. Buka Slot Kalender Baru</h2>
            <form onSubmit={handleTambahSlotJadwal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-pink-600 mb-0.5">Judul Agenda Latihan / Lagu</label>
                {/* DI SINI SUDAH DIUBAH JADI INPUT KETIK SENDIRI MAJU MENCARI BEBAS */}
                <input 
                  type="text"
                  required
                  value={slotJudulLatihan}
                  onChange={(e) => setSlotJudulLatihan(e.target.value)}
                  placeholder="Ketik nama latihan (Misal: Latihan Umum Gloria)"
                  className="w-full p-2 text-sm bg-pink-50/60 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-pink-600 mb-0.5">Tanggal</label>
                  <input type="date" required value={slotTanggal} onChange={(e) => setSlotTanggal(e.target.value)} className="w-full p-2 text-xs bg-pink-50/60 border border-pink-200 rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pink-600 mb-0.5">Jam Mulai</label>
                  <input type="time" required value={slotJamMulai} onChange={(e) => setSlotJamMulai(e.target.value)} className="w-full p-2 text-xs bg-pink-50/60 border border-pink-200 rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pink-600 mb-0.5">Jam Selesai</label>
                  <input type="time" required value={slotJamSelesai} onChange={(e) => setSlotJamSelesai(e.target.value)} className="w-full p-2 text-xs bg-pink-50/60 border border-pink-200 rounded-lg"/>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-lg shadow transition">
                {loading ? 'Menyimpan...' : 'Buka Slot Latihan di Kalender 🚀'}
              </button>
            </form>
          </div>

          {/* MONITORING KALENDER */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-pink-200 shadow-md">
            <h2 className="text-base font-bold mb-3 text-pink-700">📋 Agenda & Booking Kalender Aktif</h2>
            <div className="space-y-2 max-h-[220px] overflow-y-auto text-xs pr-1">
              {daftarSlotKalender.length === 0 ? <p className="text-slate-400 italic">Belum ada slot kalender.</p> : 
                daftarSlotKalender.map(s => (
                  <div key={s.id} className={`p-2.5 rounded-lg border flex justify-between items-center ${s.status === 'terisi' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                      <span className="font-bold text-pink-700 mr-2">📅 {s.tanggal} ({s.jam_mulai} - {s.jam_selesai})</span>
                      <span className="font-medium text-slate-800">Latihan: {s.keterangan_partitur}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${s.status === 'terisi' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {s.status === 'terisi' ? `Booking: ${s.nama_pendaftar}` : 'Kosong'}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ================= BARIS 2: MANAJEMEN GUDANG PARTITUR & AUDIO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t-2 border-dashed border-pink-200">
          {/* FORM INPUT GUDANG */}
          <div className="bg-white p-5 rounded-2xl border-2 border-pink-200 shadow-md">
            <h2 className="text-base font-bold mb-2 text-pink-700">🎼 2. Upload Konten Gudang Musik</h2>
            
            <div className="flex gap-2 mb-3 text-[11px] font-bold justify-center">
              <button onClick={() => { setModeMateri('tambah'); resetFormMateri(); }} className={`px-3 py-1 rounded-md ${modeMateri === 'tambah' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}>+ Tambah</button>
              <button onClick={() => { setModeMateri('edit'); resetFormMateri(); }} className={`px-3 py-1 rounded-md ${modeMateri === 'edit' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}>✏️ Edit</button>
            </div>

            <form onSubmit={handleSimpanMateriGudang} className="space-y-2.5 text-xs">
              {modeMateri === 'edit' && (
                <div>
                  <label className="block font-semibold text-pink-600 mb-0.5">Pilih Musik yang Mau Diedit</label>
                  <select value={selectedLaguId} onChange={(e) => handleLaguGudangChange(e.target.value)} className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs">
                    <option value="">-- Pilih Judul Musik --</option>
                    {daftarMateriLaguGudang.map(l => <option key={l.id} value={l.id}>{l.keterangan_partitur}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Nama/Judul Lagu</label>
                <input type="text" value={gudangJudulLagu} onChange={(e) => setGudangJudulLagu(e.target.value)} placeholder="Misal: Gloria In Excelsis Deo" className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs font-medium"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Nada Dasar</label>
                <input type="text" value={gudangNadaDasar} onChange={(e) => setGudangNadaDasar(e.target.value)} placeholder="Do = F" className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">File Berkas Partitur (PDF)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setGudangPdfFile(e.target.files?.[0] || null)} className="w-full text-xs cursor-pointer file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-700 font-medium"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Link Tautan Audio Sopran 1</label>
                <input type="url" value={gudangLinkSopran1} onChange={(e) => setGudangLinkSopran1(e.target.value)} placeholder="Link Drive audio S1..." className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Link Tautan Audio Sopran 2</label>
                <input type="url" value={gudangLinkSopran2} onChange={(e) => setGudangLinkSopran2(e.target.value)} placeholder="Link Drive audio S2..." className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs"/>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg shadow transition">
                {loading ? 'Menyimpan...' : modeMateri === 'tambah' ? 'Simpan ke Gudang Musik 🚀' : 'Simpan Edit Musik 🎀'}
              </button>
            </form>
          </div>

          {/* LIST MONITORING GUDANG MUSIK */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-pink-200 shadow-md">
            <h2 className="text-base font-bold mb-3 text-pink-700">🎼 Konten Gudang Musik Aktif (Halaman Partitur)</h2>
            <div className="space-y-2 max-h-[310px] overflow-y-auto text-xs pr-1">
              {daftarMateriLaguGudang.length === 0 ? <p className="text-slate-400 italic">Belum ada konten lagu gudang.</p> : 
                daftarMateriLaguGudang.map(l => (
                  <div key={l.id} className="p-3 rounded-lg border border-pink-100 bg-pink-50/20 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">🎼 {l.keterangan_partitur}</h4>
                      <div className="flex gap-2 mt-1 text-[10px] font-semibold text-pink-700">
                        {l.nada_dasar && <span>📍 {l.nada_dasar}</span>}
                        {l.file_pdf_url && <span className="text-emerald-700">📄 PDF Ready</span>}
                        {l.link_sopran1 && <span className="text-indigo-700">🎵 S1 Ready</span>}
                        {l.link_sopran2 && <span className="text-purple-700">🎵 S2 Ready</span>}
                      </div>
                    </div>
                    <button onClick={() => router.push(`/partitur/${l.id}`)} className="px-2 py-1 bg-pink-100 text-pink-700 font-bold border border-pink-200 rounded hover:bg-pink-200 transition text-[11px]">Preview 🚀</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}