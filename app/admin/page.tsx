'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface DataRow {
  id: number;
  tanggal: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
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

  // --- STATE FORM 1: CRUD KALENDER ---
  const [slotTanggal, setSlotTanggal] = useState<string>('');
  const [slotJamMulai, setSlotJamMulai] = useState<string>('');
  const [slotJamSelesai, setSlotJamSelesai] = useState<string>('');
  const [slotJudulLatihan, setSlotJudulLatihan] = useState<string>('');

  // --- STATE FORM 2: CRUD GUDANG MATERI LAGU ---
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
      .order('id', { ascending: false });

    if (!error && data) {
      setAllData(data as DataRow[]);
    }
  };

  useEffect(() => {
    ambilDataSupabase();
  }, []);

  // --- FORM 1: AKSI SIMPAN SLOT KALENDER ---
  const handleTambahSlotJadwal = async (e: FormEvent) => {
    e.preventDefault();
    if (!slotTanggal || !slotJamMulai || !slotJamSelesai || !slotJudulLatihan.trim()) {
      alert('Semua data slot kalender wajib diisi! 🌸');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('jadwal').insert([
      {
        tanggal: slotTanggal,
        jam_mulai: slotJamMulai,
        jam_selesai: slotJamSelesai,
        keterangan_partitur: slotJudulLatihan,
        status: 'tersedia', 
      },
    ]);

    setLoading(false);
    if (error) {
      alert(`Gagal membuat slot kalender: ${error.message}`);
    } else {
      alert(`Berhasil membuka slot latihan "${slotJudulLatihan}"! 📅`);
      setSlotTanggal('');
      setSlotJamMulai('');
      setSlotJamSelesai('');
      setSlotJudulLatihan('');
      ambilDataSupabase();
    }
  };

  // --- FORM 2: SELEKSI EDIT LAGU GUDANG ---
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

  // --- FORM 2: AKSI SIMPAN MATERI LAGU (GUDANG) ---
  const handleSimpanMateriGudang = async (e: FormEvent) => {
    e.preventDefault();
    if (!gudangJudulLagu.trim()) {
      alert('Judul lagu wajib diisi! 🌸');
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
        status: 'materi_lagu', // Penanda mutlak materi lagu bebas tanggal
      };

      if (pdfUrl) {
        dataPayload.file_pdf_url = pdfUrl;
      }

      if (modeMateri === 'tambah') {
        const { error } = await supabase.from('jadwal').insert([dataPayload]);
        if (error) throw error;
        alert(`Lagu "${gudangJudulLagu}" sukses masuk ke Gudang Partitur! 🎼`);
      } else {
        const { error } = await supabase
          .from('jadwal')
          .update(dataPayload)
          .eq('id', Number(selectedLaguId));
        if (error) throw error;
        alert(`Pembaruan lagu "${gudangJudulLagu}" berhasil! 🎀`);
      }

      resetFormMateri();
      ambilDataSupabase();
    } catch (err: any) {
      alert(err.message || 'Terjadi error.');
    } finally {
      setLoading(false);
    }
  };

  // --- AKSI GLOBAL: HAPUS DATA (DELETE) ---
  const handleHapusData = async (id: number, judul: string) => {
    if (confirm(`Apakah kamu yakin ingin menghapus "${judul}" secara permanen?`)) {
      const { error } = await supabase.from('jadwal').delete().eq('id', id);
      if (!error) {
        alert('Data berhasil dihapus! ✨');
        if (Number(selectedLaguId) === id) resetFormMateri();
        ambilDataSupabase();
      } else {
        alert('Gagal menghapus data.');
      }
    }
  };

  // Membagi data untuk monitoring list kiri & kanan
  const daftarSlotKalender = allData.filter(d => d.status !== 'materi_lagu');
  const daftarMateriLaguGudang = allData.filter(d => d.status === 'materi_lagu');

  return (
    <div className="min-h-screen bg-pink-50 text-pink-900 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Branding */}
        <div className="flex justify-center border-b-2 border-pink-200 pb-4">
          <img src="/3.png" alt="Ziza Sched" className="h-20 object-contain" />
        </div>

        {/* ================= PANEL MENU 1: CRUD AGENDA KALENDER ================= */}
        <div className="bg-white p-6 rounded-3xl border-2 border-pink-200 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-base font-extrabold text-pink-700 mb-3 flex items-center gap-1">📅 1. Buka Slot Kalender</h2>
            <form onSubmit={handleTambahSlotJadwal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-pink-600 mb-0.5">Nama Agenda / Materi Latihan</label>
                <input type="text" required value={slotJudulLatihan} onChange={(e) => setSlotJudulLatihan(e.target.value)} placeholder="Misal: Latihan Evaluasi Rutin" className="w-full p-2 text-sm bg-pink-50/60 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500 font-medium"/>
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
                {loading ? 'Menyimpan...' : 'Rilis Slot Kalender 🚀'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-pink-100 lg:pl-6">
            <h2 className="text-sm font-bold mb-3 text-pink-700">📋 Daftar Monitoring & Hapus Kalender</h2>
            <div className="space-y-2 max-h-[190px] overflow-y-auto text-xs pr-1">
              {daftarSlotKalender.length === 0 ? <p className="text-slate-400 italic">Belum ada slot kalender.</p> : 
                daftarSlotKalender.map(s => (
                  <div key={s.id} className="p-2.5 rounded-xl border border-pink-100 bg-slate-50 flex justify-between items-center hover:bg-pink-50/20 transition">
                    <div className="space-y-0.5">
                      <p className="font-bold text-pink-700">📅 {s.tanggal} ({s.jam_mulai} - {s.jam_selesai})</p>
                      <p className="font-medium text-slate-800">Judul: {s.keterangan_partitur} <span className="text-[10px] px-1.5 py-0.2 bg-pink-100 rounded text-pink-800 font-bold ml-1">{s.status === 'terisi' ? `Booked: ${s.nama_pendaftar}` : 'Kosong'}</span></p>
                    </div>
                    <button onClick={() => handleHapusData(s.id, s.keterangan_partitur || 'Slot')} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 font-bold text-[11px] transition">Hapus</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ================= PANEL MENU 2: CRUD GUDANG PARTITUR & AUDIO ================= */}
        <div className="bg-white p-6 rounded-3xl border-2 border-pink-200 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-base font-extrabold text-pink-700 mb-2 flex items-center gap-1">🎼 2. Kelola Gudang Partitur</h2>
            <div className="flex gap-2 mb-3 text-[11px] font-bold justify-center">
              <button onClick={() => { setModeMateri('tambah'); resetFormMateri(); }} className={`px-4 py-1 rounded-md transition ${modeMateri === 'tambah' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}>+ Tambah</button>
              <button onClick={() => { setModeMateri('edit'); resetFormMateri(); }} className={`px-4 py-1 rounded-md transition ${modeMateri === 'edit' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}>✏️ Edit</button>
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
                <input type="text" value={gudangJudulLagu} onChange={(e) => setGudangJudulLagu(e.target.value)} placeholder="Ketik judul lagu..." className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs font-medium"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Nada Dasar</label>
                <input type="text" value={gudangNadaDasar} onChange={(e) => setGudangNadaDasar(e.target.value)} placeholder="Misal: Do = G" className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Upload File Partitur (PDF)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setGudangPdfFile(e.target.files?.[0] || null)} className="w-full text-xs cursor-pointer file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-700 font-medium"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Link Audio Sopran 1</label>
                <input type="url" value={gudangLinkSopran1} onChange={(e) => setGudangLinkSopran1(e.target.value)} placeholder="Tempel link vokal S1..." className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs"/>
              </div>
              <div>
                <label className="block font-semibold text-pink-600 mb-0.5">Link Audio Sopran 2</label>
                <input type="url" value={gudangLinkSopran2} onChange={(e) => setGudangLinkSopran2(e.target.value)} placeholder="Tempel link vokal S2..." className="w-full p-2 bg-pink-50 border border-pink-200 rounded-lg text-xs"/>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg shadow transition">
                {loading ? 'Menyimpan...' : modeMateri === 'tambah' ? 'Simpan ke Gudang Musik 🚀' : 'Simpan Edit Musik 🎀'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-pink-100 lg:pl-6">
            <h2 className="text-sm font-bold mb-3 text-pink-700">🎼 Daftar Monitoring & Hapus Gudang Musik</h2>
            <div className="space-y-2 max-h-[310px] overflow-y-auto text-xs pr-1">
              {daftarMateriLaguGudang.length === 0 ? <p className="text-slate-400 italic">Belum ada konten lagu gudang.</p> : 
                daftarMateriLaguGudang.map(l => (
                  <div key={l.id} className="p-3 rounded-xl border border-pink-100 bg-pink-50/20 flex justify-between items-center hover:bg-pink-50/50 transition">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">🎼 {l.keterangan_partitur}</h4>
                      <div className="flex gap-2 mt-1 text-[10px] font-semibold text-pink-700">
                        {l.nada_dasar && <span>📍 {l.nada_dasar}</span>}
                        {l.file_pdf_url && <span className="text-emerald-700">📄 PDF Active</span>}
                        {l.link_sopran1 && <span className="text-indigo-700">🎵 S1 Active</span>}
                        {l.link_sopran2 && <span className="text-purple-700">🎵 S2 Active</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/partitur/${l.id}`)} className="px-2 py-1 bg-pink-100 text-pink-700 font-bold border border-pink-200 rounded hover:bg-pink-200 transition text-[10px]">Preview</button>
                      <button onClick={() => handleHapusData(l.id, l.keterangan_partitur || 'Lagu')} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 font-bold text-[10px] transition">Hapus</button>
                    </div>
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