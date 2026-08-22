export const QUESTION_SECTIONS = {
  riasec: 'Minat RIASEC',
  values: 'Nilai Hidup',
  workstyle: 'Gaya Kerja',
  academic: 'Kekuatan Akademik'
};

export const SCALE_LABELS = {
  1: { title: 'Sangat tidak sesuai', desc: 'Hampir tidak menggambarkan diriku.' },
  2: { title: 'Tidak sesuai', desc: 'Sedikit menggambarkan, tetapi tidak dominan.' },
  3: { title: 'Cukup sesuai', desc: 'Kadang terasa cocok dalam situasi tertentu.' },
  4: { title: 'Sesuai', desc: 'Lumayan sering menggambarkan diriku.' },
  5: { title: 'Sangat sesuai', desc: 'Sangat menggambarkan diriku saat ini.' }
};

export const RIASEC_INFO = {
  R: { label: 'Realistic', description: 'Suka praktik, alat, kerja nyata, dan aktivitas lapangan.' },
  I: { label: 'Investigative', description: 'Suka analisis, riset, sains, logika, dan pemecahan masalah.' },
  A: { label: 'Artistic', description: 'Suka kreativitas, ide, seni, ekspresi, dan desain.' },
  S: { label: 'Social', description: 'Suka membantu, membimbing, melayani, dan berinteraksi dengan orang.' },
  E: { label: 'Enterprising', description: 'Suka memimpin, meyakinkan, menggerakkan, dan berwirausaha.' },
  C: { label: 'Conventional', description: 'Suka keteraturan, detail, administrasi, dan sistem yang rapi.' }
};

const riasecPrompts = {
  R: [
    'Aku menikmati kegiatan praktik langsung daripada hanya teori.',
    'Aku tertarik pada alat, mesin, atau perakitan sesuatu.',
    'Aku suka mempelajari cara kerja benda secara nyata.',
    'Kegiatan lapangan terasa menarik bagiku.',
    'Aku senang menyelesaikan tugas yang hasilnya terlihat jelas.',
    'Aku nyaman belajar melalui praktik dan demonstrasi.'
  ],
  I: [
    'Aku suka menganalisis penyebab suatu masalah.',
    'Aku tertarik pada sains, penelitian, atau eksperimen.',
    'Aku menikmati pertanyaan yang menuntut logika mendalam.',
    'Aku senang mencari tahu mengapa sesuatu bisa terjadi.',
    'Aku suka membaca atau meneliti topik sampai tuntas.',
    'Aku menikmati tugas yang menantang pikiran dan penalaran.'
  ],
  A: [
    'Aku suka menuangkan ide dengan cara yang kreatif.',
    'Aku tertarik pada seni, desain, tulisan, atau ekspresi visual.',
    'Aku senang membuat sesuatu yang unik dan berbeda.',
    'Aku mudah mendapatkan ide baru untuk sebuah karya.',
    'Aku suka kebebasan dalam mengekspresikan diri.',
    'Aku merasa hidup saat mengerjakan hal-hal kreatif.'
  ],
  S: [
    'Aku suka membantu orang yang sedang mengalami kesulitan.',
    'Aku menikmati kegiatan mengajar, membimbing, atau mendampingi.',
    'Aku peka terhadap perasaan orang lain.',
    'Aku senang ketika bisa membuat orang lain berkembang.',
    'Aku merasa nyaman bekerja bersama banyak orang.',
    'Aku tertarik pada pekerjaan yang memberi manfaat langsung bagi orang lain.'
  ],
  E: [
    'Aku suka memimpin kelompok untuk mencapai tujuan tertentu.',
    'Aku nyaman berbicara di depan orang lain.',
    'Aku senang memengaruhi atau meyakinkan orang tentang suatu gagasan.',
    'Aku tertarik pada bisnis, organisasi, atau proyek yang digerakkan target.',
    'Aku suka mengambil inisiatif daripada menunggu arahan.',
    'Aku bersemangat ketika diberi kesempatan mengatur atau mengelola.'
  ],
  C: [
    'Aku menyukai tugas yang rapi, sistematis, dan teratur.',
    'Aku nyaman mengikuti prosedur yang jelas.',
    'Aku teliti saat bekerja dengan data, angka, atau dokumen.',
    'Aku suka membuat daftar, jadwal, atau struktur kerja.',
    'Aku menikmati pekerjaan administrasi yang butuh ketelitian.',
    'Aku lebih tenang jika semua hal tertata rapi.'
  ]
};

const valuesPrompts = {
  mission: [
    'Aku ingin pilihan jurusanku punya makna dan manfaat yang besar.',
    'Aku lebih tertarik pada jalan hidup yang terasa bermakna.',
    'Aku ingin pekerjaanku nanti menjadi sarana kontribusi yang nyata.',
    'Aku peduli pada dampak jangka panjang dari pekerjaan yang kupilih.',
    'Aku ingin belajar di bidang yang terasa selaras dengan panggilan hidupku.',
    'Aku mempertimbangkan nilai kebaikan saat memilih jurusan.'
  ],
  security: [
    'Aku mempertimbangkan kestabilan masa depan ketika memilih jurusan.',
    'Aku lebih tenang jika bidang yang kupilih punya peluang kerja yang jelas.',
    'Keamanan finansial cukup penting bagiku.',
    'Aku memperhatikan prospek kerja saat menimbang pilihan studi.',
    'Aku tidak ingin mengambil pilihan yang terlalu berisiko.',
    'Aku cenderung memilih jalur yang aman dan realistis.'
  ],
  growth: [
    'Aku ingin terus berkembang dan menantang diriku sendiri.',
    'Aku suka bidang yang membuatku belajar hal baru terus-menerus.',
    'Aku senang jika sebuah jurusan mendorong pertumbuhan diri.',
    'Aku tertarik pada lingkungan belajar yang menantang.',
    'Aku menghargai proses menjadi versi diriku yang lebih baik.',
    'Aku menikmati kesempatan untuk memperluas wawasan.'
  ],
  flexibility: [
    'Aku menyukai kebebasan dalam mengatur cara belajar dan bekerja.',
    'Aku lebih tertarik pada bidang yang memberi banyak pilihan jalur karier.',
    'Aku tidak terlalu suka sistem yang kaku.',
    'Fleksibilitas menjadi pertimbangan saat memilih jurusan.',
    'Aku suka ruang untuk mengeksplorasi banyak kemungkinan.',
    'Aku nyaman pada bidang yang memungkinkan variasi aktivitas.'
  ],
  impact: [
    'Aku ingin pekerjaan yang kupilih membawa pengaruh nyata.',
    'Aku tertarik pada jalur karier yang bisa mengubah keadaan menjadi lebih baik.',
    'Aku ingin hasil belajarku nanti terasa berguna bagi masyarakat.',
    'Dampak sosial dari profesi cukup penting bagiku.',
    'Aku ingin karya atau pekerjaanku kelak terasa berarti bagi banyak orang.',
    'Aku ingin berkontribusi pada sesuatu yang lebih besar dari diriku.'
  ],
  spirituality: [
    'Aku ingin pilihan jurusanku selaras dengan nilai hidup dan keyakinanku.',
    'Aku mempertimbangkan keberkahan dan arah hidup saat memilih studi.',
    'Aku ingin menempuh jalan yang menenangkan hati dan nurani.',
    'Nilai kebaikan dan makna batin penting dalam keputusan akademikku.',
    'Aku ingin ilmu yang kupelajari mendekatkanku pada tujuan hidup yang lebih luhur.',
    'Aku peduli bahwa jalan studiku tetap selaras dengan prinsip yang kupegang.'
  ]
};

const workstylePrompts = {
  discipline: [
    'Aku mampu menyelesaikan tugas sesuai jadwal.',
    'Aku cukup tertib dalam menjalankan tanggung jawab.',
    'Aku berusaha konsisten meski tugas terasa tidak menarik.',
    'Aku terbiasa membuat prioritas kerja atau belajar.',
    'Aku cukup disiplin dalam menjaga ritme belajarku.',
    'Aku mampu fokus sampai tugas selesai.'
  ],
  collaboration: [
    'Aku nyaman belajar atau bekerja dalam tim.',
    'Aku suka bertukar ide dengan orang lain.',
    'Aku bisa bekerja sama meski pendapat kami berbeda.',
    'Aku senang jika hasil yang baik dicapai bersama-sama.',
    'Aku mau mendengar dan menyesuaikan diri dalam kerja kelompok.',
    'Aku lebih bersemangat saat ada kolaborasi yang sehat.'
  ],
  leadership: [
    'Aku cukup siap mengambil peran memimpin bila dibutuhkan.',
    'Aku mampu mengarahkan teman menuju target bersama.',
    'Aku suka memikirkan strategi agar sebuah tugas berjalan baik.',
    'Aku nyaman menjadi penanggung jawab sebuah kegiatan.',
    'Aku bisa membuat keputusan saat kelompok membutuhkan arah.',
    'Aku punya dorongan untuk menggerakkan orang lain secara positif.'
  ],
  communication: [
    'Aku mudah menyampaikan ide secara jelas.',
    'Aku cukup nyaman menjelaskan sesuatu kepada orang lain.',
    'Aku mampu mengungkapkan pendapat dengan terstruktur.',
    'Aku cukup percaya diri saat berbicara di forum kecil maupun besar.',
    'Aku suka berdialog dan bertanya untuk memperjelas sesuatu.',
    'Aku mampu menyesuaikan cara komunikasi dengan lawan bicara.'
  ],
  resilience: [
    'Aku tidak mudah menyerah saat menghadapi kesulitan.',
    'Aku mampu bangkit lagi setelah gagal atau kecewa.',
    'Aku tetap berusaha meski prosesnya panjang.',
    'Tekanan atau tantangan justru sering membuatku belajar lebih banyak.',
    'Aku berusaha tenang saat menghadapi hambatan.',
    'Aku cukup tahan menghadapi proses yang tidak instan.'
  ],
  independence: [
    'Aku bisa belajar mandiri tanpa harus selalu diarahkan.',
    'Aku mampu mengambil langkah awal sebelum diminta.',
    'Aku cukup bertanggung jawab terhadap proses belajarku sendiri.',
    'Aku suka mencari sumber belajar tambahan secara mandiri.',
    'Aku bisa mengatur diri ketika bekerja sendiri.',
    'Aku tidak terlalu bergantung pada dorongan orang lain untuk memulai.'
  ]
};

const academicPrompts = {
  numerik: [
    'Aku cukup nyaman bekerja dengan angka dan hitungan.',
    'Aku bisa memahami pola dalam data atau perhitungan.',
    'Pelajaran yang berhubungan dengan angka terasa cukup bisa kuikuti.',
    'Aku menikmati tantangan soal yang membutuhkan hitungan.',
    'Aku relatif teliti saat mengerjakan soal numerik.',
    'Aku tertarik mempelajari logika angka dan kuantitatif.'
  ],
  verbal: [
    'Aku cukup mudah memahami bacaan atau penjelasan tertulis.',
    'Aku suka merangkai kata atau menyusun penjelasan.',
    'Aku mampu menangkap ide utama dari sebuah teks.',
    'Aku menikmati diskusi, membaca, atau menulis.',
    'Aku cukup baik dalam menjelaskan sesuatu dengan kata-kata.',
    'Aku merasa kuat dalam pemahaman bahasa.'
  ],
  logika: [
    'Aku suka memecahkan soal dengan langkah berpikir runtut.',
    'Aku bisa melihat hubungan sebab-akibat dengan cukup baik.',
    'Aku menikmati teka-teki, pola, atau soal penalaran.',
    'Aku berusaha mencari alasan yang masuk akal sebelum mengambil kesimpulan.',
    'Aku cukup kuat dalam berpikir sistematis.',
    'Aku suka menyusun argumen yang logis.'
  ],
  sosial: [
    'Aku mudah memahami situasi sosial di sekitarku.',
    'Aku dapat membaca kebutuhan atau reaksi orang lain dengan cukup baik.',
    'Aku cukup cepat menyesuaikan diri dalam lingkungan sosial.',
    'Aku peka terhadap dinamika kelompok.',
    'Aku punya kemampuan membangun relasi yang hangat.',
    'Aku cukup baik memahami orang melalui interaksi.'
  ],
  digital: [
    'Aku tertarik pada teknologi, aplikasi, atau perangkat digital.',
    'Aku cepat belajar menggunakan alat atau platform digital baru.',
    'Aku suka mencari solusi dengan bantuan teknologi.',
    'Aku merasa cukup nyaman dengan dunia komputer atau internet.',
    'Aku tertarik mengeksplorasi cara kerja aplikasi atau sistem.',
    'Aku cukup mudah beradaptasi pada perkembangan teknologi.'
  ],
  visual: [
    'Aku mudah memahami informasi melalui gambar, diagram, atau tampilan visual.',
    'Aku cukup peka terhadap bentuk, warna, dan tata letak.',
    'Aku suka membuat ringkasan visual atau skema.',
    'Aku lebih cepat paham bila sesuatu ditunjukkan secara visual.',
    'Aku tertarik pada hal-hal yang berhubungan dengan desain atau presentasi visual.',
    'Aku mampu melihat detail visual dengan cukup baik.'
  ]
};

function makeQuestions(section, code, prompts, prefix) {
  return prompts.map((prompt, idx) => ({
    id: `${prefix}${String(idx + 1).padStart(2, '0')}`,
    section,
    code,
    prompt
  }));
}

export const QUESTIONS = [
  ...Object.entries(riasecPrompts).flatMap(([code, prompts], i) => makeQuestions('riasec', code, prompts, `R${i+1}`)),
  ...Object.entries(valuesPrompts).flatMap(([code, prompts], i) => makeQuestions('values', code, prompts.slice(0,4), `V${i+1}`)),
  ...Object.entries(workstylePrompts).flatMap(([code, prompts], i) => makeQuestions('workstyle', code, prompts.slice(0,4), `W${i+1}`)),
  ...Object.entries(academicPrompts).flatMap(([code, prompts], i) => makeQuestions('academic', code, prompts.slice(0,4), `A${i+1}`))
];

export const MAJOR_CLUSTERS = [
  {
    name: 'Sains & Teknologi',
    majors: ['Teknik Informatika', 'Data Science', 'Statistika', 'Teknik Industri', 'Sistem Informasi'],
    islamicMajors: ['Ilmu Falak'],
    weights: { I: .28, R: .12, numerik: .18, logika: .18, digital: .16, discipline: .08 }
  },
  {
    name: 'Kesehatan',
    majors: ['Kedokteran', 'Farmasi', 'Keperawatan', 'Gizi', 'Kesehatan Masyarakat'],
    islamicMajors: [],
    weights: { I: .22, S: .16, sosial: .12, numerik: .12, resilience: .1, mission: .12, spirituality: .08, discipline: .08 }
  },
  {
    name: 'Pendidikan & Humaniora',
    majors: ['Pendidikan', 'Bahasa', 'Sejarah', 'Sastra', 'Bimbingan Konseling'],
    islamicMajors: ['Pendidikan Agama Islam (PAI)', 'Pendidikan Bahasa Arab', 'PGMI', 'Pendidikan Islam Anak Usia Dini (PIAUD)', 'Manajemen Pendidikan Islam', 'Bahasa dan Sastra Arab', "Ilmu Al-Qur'an dan Tafsir", 'Ilmu Hadis', 'Aqidah dan Filsafat Islam', 'Sejarah Peradaban Islam', 'Dirasat Islamiyah', 'Studi Agama-Agama'],
    weights: { S: .22, A: .08, I: .06, verbal: .18, communication: .13, mission: .11, growth: .07, collaboration: .07, sosial: .05, spirituality: .03 }
  },
  {
    name: 'Bisnis, Ekonomi & Manajemen',
    majors: ['Manajemen', 'Bisnis Digital', 'Akuntansi', 'Kewirausahaan', 'Administrasi Bisnis'],
    islamicMajors: ['Ekonomi Syariah', 'Perbankan Syariah', 'Akuntansi Syariah', 'Manajemen Keuangan Syariah', 'Manajemen Bisnis Syariah', 'Manajemen Zakat dan Wakaf', 'Manajemen Haji dan Umrah', 'Manajemen Dakwah'],
    weights: { E: .24, C: .1, numerik: .12, leadership: .14, communication: .12, security: .1, impact: .08, discipline: .1 }
  },
  {
    name: 'Hukum & Kebijakan',
    majors: ['Ilmu Hukum', 'Administrasi Publik', 'Ilmu Politik'],
    islamicMajors: ['Hukum Keluarga Islam (Ahwal Syakhshiyyah)', 'Hukum Ekonomi Syariah (Muamalah)', 'Hukum Tata Negara (Siyasah)', 'Hukum Pidana Islam (Jinayah)', 'Perbandingan Mazhab'],
    weights: { E: .15, S: .12, I: .08, verbal: .17, logika: .13, sosial: .08, communication: .1, impact: .07, discipline: .06, leadership: .04 }
  },
  {
    name: 'Psikologi & Sosial',
    majors: ['Psikologi', 'Sosiologi', 'Ilmu Komunikasi', 'Pekerjaan Sosial', 'Hubungan Internasional'],
    islamicMajors: ['Tasawuf dan Psikoterapi', 'Ilmu Tasawuf', 'Bimbingan dan Konseling Islam', 'Bimbingan Penyuluhan Islam', 'Komunikasi dan Penyiaran Islam', 'Pengembangan Masyarakat Islam', 'Sosiologi Agama'],
    weights: { S: .2, I: .1, verbal: .12, sosial: .18, communication: .12, impact: .1, mission: .1, collaboration: .06, spirituality: .02 }
  },
  {
    name: 'Seni & Industri Kreatif',
    majors: ['Desain Komunikasi Visual', 'Arsitektur', 'Film', 'Seni Musik', 'Fashion Design'],
    islamicMajors: [],
    weights: { A: .28, visual: .18, verbal: .08, flexibility: .1, growth: .1, independence: .08, communication: .08, workstyle: .1 }
  }
];

export function defaultPublicSettings(){
  return {
    price: 59000,
    bankName: 'BSI',
    accountNumber: '1234567890',
    accountName: 'Kompas Jurusan Cahaya'
  };
}
