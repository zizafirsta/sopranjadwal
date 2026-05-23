'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';

interface Jadwal {
  id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  nama_pendaftar: string | null;
  keterangan_partitur: string | null;
}

export default function AdminDashboard() {
  const [tanggal, setTanggal] = useState<string>('');
  const [jamMulai, setJamMulai] = useState<string>('');
  const [jamSelesai, setJamSelesai] = useState<string>('');
  const [status, setStatus] = useState<string>('kosong');
  // State baru untuk deskripsi kegiatan pribadi
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState<string>('');
  
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
    ambilJalwal();
  }, []);

  const ambilJalwal = () => {
    ambilJadwal();
  };

  const handleTambahJadwal = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!tanggal || !jamMulai || !jamSelesai) {
      alert('Semua baris input harus diisi!');
      setLoading(false);
      return;
    }

    // Jika statusnya bukan_privat, simpan keterangan kegiatan di kolom keterangan_partitur
    const keteranganSaves = status === 'bukan_privat' ? deskripsiKegiatan : null;

    const { error } = await supabase.from('jadwal').insert([
      {
        tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        status,
        nama_pendaftar: null,
        keterangan_partitur: keteranganSaves,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(`Gagal menambah jadwal: ${error.message}`);
    } else {
      alert('Jadwal baru berhasil ditambahkan! 🌸');
      setJamMulai('');
      setJamSelesai('');
      setDeskripsiKegiatan('');
      ambilJadwal();
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
        
        {/* Gambar 3: ziza sched */}
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

              {/* TAMPILKAN KOLOM INI HANYA JIKA MEMILIH BUKAN PRIVAT */}
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
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
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
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-pink-700">{j.tanggal}</span>
                        <span className="text-xs bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full font-semibold">
                          {j.jam_mulai.substring(0, 5)} - {j.jam_selesai.substring(0, 5)}
                        </span>
                      </div>
                      
                      {j.status === 'terisi' ? (
                        <div className="mt-2 text-sm text-amber-800">
                          <p>👤 <strong>Pendaftar:</strong> {j.nama_pendaftar}</p>
                          <p>🎵 <strong>Partitur:</strong> {j.keterangan_partitur || '-'}</p>
                        </div>
                      ) : j.status === 'bukan_privat' ? (
                        <p className="mt-1 text-sm text-gray-600 font-medium">🔒 <strong>Slot Ditutup:</strong> {j.keterangan_partitur || 'Agenda Pribadi'}</p>
                      ) : (
                        <p className="mt-1 text-xs text-pink-500 font-semibold">✨ Slot Kosong / Menunggu Sopran</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleHapusJadwal(j.id)}
                      className="text-xs px-3 py-1.5 bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200 font-bold rounded-lg transition"
                    >
                      Hapus
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