KOMPAS JURUSAN CAHAYA PRO V5

ISI PAKET
- index.html               : halaman login + landing page
- peserta.html             : dashboard peserta
- admin.html               : dashboard admin
- assets/app.css           : UI/UX baru, lebih elegan dan fresh
- assets/logo-icon.svg     : logo icon / header / favicon
- assets/logo-wordmark.svg : logo wordmark
- assets/favicon.svg       : favicon
- js/firebase.js           : koneksi Firebase
- js/auth.js               : login, register, reset password
- js/peserta.js            : fitur peserta
- js/admin.js              : fitur admin
- js/data.js               : bank soal dan pengaturan dasar
- js/scoring.js            : logika hasil asesmen
- js/common.js             : utilitas umum
- database.rules.json      : rules Firebase terbaru

FITUR UTAMA
1. Satu form login untuk semua akun.
2. Role admin otomatis diarahkan ke admin.html.
3. Role participant otomatis diarahkan ke peserta.html.
4. UI/UX dirancang ulang agar terasa lebih premium, segar, dan rapi.
5. Payment sederhana: upload bukti transfer, nama pengirim, dan bank.
6. Admin memverifikasi pembayaran lalu akses peserta aktif.
7. Asesmen 108 butir, satu pernyataan per layar.
8. Jawaban tersimpan otomatis per butir.
9. Hasil asesmen tersimpan sebagai riwayat.
10. Peserta dapat tes ulang berkali-kali setelah pembayaran aktif.

CATATAN PENTING
1. Aktifkan Email/Password pada Firebase Authentication.
2. Publish database.rules.json di Realtime Database.
3. Pastikan admin sudah punya role "admin" di path:
   users/{uidAdmin}/role = "admin"
4. File dapat di-upload langsung ke GitHub Pages / hosting statis.

STRUKTUR DATA
users/{uid}
settings/public
payments/{uid}/{paymentId}
access/{uid}
drafts/{uid}
results/{uid}/{resultId}

SELESAI.

DOMAIN PRODUKSI
- Domain utama: https://kompasjurusan.cahayaapp.com
- File CNAME sudah disertakan untuk GitHub Pages.
- Tambahkan kompasjurusan.cahayaapp.com ke Firebase Authentication > Settings > Authorized domains.
- Setelah DNS GitHub Pages valid, aktifkan Enforce HTTPS agar alamat tidak lagi tampil "Not Secure".

PERBAIKAN V6
- Form login tampil langsung tanpa menunggu pemeriksaan sesi.
- Pemeriksaan sesi berjalan di belakang dan tidak lagi membuat panel putih kosong.
- Ditambahkan koneksi awal ke layanan Firebase untuk mempercepat inisialisasi.
- Canonical URL disesuaikan ke kompasjurusan.cahayaapp.com.
