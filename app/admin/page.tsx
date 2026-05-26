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
  
  const [tanggal, setTanggal] = useState<string>('');
  const [jamMulai, setJamMulai] = useState<string>('');
  const [jamSelesai, setJamSelesai] = useState<string>('');
  const [status, setStatus] = useState<string>('kosong');
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState<string>('');
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [nadaDasar, setNadaDasar] = useState<string>('');
  
  // State Baru: Menggunakan string untuk menyimpan link URL biasa
  const [linkSopran1, setLinkSopran1] = useState<string>('');
  const [linkSopran2, setLinkSopran2] = useState<string>('');

  const [daftarJadwal, setDaftarJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const ambilJadwal = async () => {
    const { data, error } = await supabase
      .from('jadwal')
      .select('*')
      .order('tanggal', { ascending: true })
      .order('jam_mulai', { ascending: true });

    if (!error && data) {
      setDaftarJadwal(data as Jadwal[]);
    }
  };

  useEffect(() => {
    ambilJadwal();
  }, []);

  const handleTambahJadwal = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!tanggal || !jamMulai || !jamSelesai) {
      alert('Semua baris input harus diisi!');
      setLoading(false);
      return;
    }

    let pdfUrl = null;

    try {
      // Hanya upload PDF ke storage jika ada file yang dipilih
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

      const keteranganSaves = status === 'bukan_privat' ? deskripsiKegiatan : null;

      // Masukkan data jadwal beserta link teks panduan suara ke database
      const { error } = await supabase.from('jadwal').insert([
        {
          tanggal,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          status,
          nama_pendaftar: null,
          keterangan_partitur: keteranganSaves,
          nada_dasar: nadaDasar || null,
          file_pdf_url: pdfUrl,
          link_sopran1: linkSopran1 || null,
          link_sopran2: linkSopran2 || null
        },
      ]);

      if (error) throw error;

      alert('Jadwal, nada dasar, & link panduan suara berhasil disimpan! 🌸');
      
      // Reset Form Inputs
      setJamMulai('');
      setJamSelesai('');
      setDeskripsiKegiatan('');
      setNadaDasar('');
      setLinkSopran1('');
      setLinkSopran2('');
      setPdfFile(null);
      
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        (input as HTMLInputElement).value = '';
      });

      ambilJadwal();

    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleHapusJadwal = async (id: number) => {
    if (confirm('Apakah kamu yakin ingin menghapus slot jadwal ini?')) {
      const { error } = await supabase.from('jadwal').delete().eq('id', id);
      if (!error) {
        ambilJadwal();
      } else {
        alert('Gagal menghapus jadwal');
      }
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-pink-900 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-center mb-8 border-b-2 border-pink-200 pb-4">
          <img src="/3.png" alt="Ziza Sched" className="h-20 object-contain" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INPUT FORM */}
          <div className="bg-white p-6 rounded-2xl border-2 border-pink-200 shadow-lg h-fit">
            <h2 className="text-lg font-bold mb-4 text-pink-700 flex items-center gap-1">✨ Tambah Slot Baru</h2>
            <form onSubmit={handleTambahJadwal} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-600 mb-1">Jenis Agenda</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    if (e.target.value === 'kosong') setDeskripsiKegiatan('');
                  }}
                  className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                >
                  <option value="kosong">Kosong (Bisa Di-booking)</option>
                  <option value="bukan_privat">Bukan Privat (Kuliah/Rutin/Acara)</option>
                </select>
              </div>

              {status === 'bukan_privat' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Keterangan Kegiatan Pribadi</label>
                  <input
                    type="text"
                    required
                    value={deskripsiKegiatan}
                    onChange={(e) => setDeskripsiKegiatan(e.target.value)}
                    placeholder="Misal: Kuliah, Latihan Rutin, dll..."
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>
              )}

              {/* DATA STRUKTUR TAMBAHAN BARU (BENTUK LINK URL INPUT) */}
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
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Upload Partitur (PDF)</label>
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
                    placeholder="Tempel link Google Drive/Audio di sini..." 
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-pink-600 mb-1">Link Audio Sopran 2</label>
                  <input 
                    type="url" 
                    value={linkSopran2} 
                    onChange={(e) => setLinkSopran2(e.target.value)} 
                    placeholder="Tempel link Google Drive/Audio di sini..." 
                    className="w-full p-2.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-900 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 transition text-white font-bold rounded-lg shadow-md disabled:bg-gray-300"
              >
                {loading ? 'Menyimpan...' : 'Simpan Slot Jadwal 🌸'}
              </button>
            </form>
          </div>

          {/* LIST MONITORING JADWAL */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-pink-200 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-pink-700">📋 Semua Jadwal</h2>
            
            {daftarJadwal.length === 0 ? (
              <p className="text-pink-400 italic">Belum ada jadwal yang dimasukkan.</p>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {daftarJadwal.map((j) => (
                  <div
                    key={j.id}
                    className={`p-4 rounded-xl border-2 flex flex-col md:flex-row md:items-center md:justify-between transition gap-4 ${
                      j.status === 'terisi'
                        ? 'bg-amber-50 border-amber-300'
                        : j.status === 'bukan_privat'
                        ? 'bg-gray-50 border-gray-200 text-gray-500'
                        : 'bg-pink-50/50 border-pink-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-pink-700">{j.tanggal}</span>
                        <span className="text-xs bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full font-semibold">
                          {j.jam_mulai.substring(0, 5)} - {j.jam_selesai.substring(0, 5)}
                        </span>
                      </div>
                      
                      {j.status === 'terisi' ? (
                        <div className="text-sm text-amber-800 space-y-0.5">
                          <p>👤 <strong>Pendaftar:</strong> {j.nama_pendaftar}</p>
                          <p>🎵 <strong>Partitur:</strong> {j.keterangan_partitur || '-'}</p>
                        </div>
                      ) : j.status === 'bukan_privat' ? (
                        <p className="text-sm text-gray-600 font-medium">
                          🔒 <strong>Slot Ditutup:</strong> {j.keterangan_partitur || 'Agenda Pribadi'}
                        </p>
                      ) : (
                        <p className="text-xs text-pink-500 font-semibold">✨ Slot Kosong / Menunggu Sopran</p>
                      )}

                      {/* Info File Indikator */}
                      {(j.nada_dasar || j.file_pdf_url || j.link_sopran1 || j.link_sopran2) && (
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium text-pink-600">
                          {j.nada_dasar && <span className="bg-pink-100 px-2 py-0.5 rounded">📍 {j.nada_dasar}</span>}
                          {j.file_pdf_url && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">📄 PDF Ready</span>}
                          {j.link_sopran1 && <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">🎵 S1 Link Ready</span>}
                          {j.link_sopran2 && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">🎵 S2 Link Ready</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 self-start md:self-center">
                      {(j.file_pdf_url || j.link_sopran1 || j.link_sopran2) && (
                        <button
                          onClick={() => router.push(`/partitur/${j.id}`)}
                          className="text-xs px-3 py-1.5 bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 font-bold rounded-lg transition"
                        >
                          Lihat Partitur 🎵
                        </button>
                      )}
                      <button
                        onClick={() => handleHapusJadwal(j.id)}
                        className="text-xs px-3 py-1.5 bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200 font-bold rounded-lg transition"
                      >
                        Hapus
                      </button>
                    </div>
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