KOMPAS JURUSAN CAHAYA PRO V9.4

PERBAIKAN UTAMA
- Memperbaiki bug pilihan jawaban asesmen yang kadang tidak dapat diklik.
- Tombol Mulai dari Awal sekarang membatalkan proses jawaban lama dengan aman.
- Status transitioning selalu dilepas kembali walau penyimpanan gagal.
- Proses lama tidak dapat melompat ke soal berikutnya setelah reset.
- Draft memakai revision + Firebase transaction agar write lama tidak dapat menimpa reset/progres yang lebih baru.
- Mode fokus, hasil asesmen, rekomendasi TKA, payment, dan dashboard admin tetap dipertahankan.

INSTALASI
Ganti file aplikasi dengan paket V9.4. Firebase Rules tidak perlu diubah dari V9.3/V9.2 bila rules terakhir sudah terpasang.
