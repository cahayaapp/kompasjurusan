KOMPAS JURUSAN CAHAYA PRO — V8
Domain: kompasjurusan.cahayaapp.com
Firebase: kompasjurusan-dc89f

VERSI INI MEROMBAK UI/UX MENJADI LEBIH RINGAN DAN PROFESIONAL:
- Lebih banyak whitespace dan jarak antar-komponen.
- Warna terang, bersih, modern, dengan aksen teal dan kuning.
- Landing page lebih seperti aplikasi edukasi nasional: hero + visual aplikasi + login card.
- Dashboard peserta dan admin lebih ringan, tidak padat.
- Sidebar desktop lebih ramping.
- Navigasi mobile memakai bottom navigation seperti aplikasi native.
- Tabel admin berubah menjadi card pada layar kecil sehingga tidak perlu scroll horizontal.
- Halaman asesmen tetap satu pernyataan per layar.
- Bukti transfer dikompres sebelum disimpan agar lebih ringan.
- Login/register tetap satu pintu berdasarkan role.
- 108 butir asesmen dipertahankan.

PENTING SETELAH UPLOAD:
1. Replace seluruh isi hosting/repository dengan folder V8.
2. Publish database.rules.json terbaru di Firebase Realtime Database.
3. Pastikan Email/Password aktif pada Firebase Authentication.
4. Pastikan kompasjurusan.cahayaapp.com ada di Authorized Domains.
5. Pastikan akun admin memiliki users/{uid}/role = "admin".
