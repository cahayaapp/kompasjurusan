export const TKA_REQUIRED = ['Bahasa Indonesia', 'Bahasa Inggris', 'Matematika'];

export const TKA_ELECTIVE_SUBJECTS = [
  'Matematika Tingkat Lanjut',
  'Bahasa Indonesia Tingkat Lanjut',
  'Bahasa Inggris Tingkat Lanjut',
  'Fisika',
  'Kimia',
  'Biologi',
  'Ekonomi',
  'Sosiologi',
  'Geografi',
  'Sejarah',
  'Antropologi',
  'Pendidikan Pancasila/PPKn',
  'Bahasa Arab',
  'Bahasa Jerman',
  'Bahasa Prancis',
  'Bahasa Jepang',
  'Bahasa Korea',
  'Bahasa Mandarin',
  'Produk/Projek Kreatif dan Kewirausahaan'
];

// Pemetaan berikut menggabungkan:
// 1) daftar yang diberikan pengguna untuk kelompok hukum/sosial, ekonomi/bisnis, dan kesehatan;
// 2) kelompok program studi pada Kepmendikdasmen 102/M/2025 untuk prodi lain yang digunakan aplikasi.
// Jika hanya satu mapel pendukung yang tersedia, aplikasi tidak mengarang mapel kedua.
export const TKA_MAJOR_MAP = {
  'Teknik Informatika': {
    options: ['Matematika Tingkat Lanjut'],
    note: 'Kelompok komputer/informatika menempatkan Matematika Tingkat Lanjut sebagai mapel pendukung utama.'
  },
  'Data Science': {
    options: ['Matematika Tingkat Lanjut'],
    note: 'Sains Data menggunakan Matematika Tingkat Lanjut sebagai mapel pendukung utama.'
  },
  'Statistika': {
    options: ['Matematika Tingkat Lanjut'],
    note: 'Bidang matematika/statistika sangat bertumpu pada Matematika Tingkat Lanjut.'
  },
  'Teknik Industri': {
    options: ['Fisika', 'Kimia', 'Matematika Tingkat Lanjut'],
    note: 'Kelompok teknik/rekayasa dapat didukung Fisika, Kimia, dan/atau Matematika Tingkat Lanjut.'
  },
  'Sistem Informasi': {
    options: ['Matematika Tingkat Lanjut'],
    note: 'Kelompok komputer/informasi menempatkan Matematika Tingkat Lanjut sebagai prioritas.'
  },

  'Ilmu Falak': {
    options: ['Matematika Tingkat Lanjut', 'Fisika'],
    note: 'Ilmu Falak memadukan kajian keislaman dengan astronomi; Matematika Tingkat Lanjut dan Fisika menjadi penguatan akademik yang paling relevan.'
  },

  'Kedokteran': {
    options: ['Biologi', 'Kimia'],
    note: 'Kedokteran didukung Biologi dan/atau Kimia.'
  },
  'Farmasi': {
    options: ['Biologi', 'Kimia'],
    note: 'Farmasi didukung Biologi dan/atau Kimia.'
  },
  'Keperawatan': {
    options: ['Biologi'],
    note: 'Keperawatan menempatkan Biologi sebagai mapel pendukung utama.'
  },
  'Gizi': {
    options: ['Biologi', 'Kimia'],
    note: 'Gizi didukung Biologi dan/atau Kimia.'
  },
  'Kesehatan Masyarakat': {
    options: ['Biologi'],
    note: 'Kesehatan Masyarakat menempatkan Biologi sebagai mapel pendukung utama.'
  },

  'Pendidikan': {
    options: [],
    customLabel: '1 mapel yang relevan dengan prodi pendidikan yang dipilih',
    note: 'Program kependidikan mengikuti mapel yang relevan dengan bidang pendidikan target.'
  },
  'Bahasa': {
    options: ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut'],
    note: 'Bidang linguistik/bahasa didukung Bahasa Indonesia Tingkat Lanjut dan/atau bahasa asing yang relevan.'
  },
  'Sejarah': {
    options: ['Sejarah'],
    note: 'Sejarah menggunakan Sejarah sebagai mapel pendukung utama.'
  },
  'Sastra': {
    options: ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut'],
    note: 'Susastra didukung Bahasa Indonesia Tingkat Lanjut dan/atau bahasa asing yang relevan.'
  },
  'Bimbingan Konseling': {
    options: [],
    customLabel: '1 mapel yang relevan dengan prodi Bimbingan dan Konseling',
    note: 'Sebagai program kependidikan, mapel pendukung menyesuaikan bidang prodi dan rekam belajar peserta.'
  },

  'Manajemen': {
    options: ['Ekonomi', 'Bahasa Inggris Tingkat Lanjut', 'Produk/Projek Kreatif dan Kewirausahaan'],
    note: 'Prioritas dapat dipilih dari Ekonomi, Bahasa Inggris Tingkat Lanjut, dan Projek Kreatif/Kewirausahaan.'
  },
  'Bisnis Digital': {
    options: ['Ekonomi', 'Produk/Projek Kreatif dan Kewirausahaan'],
    note: 'Bisnis Digital kuat pada Ekonomi dan Projek Kreatif/Kewirausahaan.'
  },
  'Akuntansi': {
    options: ['Matematika Tingkat Lanjut', 'Ekonomi'],
    note: 'Akuntansi kuat pada Matematika Tingkat Lanjut dan Ekonomi.'
  },
  'Kewirausahaan': {
    options: ['Ekonomi', 'Produk/Projek Kreatif dan Kewirausahaan'],
    note: 'Kewirausahaan kuat pada Ekonomi dan Projek Kreatif/Kewirausahaan.'
  },
  'Administrasi Bisnis': {
    options: ['Ekonomi', 'Pendidikan Pancasila/PPKn'],
    note: 'Administrasi bisnis/niaga beririsan kuat dengan Ekonomi; PPKn juga dapat relevan pada jalur administrasi tertentu.'
  },


  'Akuntansi Syariah': {
    options: ['Matematika Tingkat Lanjut', 'Ekonomi'],
    note: 'Akuntansi Syariah kuat pada Ekonomi dan kemampuan kuantitatif; Bahasa Arab menjadi penguatan tambahan yang baik.'
  },
  'Manajemen Keuangan Syariah': {
    options: ['Ekonomi', 'Matematika Tingkat Lanjut'],
    note: 'Manajemen Keuangan Syariah memerlukan penguatan Ekonomi dan kemampuan kuantitatif.'
  },
  'Manajemen Bisnis Syariah': {
    options: ['Ekonomi', 'Produk/Projek Kreatif dan Kewirausahaan'],
    note: 'Manajemen Bisnis Syariah beririsan dengan bisnis, manajemen, dan kewirausahaan; Ekonomi menjadi dasar utama.'
  },
  'Manajemen Zakat dan Wakaf': {
    options: ['Ekonomi', 'Bahasa Arab'],
    note: 'Manajemen Zakat dan Wakaf memerlukan pemahaman ekonomi sekaligus literatur keislaman.'
  },
  'Manajemen Haji dan Umrah': {
    options: ['Ekonomi', 'Bahasa Arab'],
    note: 'Manajemen Haji dan Umrah memadukan pengelolaan layanan dan kemampuan memahami terminologi keislaman.'
  },

  'Psikologi': {
    options: ['Sosiologi', 'Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut'],
    note: 'Acuan yang diberikan pengguna menempatkan Sosiologi serta bahasa tingkat lanjut sebagai pilihan yang relevan.'
  },
  'Sosiologi': {
    options: ['Sosiologi', 'Antropologi', 'Sejarah'],
    note: 'Sosiologi dapat didukung Sosiologi, Antropologi, dan Sejarah.'
  },
  'Ilmu Komunikasi': {
    options: ['Bahasa Indonesia Tingkat Lanjut', 'Sosiologi', 'Bahasa Inggris Tingkat Lanjut'],
    note: 'Ilmu Komunikasi kuat pada bahasa tingkat lanjut dan Sosiologi.'
  },
  'Pekerjaan Sosial': {
    options: ['Sosiologi'],
    note: 'Kelompok sosial menempatkan Sosiologi sebagai mapel pendukung utama.'
  },
  'Hubungan Internasional': {
    options: ['Bahasa Inggris Tingkat Lanjut', 'Pendidikan Pancasila/PPKn', 'Sejarah'],
    note: 'Hubungan Internasional kuat pada Bahasa Inggris Tingkat Lanjut, PPKn, dan Sejarah.'
  },

  'Pendidikan Agama Islam (PAI)': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'Untuk PAI, Bahasa Arab menjadi penguatan penting untuk sumber-sumber keislaman; Bahasa Indonesia Tingkat Lanjut membantu kemampuan akademik, literasi, dan komunikasi pendidikan.'
  },
  'Pendidikan Bahasa Arab': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'Bahasa Arab menjadi penguatan utama untuk Pendidikan Bahasa Arab; Bahasa Indonesia Tingkat Lanjut mendukung literasi akademik dan kompetensi kependidikan.'
  },

  'PGMI': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'PGMI memerlukan penguatan Bahasa Arab untuk sumber keislaman dan Bahasa Indonesia Tingkat Lanjut untuk literasi akademik serta kompetensi kependidikan.'
  },
  'Pendidikan Islam Anak Usia Dini (PIAUD)': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'PIAUD didukung Bahasa Arab sebagai penguatan sumber keislaman dan Bahasa Indonesia Tingkat Lanjut untuk kompetensi pendidikan anak usia dini.'
  },
  'Manajemen Pendidikan Islam': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'MPI memadukan kependidikan dan studi Islam; Bahasa Arab dan Bahasa Indonesia Tingkat Lanjut menjadi penguatan yang relevan.'
  },
  'Bahasa dan Sastra Arab': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'Bahasa Arab menjadi penguatan utama; Bahasa Indonesia Tingkat Lanjut membantu literasi akademik.'
  },
  'Dirasat Islamiyah': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'Dirasat Islamiyah sangat terkait dengan penguasaan Bahasa Arab dan literasi akademik.'
  },
  'Studi Agama-Agama': {
    options: ['Bahasa Arab', 'Sosiologi'],
    note: 'Studi Agama-Agama relevan dengan Bahasa Arab untuk teks keislaman dan Sosiologi untuk kajian masyarakat dan keberagamaan.'
  },

  'Ilmu Hukum': {
    options: ['Pendidikan Pancasila/PPKn', 'Sosiologi', 'Sejarah'],
    note: 'Untuk Ilmu Hukum, PPKn, Sosiologi, dan Sejarah menjadi pilihan penguatan yang relevan untuk literasi hukum, kewargaan, dan konteks sosial.'
  },

  'Ilmu Politik': {
    options: ['Pendidikan Pancasila/PPKn', 'Sejarah', 'Sosiologi'],
    note: 'Ilmu Politik didukung pemahaman kewargaan, sejarah, dan dinamika sosial-politik.'
  },

  'Hukum Keluarga Islam (Ahwal Syakhshiyyah)': {
    options: ['Bahasa Arab', 'Pendidikan Pancasila/PPKn'],
    note: 'Bahasa Arab membantu kajian sumber hukum keluarga Islam, sedangkan PPKn memperkuat wawasan hukum dan kewargaan.'
  },
  'Hukum Islam / Syariah': {
    options: ['Bahasa Arab', 'Pendidikan Pancasila/PPKn'],
    note: 'Bahasa Arab membantu kajian sumber hukum Islam, sedangkan PPKn relevan untuk penguatan wawasan hukum dan kewargaan.'
  },
  'Hukum Tata Negara (Siyasah)': {
    options: ['Pendidikan Pancasila/PPKn', 'Bahasa Arab'],
    note: 'PPKn menjadi penguatan utama untuk tata negara dan kewargaan; Bahasa Arab membantu kajian sumber siyasah dan literatur keislaman.'
  },
  'Administrasi Publik': {
    options: ['Pendidikan Pancasila/PPKn', 'Sosiologi', 'Ekonomi'],
    note: 'Administrasi Publik berkaitan dengan kebijakan, masyarakat, tata kelola, dan pemahaman ekonomi publik.'
  },
  'Hukum Ekonomi Syariah': {
    options: ['Ekonomi', 'Bahasa Arab'],
    note: 'Hukum Ekonomi Syariah memerlukan penguatan Ekonomi sekaligus Bahasa Arab untuk memahami terminologi dan sumber-sumber syariah.'
  },
  'Hukum Ekonomi Syariah (Muamalah)': {
    options: ['Ekonomi', 'Bahasa Arab'],
    note: 'Hukum Ekonomi Syariah/Muamalah memerlukan penguatan Ekonomi sekaligus Bahasa Arab untuk memahami transaksi dan sumber-sumber syariah.'
  },

  'Hukum Pidana Islam (Jinayah)': {
    options: ['Bahasa Arab', 'Pendidikan Pancasila/PPKn'],
    note: 'Hukum Pidana Islam memerlukan Bahasa Arab untuk literatur fikih/jinayah dan PPKn untuk penguatan hukum dan kewargaan.'
  },
  'Perbandingan Mazhab': {
    options: ['Bahasa Arab', 'Pendidikan Pancasila/PPKn'],
    note: 'Perbandingan Mazhab sangat terkait dengan Bahasa Arab untuk kajian sumber fikih dan PPKn untuk wawasan hukum.'
  },

  "Ilmu Al-Qur'an dan Tafsir": {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: "Bahasa Arab menjadi prioritas utama untuk kajian Al-Qur'an dan tafsir; literasi Bahasa Indonesia Tingkat Lanjut membantu kemampuan analisis dan penulisan akademik."
  },
  'Ilmu Hadis': {
    options: ['Bahasa Arab', 'Bahasa Indonesia Tingkat Lanjut'],
    note: 'Bahasa Arab menjadi prioritas utama untuk memahami teks dan literatur hadis; Bahasa Indonesia Tingkat Lanjut mendukung literasi dan penulisan akademik.'
  },
  'Aqidah dan Filsafat Islam': {
    options: ['Bahasa Arab', 'Sosiologi'],
    note: 'Bahasa Arab membantu kajian literatur Islam, sedangkan Sosiologi mendukung pembacaan persoalan pemikiran dan masyarakat kontemporer.'
  },
  'Sejarah Peradaban Islam': {
    options: ['Sejarah', 'Bahasa Arab'],
    note: 'Sejarah menjadi penguatan utama untuk kajian peradaban; Bahasa Arab membantu akses pada sumber dan literatur Islam.'
  },
  'Tasawuf dan Psikoterapi': {
    options: ['Bahasa Arab', 'Sosiologi'],
    note: 'Bahasa Arab penting untuk kajian literatur tasawuf; Sosiologi membantu memahami manusia dan konteks sosial yang terkait dengan pendampingan.'
  },
  'Komunikasi dan Penyiaran Islam': {
    options: ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Arab', 'Bahasa Inggris Tingkat Lanjut'],
    note: 'KPI sangat terkait dengan kemampuan bahasa dan komunikasi; Bahasa Arab memberi nilai tambah pada kajian dan penyiaran keislaman.'
  },
  'Manajemen Dakwah': {
    options: ['Bahasa Arab', 'Ekonomi', 'Produk/Projek Kreatif dan Kewirausahaan'],
    note: 'Manajemen Dakwah memerlukan kemampuan memahami sumber keislaman sekaligus pengelolaan organisasi dan program.'
  },
  'Ekonomi Syariah': {
    options: ['Ekonomi', 'Matematika Tingkat Lanjut'],
    note: 'Ekonomi Syariah kuat pada Ekonomi dan kemampuan kuantitatif; Bahasa Arab tetap sangat baik diperdalam sebagai penguatan literatur syariah.'
  },
  'Perbankan Syariah': {
    options: ['Ekonomi', 'Matematika Tingkat Lanjut'],
    note: 'Perbankan Syariah membutuhkan penguatan Ekonomi dan kemampuan kuantitatif; Bahasa Arab dapat menjadi penguatan tambahan untuk terminologi syariah.'
  },



  'Ilmu Tasawuf': {
    options: ['Bahasa Arab', 'Sosiologi'],
    note: 'Ilmu Tasawuf memerlukan Bahasa Arab untuk akses literatur klasik dan Sosiologi untuk membaca konteks manusia serta masyarakat.'
  },
  'Bimbingan Penyuluhan Islam': {
    options: ['Sosiologi', 'Bahasa Arab'],
    note: 'Bimbingan Penyuluhan Islam berkaitan dengan manusia, komunikasi pendampingan, masyarakat, dan literatur keislaman.'
  },

  'Bimbingan dan Konseling Islam': {
    options: ['Sosiologi', 'Bahasa Arab'],
    note: 'BKI memerlukan pemahaman manusia dan masyarakat, ditopang Bahasa Arab untuk literatur keislaman.'
  },
  'Pengembangan Masyarakat Islam': {
    options: ['Sosiologi', 'Bahasa Arab'],
    note: 'PMI kuat pada kajian sosial kemasyarakatan dan penguatan literatur keislaman.'
  },
  'Sosiologi Agama': {
    options: ['Sosiologi', 'Bahasa Arab'],
    note: 'Sosiologi Agama menggabungkan pemahaman masyarakat dan kajian agama.'
  },

  'Desain Komunikasi Visual': {
    options: [],
    customLabel: 'Seni Budaya (pendukung prodi; bukan mapel pilihan TKA)',
    note: 'Untuk Desain, Seni Budaya menjadi mapel pendukung prodi, tetapi bukan salah satu mapel pilihan TKA SMA saat ini.'
  },
  'Arsitektur': {
    options: ['Fisika'],
    customLabel: 'Matematika juga relevan sebagai mapel pendukung dan sudah termasuk mapel wajib TKA',
    note: 'Arsitektur didukung Matematika dan/atau Fisika.'
  },
  'Film': {
    options: [],
    customLabel: 'Seni Budaya (pendukung prodi; bukan mapel pilihan TKA)',
    note: 'Untuk jalur seni/film, Seni Budaya relevan sebagai pendukung prodi.'
  },
  'Seni Musik': {
    options: [],
    customLabel: 'Seni Budaya (pendukung prodi; bukan mapel pilihan TKA)',
    note: 'Untuk jalur seni musik, Seni Budaya relevan sebagai pendukung prodi.'
  },
  'Fashion Design': {
    options: [],
    customLabel: 'Seni Budaya (pendukung prodi; bukan mapel pilihan TKA)',
    note: 'Untuk jalur desain/fashion, Seni Budaya relevan sebagai pendukung prodi.'
  }
};

const clusterFallbacks = {
  'Sains & Teknologi': ['Matematika Tingkat Lanjut', 'Fisika'],
  'Kesehatan': ['Biologi', 'Kimia'],
  'Pendidikan & Humaniora': ['Bahasa Indonesia Tingkat Lanjut', 'Bahasa Inggris Tingkat Lanjut'],
  'Bisnis, Ekonomi & Manajemen': ['Ekonomi', 'Produk/Projek Kreatif dan Kewirausahaan'],
  'Hukum & Kebijakan': ['Pendidikan Pancasila/PPKn', 'Sosiologi'],
  'Psikologi & Sosial': ['Sosiologi', 'Bahasa Inggris Tingkat Lanjut'],
  'Seni & Industri Kreatif': ['Fisika']
};

export function getMajorTkaInfo(major){
  return TKA_MAJOR_MAP[major] || {
    options: [],
    customLabel: 'Sesuaikan dengan prodi target dan mapel yang tercantum di rapor',
    note: 'Belum ada pemetaan khusus untuk nama prodi ini di basis data aplikasi.'
  };
}

export function buildTkaGuidance(recommendations=[]){
  const top = recommendations?.[0];
  if(!top) return {
    required: TKA_REQUIRED,
    priorityElectives: [],
    majorBreakdown: [],
    note: 'Pilih 2 mapel pilihan TKA yang paling relevan dengan prodi target dan rekam belajar.'
  };

  const majorBreakdown = (top.majors || []).map(major => ({ major, ...getMajorTkaInfo(major) }));
  const islamicMajorBreakdown = (top.islamicMajors || []).map(major => ({ major, ...getMajorTkaInfo(major) }));
  const counts = new Map();
  const order = [];
  majorBreakdown.forEach(item => {
    item.options.forEach(subject => {
      if(!TKA_ELECTIVE_SUBJECTS.includes(subject)) return;
      if(!counts.has(subject)) order.push(subject);
      counts.set(subject, (counts.get(subject) || 0) + 1);
    });
  });

  let priorityElectives = [...counts.entries()]
    .sort((a,b) => (b[1]-a[1]) || (order.indexOf(a[0])-order.indexOf(b[0])))
    .map(([subject]) => subject)
    .slice(0,2);

  if(priorityElectives.length < 2){
    for(const fallback of (clusterFallbacks[top.cluster] || [])){
      if(TKA_ELECTIVE_SUBJECTS.includes(fallback) && !priorityElectives.includes(fallback)){
        priorityElectives.push(fallback);
      }
      if(priorityElectives.length >= 2) break;
    }
  }

  // Jangan paksa dua mapel jika fallback berisiko tidak relevan untuk semua prodi kreatif/kependidikan.
  if(['Seni & Industri Kreatif'].includes(top.cluster)){
    priorityElectives = priorityElectives.slice(0,1);
  }

  const islamicCounts = new Map();
  const islamicOrder = [];
  islamicMajorBreakdown.forEach(item => {
    item.options.forEach(subject => {
      if(!TKA_ELECTIVE_SUBJECTS.includes(subject)) return;
      if(!islamicCounts.has(subject)) islamicOrder.push(subject);
      islamicCounts.set(subject, (islamicCounts.get(subject) || 0) + 1);
    });
  });
  const islamicPriorityElectives = [...islamicCounts.entries()]
    .sort((a,b) => (b[1]-a[1]) || (islamicOrder.indexOf(a[0])-islamicOrder.indexOf(b[0])))
    .map(([subject]) => subject)
    .slice(0,2);

  return {
    required: TKA_REQUIRED,
    priorityElectives,
    islamicPriorityElectives,
    majorBreakdown,
    islamicMajorBreakdown,
    cluster: top.cluster,
    percent: top.percent,
    note: 'Gunakan rekomendasi ini sebagai panduan awal. Pilihan final tetap harus disesuaikan dengan prodi target dan mapel yang tercantum di rapor.'
  };
}
