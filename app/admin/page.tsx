'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface Jadwal {
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
  
  // State untuk daftar lagu/jadwal yang ditarik dari database
  const [daftarJadwal, setDaftarJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // State Utama: ID Lagu/Jadwal yang dipilih untuk di-update materi lagunya
  const [selectedJadwalId, setSelectedJadwalId] = useState<string>('');
  
  // State Input Materi
  const [nadaDasar, setNadaDasar] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [linkSopran1, setLinkSopran1] = useState<string>('');
  const [linkSopran2, setLinkSopran2] = useState<string>('');

  // Ambil semua jadwal untuk dimasukkan ke dropdown pilihan lagu
  const ambilJadwal = async () => {
    const { data, error } = await supabase
      .from('jadwal')
      .select('*')
      .order('tanggal', { ascending: false });

    if (!error && data) {
      setDaftarJadwal(data as Jadwal[]);
    }
  };

  useEffect(() => {
    ambilJadwal();
  }, []);

  // Ketika admin memilih lagu dari dropdown, otomatis isian form terisi data yang sudah ada (jika ada)
  const handleJadwalChange = (id: string) => {
    setSelectedJadwalId(id);
    const ditemukan = daftarJadwal.find((j) => j.id === Number(id));
    if (ditemukan) {
      setNadaDasar(ditemukan.nada_dasar || '');
      setLinkSopran1(ditemukan.link_sopran1 || '');
      setLinkSopran2(ditemukan.link_sopran2 || '');
    } else {
      setNadaDasar('');
      setLinkSopran1('');
      setLinkSopran2('');
    }
  };

  const handleUpdateMateriLagu = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedJadwalId) {
      alert('Pilih lagu / agenda latihan yang mau di-update dulu yaa! 🌸');
      return;
    }

    setLoading(true);
    let pdfUrl = null;

    try {
      // 1. Proses Upload File PDF ke Supabase Storage jika ada file baru yang dipilih
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

      // 2. Siapkan data yang akan di-update ke baris lagu tersebut
      const dataUpdate: any = {
        nada_dasar: nadaDasar || null,
        link_sopran1: linkSopran1 || null,
        link_sopran2: linkSopran2 || null,
      };

      // Jika ada file PDF baru, ikut masukkan url barunya
      if (pdfUrl) {
        dataUpdate.file_pdf_url = pdfUrl;
      }

      // 3. Update datanya ke Supabase berdasarkan ID lagu yang dipilih (bukan insert baru)
      const { error } = await supabase
        .from('jadwal')
        .update(dataUpdate)
        .eq('id', Number(selectedJadwalId));

      if (error) throw error;

      alert('Materi partitur & link panduan suara berhasil ditempelkan ke lagu ini! 🌸');
      
      // Reset input file & refresh daftar data
      setPdfFile(null);
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => { (input as HTMLInputElement).value = ''; });
      
      ambilJadwal();

    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memperbarui data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-pink-900 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Branding */}
        <div className="flex justify-center mb-8 border-b-2 border-pink-200 pb-4">
          <img src="/3.png" alt="Ziza Sched" className="h-20 object-contain" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORM PENGISIAN MATERI LAGU */}
          <div className="bg-white p-6 rounded-2xl border-2 border-pink-200 shadow-lg h-fit">
            <h2 className="text-lg font-bold mb-4 text-pink-700 flex items-center gap-1">✨ Tempel Materi Lagu</h2>
            
            <form onSubmit={handleUpdateMateriLagu} className="space-y-4">
              
              {/* DROPDOWN PILIHAN AGENDA/LAGU YANG SUDAH ADA */}
              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">Pilih Judul Lagu / Agenda</label>
                <select
                  value={selectedJadwalId}
                  onChange={(e) => handleJadwalChange(e.target.value)}
                  className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500 font-medium"
                >
                  <option value="">-- Pilih Judul Latihan Lagu --</option>
                  {daftarJadwal.map((j) => {
                    const namaTampilan = j.status === 'terisi' 
                      ? `Privat: ${j.nama_pendaftar} (${j.keterangan_partitur || 'Tanpa Judul'})`
                      : j.keterangan_partitur || `Agenda Intern (${j.tanggal})`;
                    return (
                      <option key={j.id} value={j.id}>
                        {j.tanggal} | {namaTampilan}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* INPUT DATA DETAIL MATERI */}
              <div className="pt-2 border-t border-pink-100 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Nada Dasar Lagu</label>
                  <input 
                    type="text" 
                    value={nadaDasar} 
                    onChange={(e) => setNadaDasar(e.target.value)} 
                    placeholder="Misal: Do = C atau G# min" 
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Upload Partitur Baru (PDF)</label>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Link Audio Sopran 1</label>
                  <input 
                    type="url" 
                    value={linkSopran1} 
                    onChange={(e) => setLinkSopran1(e.target.value)} 
                    placeholder="Tempel link Google Drive vokal S1..." 
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Link Audio Sopran 2</label>
                  <input 
                    type="url" 
                    value={linkSopran2} 
                    onChange={(e) => setLinkSopran2(e.target.value)} 
                    placeholder="Tempel link Google Drive vokal S2..." 
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 transition text-white font-bold rounded-lg shadow-md disabled:bg-gray-300"
              >
                {loading ? 'Sedang Memperbarui...' : 'Simpan & Tempel Materi 🌸'}
              </button>
            </form>
          </div>

          {/* MONITORING LIST SINKRONISASI LAGU */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-pink-200 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-pink-700">📋 Monitoring Status Materi Lagu</h2>
            
            {daftarJadwal.length === 0 ? (
              <p className="text-pink-400 italic">Belum ada agenda lagu apa pun di kalender database.</p>
            ) : (
              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                {daftarJadwal.map((j) => (
                  <div
                    key={j.id}
                    className={`p-4 rounded-xl border-2 flex flex-col md:flex-row md:items-center md:justify-between transition gap-4 ${
                      j.status === 'terisi' ? 'bg-amber-50/70 border-amber-200' : 'bg-pink-50/30 border-pink-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-pink-700 text-sm">{j.tanggal}</span>
                        <span className="text-[11px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-semibold">
                          {j.status === 'terisi' ? 'Slot Privat' : 'Slot Umum/Intern'}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 text-base">
                        🎼 {j.status === 'terisi' ? j.keterangan_partitur || `Latihan Privat (${j.nama_pendaftar})` : j.keterangan_partitur || 'Agenda Ditutup'}
                      </h3>

                      {/* Indikator Kelengkapan Berkas Lagu */}
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium">
                        {j.nada_dasar ? (
                          <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded">📍 {j.nada_dasar}</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded border border-dashed">📍 Nada Dasar Kosong</span>
                        )}
                        {j.file_pdf_url ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">📄 PDF Aktif</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded border border-dashed">📄 PDF Kosong</span>
                        )}
                        {j.link_sopran1 ? (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">🎵 S1 Aktif</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded border border-dashed">🎵 S1 Kosong</span>
                        )}
                        {j.link_sopran2 ? (
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">🎵 S2 Aktif</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded border border-dashed">🎵 S2 Kosong</span>
                        )}
                      </div>
                    </div>

                    {/* Akses Cepat Tombol Preview */}
                    {(j.file_pdf_url || j.link_sopran1 || j.link_sopran2) && (
                      <button
                        onClick={() => router.push(`/partitur/${j.id}`)}
                        className="text-xs px-3 py-1.5 bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 font-bold rounded-lg transition self-start md:self-center"
                      >
                        Lihat Hasil ✨
                      </button>
                    )}
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