KOMPAS JURUSAN V9.7 - PERBAIKAN DOWNLOAD PDF ADMIN

Perbaikan:
- Tombol PDF admin memakai event delegation sehingga tetap bekerja walau tabel/dashboard dirender ulang.
- Jika hasil belum ada di state dashboard, admin mengambil hasil langsung dari results/{uid}/{resultId}.
- Jika profil peserta belum lengkap di state, admin mengambil profil langsung dari users/{uid}.
- Cache-busting pada admin.js dan report-pdf.js agar browser tidak memakai kode admin lama.
- Tombol memberi status "Menyiapkan PDF..." saat laporan sedang dibuat.

Firebase Rules tidak berubah dari V9.6.
