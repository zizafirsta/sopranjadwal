'use client';
import { useRouter } from 'next/navigation';

export default function MainDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 text-pink-900 font-sans p-4 md:p-8 flex items-center justify-center transition-all duration-500">
      <div className="max-w-3xl w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-10 border border-pink-200/60 text-center space-y-8 animate-fade-in hover:shadow-pink-200/40 transition-all duration-300">
        
        {/* === BAGIAN FOTO ATAS (1.png) === */}
        <div className="flex flex-col items-center gap-3">
          <img src="/1.png" alt="Zizafirsta's Project" className="h-12 object-contain opacity-80" />
          <img src="/2.png" alt="Sopran Choir" className="h-20 object-contain drop-shadow-sm filter saturate-105" />
          <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mt-2"></div>
        </div>

        {/* === BARISAN 3 FOTO SE-JAJAR (4, 5, 6.png) === */}
        {/* Menggunakan layout grid agar 3 foto otomatis sejajar rapi dan ukurannya sama */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 px-2 md:px-6 pt-2">
          <div className="aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-lg transform hover:rotate-[-3deg] hover:scale-105 transition duration-300">
            <img src="/4.png" alt="Sopran Foto 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-lg transform hover:scale-105 transition duration-300">
            <img src="/5.png" alt="Sopran Foto 2" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-lg transform hover:rotate-[3deg] hover:scale-105 transition duration-300">
            <img src="/6.png" alt="Sopran Foto 3" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* === GAMBAR JUDUL (3.png) DI BAWAH 3 FOTO === */}
        <div className="flex justify-center transform hover:scale-102 transition duration-300 pt-2">
          <img src="/3.png" alt="Ziza Sched" className="h-28 md:h-32 w-auto object-contain drop-shadow-md" />
        </div>

        <p className="text-slate-600 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed pt-2">
          Selamat datang di portal koordinasi Sopran! Silakan pilih menu di bawah ini untuk aktivitasmu 🌸
        </p>

        {/* MENU UTAMA DASHBOARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
          
          {/* MENU 1: JADWAL PRIVAT (LARI KE HALAMAN RESERVASI KALENDER) */}
          <button
            onClick={() => router.push('/reservasi')}
            className="p-6 bg-gradient-to-br from-white to-pink-50/40 border border-pink-200 hover:border-pink-400 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between group active:scale-98"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-200">
              📅
            </div>
            <div>
              <h3 className="font-bold text-lg text-pink-700 group-hover:text-pink-600">Jadwal Privat</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Lihat agenda kosong Kak Ziza dan pesan waktu latihan privatmu di sini.
              </p>
            </div>
          </button>

          {/* MENU 2: PARTITUR & AUDIO (LARI KE HALAMAN GUDANG MATERI LAGU) */}
          <button
            onClick={() => router.push('/partitur')}
            className="p-6 bg-gradient-to-br from-white to-rose-50/40 border border-pink-200 hover:border-rose-400 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between group active:scale-98"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-200">
              🎼
            </div>
            <div>
              <h3 className="font-bold text-lg text-rose-700 group-hover:text-rose-600">Partitur & Audio</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Akses lembar partitur PDF dan dengarkan vokal guide Sopran 1 & 2.
              </p>
            </div>
          </button>

        </div>

        <div className="text-[11px] text-slate-400 pt-6 border-t border-pink-100">
          ChoirZ Project • Dibuat khusus dengan penuh kasih sayang 🌸
        </div>

      </div>
    </div>
  );
}