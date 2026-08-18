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
  'Bisnis & Manajemen': ['Ekonomi', 'Produk/Projek Kreatif dan Kewirausahaan'],
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

  return {
    required: TKA_REQUIRED,
    priorityElectives,
    majorBreakdown,
    cluster: top.cluster,
    percent: top.percent,
    note: 'Gunakan rekomendasi ini sebagai panduan awal. Pilihan final tetap harus disesuaikan dengan prodi target dan mapel yang tercantum di rapor.'
  };
}
