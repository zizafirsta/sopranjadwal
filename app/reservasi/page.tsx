'use client';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    status: string;
    file_pdf_url: string | null;
    link_sopran1: string | null;
    link_sopran2: string | null;
  };
}

export default function ReservasiJadwal() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [renderModal, setRenderModal] = useState(false);
  const [infoWaktuTerpilih, setInfoWaktuTerpilih] = useState<{
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
  } | null>(null);

  const [nama, setNama] = useState('');
  const [partitur, setPartitur] = useState('');

  const ambilSemuaJadwal = async () => {
    const { data, error } = await supabase.from('jadwal').select('*');

    if (!error && data) {
      const formattedEvents: CalendarEvent[] = data.map((j: any) => {
        let title = '';
        let bgColor = '';
        let borderColor = '';

        if (j.status === 'terisi') {
          title = `🎵 Privat: ${j.nama_pendaftar}`;
          bgColor = 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)';
          borderColor = '#e11d48';
        } else {
          title = j.keterangan_partitur ? `🔒 ${j.keterangan_partitur}` : '🔒 Agenda Ziza (Slot Ditutup)';
          bgColor = 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
          borderColor = '#475569';
        }

        return {
          id: String(j.id),
          title: title,
          start: `${j.tanggal}T${j.jam_mulai}`,
          end: `${j.tanggal}T${j.jam_selesai}`,
          backgroundColor: bgColor,
          borderColor: borderColor,
          textColor: '#ffffff',
          extendedProps: { 
            status: j.status,
            file_pdf_url: j.file_pdf_url || null,
            link_sopran1: j.link_sopran1 || null,
            link_sopran2: j.link_sopran2 || null
          },
        };
      });

      setEvents(formattedEvents);
    }
  };

  useEffect(() => {
    ambilSemuaJadwal();
  }, []);

  const bukaModalWrapper = (dataWaktu: typeof infoWaktuTerpilih) => {
    setInfoWaktuTerpilih(dataWaktu);
    setRenderModal(true);
    setTimeout(() => setModalTerbuka(true), 10);
  };

  const tutupModalWrapper = () => {
    setModalTerbuka(false);
    setTimeout(() => setRenderModal(false), 300);
  };

  const handleSelectWaktuKosong = (selectInfo: any) => {
    const strMulai = selectInfo.startStr;
    const strSelesai = selectInfo.endStr;

    const tanggal = strMulai.split('T')[0];
    const jamMulai = strMulai.split('T')[1].substring(0, 5);
    const jamSelesai = strSelesai.split('T')[1].substring(0, 5);

    bukaModalWrapper({ tanggal, jamMulai, jamSelesai });
  };

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!infoWaktuTerpilih || !nama) {
      alert('Nama wajib diisi yaa! 🌸');
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('jadwal').insert([
      {
        tanggal: infoWaktuTerpilih.tanggal,
        jam_mulai: infoWaktuTerpilih.jamMulai,
        jam_selesai: infoWaktuTerpilih.jamSelesai,
        status: 'terisi',
        nama_pendaftar: nama,
        keterangan_partitur: partitur || null,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(`Gagal mengirim jadwal: ${error.message}`);
    } else {
      tutupModalWrapper();
      setNama('');
      setPartitur('');
      ambilSemuaJadwal();
      setTimeout(() => alert(`Hore! Slot privat berhasil dijadwalkan atas nama ${nama} 🎀`), 350);
    }
  };

  const handleEventClick = (info: any) => {
    const eventId = info.event.id;
    const props = info.event.extendedProps;

    if (props.file_pdf_url || props.link_sopran1 || props.link_sopran2) {
      router.push(`/partitur/${eventId}`);
    } else {
      alert('Slot agenda ini belum memiliki lampiran partitur atau link dari Kak Ziza. 🌸');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 text-pink-900 font-sans p-4 md:p-8 transition-all duration-500">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Tombol Kembali */}
        <div className="w-full flex justify-start mb-4">
          <button 
            onClick={() => router.push('/')}
            className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 transition"
          >
            ← Kembali ke Menu Utama
          </button>
        </div>

        <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-4 md:p-8 border border-pink-200/60 text-slate-800">
          <div className="calendar-container overflow-x-auto rounded-xl">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              validRange={{ start: '2026-05-01', end: '2026-06-01' }}
              initialDate="2026-05-01"
              headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
              locale="id"
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              events={events}
              selectable={true}
              selectMirror={true}
              selectOverlap={false}
              select={handleSelectWaktuKosong}
              eventClick={handleEventClick}
              height="auto"
              slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false }}
            />
          </div>
        </div>
      </div>

      {/* Modal Booking */}
      {renderModal && infoWaktuTerpilih && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${modalTerbuka ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white rounded-2xl max-w-md w-full p-6 border-2 border-pink-300 shadow-2xl transform transition-all duration-300 ${modalTerbuka ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-pink-700">Booking Privat Sopran 🎵</h3>
              <button onClick={tutupModalWrapper} className="text-gray-400 hover:text-pink-600 font-bold text-lg transition">✕</button>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-3.5 rounded-xl border border-pink-100 text-sm text-pink-800 mb-5 space-y-1 shadow-sm">
              <p><strong>📅 Tanggal:</strong> {infoWaktuTerpilih.tanggal}</p>
              <p><strong>⏰ Waktu Privat:</strong> {infoWaktuTerpilih.jamMulai} - {infoWaktuTerpilih.jamSelesai} WIB</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">Nama Kamu (Anak Sopran)</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Ketik namamu di sini..."
                  className="w-full p-3 bg-pink-50/50 border border-pink-200 rounded-xl text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1">Materi / Judul Partitur</label>
                <input
                  type="text"
                  value={partitur}
                  onChange={(e) => setPartitur(e.target.value)}
                  placeholder="Misal: Sopran - Gloria..."
                  className="w-full p-3 bg-pink-50/50 border border-pink-200 rounded-xl text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={tutupModalWrapper} className="w-1/2 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl transition">Batal</button>
                <button type="submit" disabled={loading} className="w-1/2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl transition disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Ambil Slot Jadwal 🌸'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .fc .fc-theme-standard td, .fc .fc-theme-standard th { border-color: #fce7f3 !important; }
        .fc .fc-toolbar-title { color: #db2777; font-size: 1.25rem; font-weight: bold; }
        .fc .fc-button-primary { background-color: #ec4899 !important; border-color: #db2777 !important; border-radius: 10px !important; }
        .fc .fc-timegrid-slot { height: 4.2rem !important; }
        .fc-v-event { background: var(--fc-event-bg-color) !important; border: none !important; border-left: 4px solid var(--fc-event-border-color) !important; border-radius: 12px !important; padding: 6px !important; }
        .fc-v-event:hover { cursor: pointer; filter: brightness(1.03); }
        .fc .fc-col-header-cell-cushion { color: #be185d; font-weight: 800; text-decoration: none; }
        .fc .fc-timegrid-slot-label-cushion { color: #be185d; font-weight: 600; }
      `}</style>
    </div>
  );
}