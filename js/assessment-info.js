import { RIASEC_INFO } from './data.js?v=10.7';

export const ASSESSMENT_INFO = {
  title: 'Mengenal Asesmen Kompas Jurusan',
  intro: 'Kompas Jurusan adalah asesmen pemetaan arah studi dan karier yang membantu peserta memahami rumpun studi dan jurusan yang layak dipertimbangkan berdasarkan pola minat, persepsi kekuatan akademik, nilai hidup, dan gaya kerja. Asesmen ini terdiri dari 108 pernyataan dengan skala respons 1–5. Hasilnya bukan penentu masa depan secara mutlak, melainkan salah satu bahan pertimbangan agar keputusan jurusan dibuat dengan lebih sadar, terarah, dan sesuai dengan profil diri peserta.',
  importanceTitle: 'Mengapa hasil ini penting dijadikan bahan pertimbangan?',
  importanceIntro: 'Memilih jurusan hanya dari satu faktor—misalnya ikut teman, nilai satu mata pelajaran, tren pekerjaan, atau keinginan sesaat—berisiko membuat keputusan terlalu sempit. Kompas Jurusan membaca beberapa sisi diri secara bersamaan sehingga peserta memperoleh gambaran yang lebih utuh.',
  importancePoints: [
    'Minat membantu melihat jenis aktivitas dan bidang yang cenderung membuat peserta tertarik, terlibat, dan bertahan dalam proses belajar.',
    'Kekuatan akademik membantu mengenali bidang belajar yang menurut persepsi peserta terasa lebih menonjol, lebih mudah diikuti, atau lebih menarik untuk dikembangkan.',
    'Nilai hidup membantu melihat hal-hal yang dianggap penting dalam masa depan, seperti makna, kontribusi, keamanan, pertumbuhan, fleksibilitas, dampak, dan keselarasan dengan nilai pribadi.',
    'Gaya kerja membantu mengenali cara peserta menjalani tugas, bekerja sama, berkomunikasi, memimpin, bertahan menghadapi tantangan, dan belajar secara mandiri.'
  ],
  importanceClosing: 'Karena itu, rekomendasi tidak dibangun dari satu skor saja. Arah studi muncul dari kombinasi beberapa dimensi yang kemudian dibandingkan dengan karakteristik rumpun studi. Hasil ini sebaiknya dipadukan dengan nilai rapor, prestasi nyata, pengalaman belajar, kondisi keluarga, informasi kampus, peluang beasiswa, serta diskusi dengan orang tua dan pembimbing. Program studi keislaman tidak dipisahkan menjadi satu rumpun tersendiri. Kompas Jurusan menempatkannya berdasarkan bidang keilmuan terdekat: PAI pada Pendidikan & Humaniora, Hukum Keluarga Islam dan Hukum Ekonomi Syariah pada Hukum & Kebijakan, Ekonomi Syariah dan Perbankan Syariah pada Bisnis, Ekonomi & Manajemen, sedangkan Tasawuf dan Psikoterapi, KPI, serta Manajemen Dakwah ditempatkan pada Psikologi & Sosial. Dengan cara ini, peserta membandingkan program studi berdasarkan karakter bidang ilmunya, bukan hanya berdasarkan label keislamannya.',
  dimensionsTitle: 'Empat dimensi yang dibaca',
  dimensions: [
    {
      key: 'riasec',
      title: '1. Minat RIASEC',
      text: 'RIASEC adalah model minat vokasional yang mengelompokkan kecenderungan aktivitas ke dalam enam tipe: Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional. Profil RIASEC membantu melihat lingkungan belajar dan bidang aktivitas yang secara relatif paling menarik bagi peserta.'
    },
    {
      key: 'academic',
      title: '2. Kekuatan Akademik',
      text: 'Bagian ini memetakan persepsi peserta terhadap kekuatan belajar pada area numerik, verbal, logika, sosial, digital, dan visual. Ini bukan tes kemampuan akademik objektif seperti ujian matematika atau tes IQ; hasilnya menunjukkan bagaimana peserta menilai kecenderungan kekuatan akademiknya sendiri dan perlu dibandingkan dengan nilai rapor serta performa belajar nyata.'
    },
    {
      key: 'values',
      title: '3. Nilai Hidup',
      text: 'Bagian ini membaca hal-hal yang dianggap penting ketika peserta membayangkan masa depan, meliputi makna dan kontribusi, keamanan, pertumbuhan, fleksibilitas, dampak, dan keselarasan spiritual atau nilai pribadi. Dua orang dengan kemampuan yang mirip dapat memilih arah studi berbeda karena nilai hidup yang mereka prioritaskan berbeda.'
    },
    {
      key: 'workstyle',
      title: '4. Gaya Kerja',
      text: 'Bagian ini memetakan kecenderungan peserta dalam disiplin, kolaborasi, kepemimpinan, komunikasi, daya juang, dan kemandirian. Gaya kerja membantu memperkirakan lingkungan belajar dan aktivitas yang lebih nyaman serta pola pengembangan diri yang perlu diperkuat.'
    }
  ],
  riasecTitle: 'Mengenal enam tipe RIASEC',
  riasecIntro: 'RIASEC tidak memberi label mutlak. Setiap peserta memiliki kombinasi beberapa tipe, sedangkan tipe dengan skor lebih tinggi menunjukkan kecenderungan minat yang lebih menonjol saat asesmen dikerjakan.',
  riasecTypes: Object.entries(RIASEC_INFO).map(([code, item]) => ({ code, label: item.label, description: item.description })),
  readingTitle: 'Cara membaca hasil dengan tepat',
  readingPoints: [
    'Persentase kecocokan menunjukkan tingkat keselarasan profil peserta dengan karakteristik rumpun studi dalam model Kompas Jurusan; angka tersebut bukan probabilitas keberhasilan kuliah dan bukan jaminan kecocokan mutlak.',
    'Rumpun dengan skor 80% atau lebih dibaca sebagai Sangat Direkomendasikan, 70–79% Direkomendasikan, 60–69% Layak Dieksplorasi, dan 50–59% sebagai Alternatif. Rekomendasi utama ditampilkan mulai 60%.',
    'Jawaban bersifat self-report, sehingga kualitas hasil sangat dipengaruhi kejujuran dan ketepatan peserta dalam menggambarkan dirinya saat ini. Hasil dapat berubah seiring bertambahnya pengalaman, pengetahuan, dan perkembangan diri.',
    'Keputusan akhir jurusan tetap perlu mempertimbangkan data lain: nilai rapor, prestasi, kemampuan nyata, kondisi kesehatan, biaya, kampus tujuan, peluang beasiswa, dan konsultasi dengan orang tua atau pembimbing.'
  ],
  closing: 'Gunakan Kompas Jurusan sebagai kompas, bukan sebagai vonis. Fungsinya adalah mempersempit pilihan, menjelaskan alasan di balik rekomendasi, dan membantu peserta mengetahui apa yang perlu dieksplorasi serta dipersiapkan berikutnya.'
};

function esc(value=''){
  return String(value).replace(/[&<>'"]/g, ch=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
}

export function renderAssessmentInfoHtml(){
  const info = ASSESSMENT_INFO;
  return `
    <section class="assessment-info-report">
      <div class="assessment-info-heading">
        <span class="assessment-info-kicker">TENTANG ASESMEN</span>
        <h3>${esc(info.title)}</h3>
        <p>${esc(info.intro)}</p>
      </div>

      <div class="assessment-why-card">
        <h4>${esc(info.importanceTitle)}</h4>
        <p>${esc(info.importanceIntro)}</p>
        <div class="assessment-importance-list">
          ${info.importancePoints.map((item,index)=>`<div class="assessment-importance-item"><span>${index+1}</span><p>${esc(item)}</p></div>`).join('')}
        </div>
        <p class="assessment-info-closing-text">${esc(info.importanceClosing)}</p>
      </div>

      <div class="assessment-info-subhead"><h4>${esc(info.dimensionsTitle)}</h4><span>4 dimensi utama</span></div>
      <div class="assessment-dimension-grid">
        ${info.dimensions.map((item,index)=>`<article class="assessment-dimension-card dim-${esc(item.key)}"><div class="dimension-number">0${index+1}</div><h5>${esc(item.title.replace(/^\d+\.\s*/,''))}</h5><p>${esc(item.text)}</p></article>`).join('')}
      </div>

      <div class="assessment-riasec-card">
        <div class="assessment-info-subhead compact"><div><h4>${esc(info.riasecTitle)}</h4><p>${esc(info.riasecIntro)}</p></div></div>
        <div class="riasec-explain-grid">
          ${info.riasecTypes.map(item=>`<div class="riasec-explain-item"><span>${esc(item.code)}</span><div><b>${esc(item.label)}</b><small>${esc(item.description)}</small></div></div>`).join('')}
        </div>
      </div>

      <div class="assessment-reading-card">
        <h4>${esc(info.readingTitle)}</h4>
        <div class="assessment-reading-list">
          ${info.readingPoints.map(item=>`<div><i>✓</i><p>${esc(item)}</p></div>`).join('')}
        </div>
        <div class="assessment-compass-note">${esc(info.closing)}</div>
      </div>
    </section>`;
}
