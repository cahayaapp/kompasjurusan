KOMPAS JURUSAN PRO V9.1

PERBAIKAN UTAMA:
- Menu Pembayaran Admin sekarang membaca konfirmasi peserta dari dua sumber:
  1) paymentIndex (indeks ringan dan cepat)
  2) payments (kompatibilitas data lama)
- Konfirmasi baru otomatis membuat paymentIndex tanpa menyimpan gambar bukti di indeks, sehingga dashboard admin lebih cepat.
- Data pembayaran lama tetap tampil dan otomatis dibackfill ke paymentIndex oleh admin.
- Admin dapat filter: Semua / Menunggu / Disetujui / Ditolak.
- Saat klik Tinjau, bukti transfer detail diambil dari payments/{uid}/{paymentId}.
- Approve / Reject memperbarui detail pembayaran, indeks admin, dan akses peserta.
- Pesan error ditampilkan jika rules Firebase belum sesuai.

PENTING:
Publish database.rules.json terbaru ke Firebase Realtime Database Rules.
Domain: kompasjurusan.cahayaapp.com
