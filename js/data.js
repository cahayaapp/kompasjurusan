export const RIASEC_INFO = {
  R: { label: 'Realistic', emoji: '🛠️', desc: 'Suka hal praktis, teknis, membuat, memperbaiki, atau bekerja dengan alat dan sistem nyata.' },
  I: { label: 'Investigative', emoji: '🔬', desc: 'Suka menganalisis, meneliti, berhitung, dan memecahkan masalah secara logis.' },
  A: { label: 'Artistic', emoji: '🎨', desc: 'Suka mengekspresikan ide, menulis, mendesain, dan membuat karya kreatif.' },
  S: { label: 'Social', emoji: '🤝', desc: 'Suka membantu, mengajar, membimbing, dan bekerja untuk manfaat orang lain.' },
  E: { label: 'Enterprising', emoji: '🚀', desc: 'Suka memimpin, memengaruhi, mengorganisasi, dan menggerakkan ide menjadi aksi.' },
  C: { label: 'Conventional', emoji: '📊', desc: 'Suka ketertiban, detail, administrasi, data, dan sistem yang rapi.' }
};

const riasecItems = {
  R: [
    'Saya menikmati kegiatan memperbaiki alat, perangkat, atau benda yang rusak.',
    'Saya tertarik memahami cara kerja mesin, listrik, atau peralatan teknis.',
    'Saya lebih suka praktik langsung daripada hanya teori.',
    'Saya nyaman mengerjakan tugas lapangan yang membutuhkan ketahanan fisik.',
    'Saya tertarik dengan kegiatan merancang atau membuat sesuatu dari nol.',
    'Saya senang menggunakan alat bantu, perlengkapan, atau teknologi praktis.',
    'Saya tertarik dengan pekerjaan yang menghasilkan produk nyata.',
    'Saya suka mempelajari proses kerja yang terstruktur dan operasional.'
  ],
  I: [
    'Saya suka mencari penyebab mengapa suatu masalah bisa terjadi.',
    'Saya tertarik pada eksperimen, riset, atau pengujian gagasan.',
    'Saya senang membaca penjelasan mendalam untuk memahami suatu konsep.',
    'Saya suka tugas yang menantang logika dan analisis saya.',
    'Saya tertarik pada data, angka, dan pola hubungan antarinformasi.',
    'Saya menikmati proses memecahkan masalah yang jawabannya tidak langsung terlihat.',
    'Saya lebih puas jika dapat memahami alasan di balik suatu jawaban.',
    'Saya tertarik pada pelajaran yang menuntut berpikir kritis.'
  ],
  A: [
    'Saya suka menulis, membuat konten, atau menyusun ide dengan gaya saya sendiri.',
    'Saya tertarik pada desain visual, estetika, atau penyusunan tampilan.',
    'Saya menikmati kegiatan kreatif seperti menggambar, mengedit, atau membuat karya.',
    'Saya suka memikirkan cara baru yang unik dalam menyampaikan sesuatu.',
    'Saya senang jika diberi ruang untuk berekspresi dalam tugas.',
    'Saya tertarik pada dunia komunikasi kreatif, media, atau seni.',
    'Saya menikmati kegiatan bercerita, presentasi, atau menyusun narasi.',
    'Saya suka jika hasil kerja saya punya sentuhan pribadi dan tidak monoton.'
  ],
  S: [
    'Saya merasa senang ketika bisa membantu orang memahami sesuatu.',
    'Saya tertarik menjadi pendamping, pembimbing, atau pengajar.',
    'Saya nyaman mendengarkan cerita dan kesulitan orang lain.',
    'Saya suka bekerja dalam peran yang bermanfaat bagi orang banyak.',
    'Saya ingin pekerjaan saya kelak punya dampak langsung untuk sesama.',
    'Saya suka suasana kerja yang penuh interaksi manusia.',
    'Saya sering terdorong memberi dukungan kepada teman yang sedang kesulitan.',
    'Saya tertarik pada dunia pendidikan, pelayanan, kesehatan, atau pengembangan manusia.'
  ],
  E: [
    'Saya suka mengambil inisiatif ketika melihat peluang atau masalah.',
    'Saya tertarik memimpin kegiatan, tim, atau proyek.',
    'Saya nyaman berbicara di depan orang dan meyakinkan mereka.',
    'Saya tertarik pada dunia bisnis, pemasaran, atau organisasi.',
    'Saya suka menetapkan target lalu menggerakkan orang untuk mencapainya.',
    'Saya senang ketika diberi kepercayaan mengatur sesuatu.',
    'Saya tertarik mencari cara agar ide bisa berjalan nyata.',
    'Saya suka tantangan yang melibatkan keberanian mengambil keputusan.'
  ],
  C: [
    'Saya nyaman dengan tugas yang membutuhkan kerapian, ketelitian, dan urutan jelas.',
    'Saya suka menyusun data, dokumen, atau informasi agar mudah dipakai.',
    'Saya merasa tenang jika sistem kerja berjalan rapi dan teratur.',
    'Saya tertarik pada administrasi, keuangan, atau pengelolaan data.',
    'Saya suka membuat daftar, catatan, atau pelacakan proses.',
    'Saya teliti ketika memeriksa kesalahan kecil dalam tugas.',
    'Saya lebih nyaman bila target, aturan, dan prosedur dijelaskan dengan jelas.',
    'Saya menikmati pekerjaan yang membutuhkan konsistensi dan akurasi.'
  ]
};

const valueItems = {
  mission: [
    'Saya ingin kuliah yang kelak membuat saya merasa berguna bagi banyak orang.',
    'Bagi saya, pilihan jurusan harus selaras dengan tujuan hidup yang lebih besar.',
    'Saya ingin pekerjaan masa depan saya membawa manfaat yang nyata bagi masyarakat.',
    'Saya mempertimbangkan jurusan dari sejauh mana ia bisa menjadi ladang kontribusi.'
  ],
  security: [
    'Saya cenderung mempertimbangkan kestabilan masa depan saat memilih jurusan.',
    'Saya merasa penting memilih jalur studi yang punya prospek kerja jelas.',
    'Keamanan finansial merupakan pertimbangan penting bagi saya.',
    'Saya menyukai jalur yang memberi kepastian dan struktur masa depan.'
  ],
  growth: [
    'Saya ingin kuliah yang menantang saya untuk terus berkembang.',
    'Saya senang bila suatu jurusan membuat saya terus belajar hal baru.',
    'Saya tertarik pada pilihan studi yang bisa memperluas wawasan saya.',
    'Saya siap berjuang untuk jalur yang memberi pertumbuhan diri tinggi.'
  ],
  flexibility: [
    'Saya tertarik pada jalur karier yang memberi kebebasan mengatur cara bekerja.',
    'Saya menghargai jurusan yang membuka banyak pilihan karier.',
    'Saya suka kemungkinan bekerja lintas bidang atau peran.',
    'Saya menyukai masa depan yang memberi ruang untuk berinovasi dan tidak kaku.'
  ],
  impact: [
    'Saya tertarik pada bidang yang dapat memberi pengaruh luas.',
    'Saya senang jika karya saya nanti bisa dirasakan banyak orang.',
    'Saya ingin bekerja di bidang yang memungkinkan saya menjadi penggerak perubahan.',
    'Saya tertarik pada jalur studi yang bisa membuat saya hadir sebagai pemecah masalah.'
  ],
  spirituality: [
    'Saya ingin pilihan kuliah saya mendukung misi hidup yang bernilai dan bermakna.',
    'Saya lebih tenang jika bidang yang saya pilih terasa selaras dengan nilai-nilai kebaikan.',
    'Saya ingin ilmu yang saya pelajari kelak menjadi sarana ibadah dan pelayanan.',
    'Saya mempertimbangkan lingkungan belajar yang baik bagi pertumbuhan karakter saya.'
  ]
};

const workstyleItems = {
  discipline: [
    'Saya relatif konsisten menyelesaikan tugas sampai tuntas.',
    'Saya cukup teratur dalam mengatur waktu dan prioritas.',
    'Saya dapat tetap bekerja meskipun tugas terasa berat atau membosankan.'
  ],
  collaboration: [
    'Saya nyaman bekerja sama dalam tim dan berbagi tanggung jawab.',
    'Saya mampu menyesuaikan diri dengan gaya kerja orang lain.',
    'Saya tidak kesulitan berdiskusi untuk menyatukan ide.'
  ],
  leadership: [
    'Saya cukup percaya diri memimpin tugas atau kelompok kecil.',
    'Saya berani mengambil keputusan ketika diperlukan.',
    'Saya mudah terdorong mengambil peran pengarah dalam sebuah kegiatan.'
  ],
  communication: [
    'Saya bisa menyampaikan ide saya dengan cukup jelas.',
    'Saya nyaman berbicara di depan orang atau menjelaskan sesuatu.',
    'Saya mampu menulis atau menyusun pesan dengan terstruktur.'
  ],
  resilience: [
    'Ketika gagal atau salah, saya biasanya bisa bangkit dan mencoba lagi.',
    'Saya cukup tahan menghadapi tekanan dalam tugas.',
    'Saya tetap berusaha meski hasil awal belum sesuai harapan.'
  ],
  independence: [
    'Saya dapat belajar atau bekerja mandiri tanpa harus selalu diarahkan.',
    'Saya mampu mencari jalan keluar sendiri sebelum meminta bantuan.',
    'Saya cukup inisiatif memulai tugas tanpa menunggu didorong terus-menerus.'
  ]
};

const academicItems = {
  numerik: [
    'Saya cukup kuat dalam memahami angka, hitungan, atau pola numerik.',
    'Saya relatif mudah memahami soal yang melibatkan perbandingan atau logika angka.',
    'Saya merasa nyaman dengan pelajaran atau tugas yang membutuhkan perhitungan.'
  ],
  verbal: [
    'Saya cukup mudah memahami bacaan dan menangkap inti pembahasan.',
    'Saya relatif kuat menyusun kata, kalimat, atau penjelasan tertulis.',
    'Saya nyaman mempelajari materi melalui membaca dan memahami konsepnya.'
  ],
  logika: [
    'Saya suka menyusun alasan yang runtut untuk mengambil kesimpulan.',
    'Saya cukup baik melihat hubungan sebab-akibat dalam suatu persoalan.',
    'Saya relatif cepat mengenali pola dalam sebuah masalah.'
  ],
  sosial: [
    'Saya cukup peka memahami perilaku, kebutuhan, atau perasaan orang lain.',
    'Saya bisa membaca dinamika kelompok dan hubungan antarmanusia dengan cukup baik.',
    'Saya tertarik memahami bagaimana manusia belajar, berpikir, atau berinteraksi.'
  ],
  digital: [
    'Saya cukup cepat beradaptasi dengan aplikasi, sistem, atau perangkat digital baru.',
    'Saya tertarik mengeksplorasi teknologi untuk mempermudah pekerjaan.',
    'Saya nyaman bekerja menggunakan media digital atau platform daring.'
  ],
  visual: [
    'Saya cukup baik memahami tampilan visual, diagram, atau susunan ruang.',
    'Saya mudah melihat ketidaksesuaian tata letak atau detail visual.',
    'Saya tertarik pada kegiatan yang melibatkan visualisasi atau penyajian tampilan.'
  ]
};

const scaleLabels = {
  1: { title: 'Sangat tidak sesuai', desc: 'Hampir tidak menggambarkan diriku.' },
  2: { title: 'Kurang sesuai', desc: 'Kadang sedikit, tetapi tidak dominan.' },
  3: { title: 'Cukup sesuai', desc: 'Lumayan menggambarkan diriku.' },
  4: { title: 'Sesuai', desc: 'Sering menggambarkan diriku.' },
  5: { title: 'Sangat sesuai', desc: 'Sangat kuat menggambarkan diriku.' }
};

function makeSection(domainKey, title, items, code, startIndex = 1){
  return items.map((text, idx) => ({
    id: `${domainKey}-${code}-${idx + startIndex}`,
    section: domainKey,
    code,
    title,
    prompt: text
  }));
}

let questions = [];
Object.entries(riasecItems).forEach(([code, items]) => {
  questions.push(...makeSection('riasec', 'Minat dan kecenderungan', items, code));
});
Object.entries(valueItems).forEach(([code, items]) => {
  questions.push(...makeSection('values', 'Nilai hidup', items, code));
});
Object.entries(workstyleItems).forEach(([code, items]) => {
  questions.push(...makeSection('workstyle', 'Gaya kerja', items, code));
});
Object.entries(academicItems).forEach(([code, items]) => {
  questions.push(...makeSection('academic', 'Kekuatan akademik', items, code));
});

export const QUESTION_SECTIONS = {
  riasec: 'Minat dan kecenderungan',
  values: 'Nilai hidup',
  workstyle: 'Gaya kerja',
  academic: 'Kekuatan akademik'
};

export { questions as QUESTIONS, scaleLabels as SCALE_LABELS };

export const MAJOR_CLUSTERS = [
  { key:'technology', name:'Teknologi & Rekayasa', majors:['Informatika','Sistem Informasi','Teknik Industri','Teknik Elektro'], weights:{ I:1.1, R:1.0, C:.9, digital:1.0, logika:1.0, numerik:.85, discipline:.75, growth:.45, security:.2 } },
  { key:'science', name:'Sains & Kesehatan', majors:['Kedokteran','Farmasi','Biologi','Gizi'], weights:{ I:1.05, S:.65, numerik:.6, logika:.9, mission:.5, impact:.5, resilience:.45, discipline:.55 } },
  { key:'business', name:'Bisnis & Manajemen', majors:['Manajemen','Akuntansi','Bisnis Digital','Kewirausahaan'], weights:{ E:1.0, C:.75, communication:.7, leadership:.8, security:.45, impact:.35, flexibility:.3 } },
  { key:'education', name:'Pendidikan & Pelayanan Manusia', majors:['Pendidikan','Psikologi','Bimbingan Konseling','Ilmu Keperawatan'], weights:{ S:1.1, verbal:.7, sosial:1.0, mission:.8, spirituality:.55, collaboration:.45, communication:.55 } },
  { key:'communication', name:'Komunikasi & Industri Kreatif', majors:['Ilmu Komunikasi','Desain Komunikasi Visual','Sastra','Broadcasting'], weights:{ A:1.0, E:.45, verbal:.75, visual:.75, communication:.7, flexibility:.45, impact:.25 } },
  { key:'public', name:'Sosial, Hukum & Kepemimpinan Publik', majors:['Hukum','Ilmu Politik','Hubungan Internasional','Administrasi Publik'], weights:{ E:.85, S:.55, verbal:.75, logika:.7, leadership:.7, impact:.55, mission:.35 } },
  { key:'islamic', name:'Keislaman & Pemberdayaan Umat', majors:['Pendidikan Agama Islam','Ekonomi Syariah','Komunikasi Penyiaran Islam','Hukum Keluarga Islam'], weights:{ S:.75, E:.35, verbal:.6, mission:.9, spirituality:1.0, impact:.5, communication:.4 } },
  { key:'environment', name:'Lingkungan, Pertanian & Sumber Daya', majors:['Agroteknologi','Kehutanan','Peternakan','Perikanan'], weights:{ R:.95, I:.7, mission:.35, impact:.45, resilience:.5, discipline:.5, growth:.25 } }
];

export function defaultPublicSettings(){
  return {
    price: 59000,
    bankName: 'Bank Syariah Indonesia',
    accountNumber: '0000000000',
    accountName: 'Kompas Jurusan Cahaya'
  };
}
