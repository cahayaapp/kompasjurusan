import { QUESTIONS, RIASEC_INFO, MAJOR_CLUSTERS } from './data.js?v=10.6';
import { buildTkaGuidance } from './tka-map.js?v=10.6';

export const RECOMMENDATION_MIN_PERCENT = 60;

const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0;

function groupedScores(answers) {
  const buckets = {};
  QUESTIONS.forEach(q => {
    const val = Number(answers?.[q.id] || 0);
    if(!val) return;
    const key = `${q.section}:${q.code}`;
    (buckets[key] ||= []).push(val);
  });
  const result = {};
  Object.entries(buckets).forEach(([key, vals]) => result[key] = avg(vals));
  return result;
}

function normalize(score){
  return Math.round((score / 5) * 100);
}

export function getFitInterpretation(percent){
  const p = Number(percent || 0);
  if(p >= 80) return {
    key:'very-strong',
    label:'Sangat Direkomendasikan',
    level:'Sangat kuat',
    description:'Prioritas utama untuk dieksplorasi.'
  };
  if(p >= 70) return {
    key:'strong',
    label:'Direkomendasikan',
    level:'Kuat',
    description:'Sangat layak dipertimbangkan.'
  };
  if(p >= 60) return {
    key:'explore',
    label:'Layak Dieksplorasi',
    level:'Cukup sesuai',
    description:'Masih layak dipertimbangkan.'
  };
  if(p >= 50) return {
    key:'alternative',
    label:'Alternatif',
    level:'Kesesuaian terbatas',
    description:'Dapat menjadi opsi eksplorasi tambahan.'
  };
  return {
    key:'low',
    label:'Kesesuaian Rendah',
    level:'Relatif rendah',
    description:'Tidak ditampilkan sebagai rekomendasi utama.'
  };
}

function enrichRecommendation(rec){
  const fit = getFitInterpretation(rec?.percent);
  const clusterDef = MAJOR_CLUSTERS.find(item => item.name === rec?.cluster);
  const islamicMajors = Array.isArray(rec?.islamicMajors) && rec.islamicMajors.length
    ? rec.islamicMajors
    : (clusterDef?.islamicMajors || []);
  return { ...rec, islamicMajors, fitLabel:fit.label, fitLevel:fit.level, fitKey:fit.key, fitDescription:fit.description };
}

export function islamicMajorsForRecommendation(rec={}){
  return enrichRecommendation(rec).islamicMajors || [];
}

export function getQualifiedRecommendations(recommendations=[], limit=5){
  return [...(recommendations || [])]
    .map(enrichRecommendation)
    .filter(x=>Number(x.percent || 0) >= RECOMMENDATION_MIN_PERCENT)
    .sort((a,b)=>Number(b.percent||0)-Number(a.percent||0))
    .slice(0,limit);
}

export function getAlternativeRecommendations(recommendations=[], limit=3){
  return [...(recommendations || [])]
    .map(enrichRecommendation)
    .filter(x=>Number(x.percent || 0) >= 50 && Number(x.percent || 0) < RECOMMENDATION_MIN_PERCENT)
    .sort((a,b)=>Number(b.percent||0)-Number(a.percent||0))
    .slice(0,limit);
}

export function getRelativeTopRecommendations(recommendations=[], limit=3){
  return [...(recommendations || [])]
    .map(enrichRecommendation)
    .sort((a,b)=>Number(b.percent||0)-Number(a.percent||0))
    .slice(0,limit);
}

export function recommendationSource(result={}){
  if(Array.isArray(result?.allRecommendations) && result.allRecommendations.length) return result.allRecommendations;
  return Array.isArray(result?.recommendations) ? result.recommendations : [];
}

export function recommendationsForResult(result={}, limit=5){
  return getQualifiedRecommendations(recommendationSource(result), limit);
}

export function alternativesForResult(result={}, limit=3){
  const source = Array.isArray(result?.allRecommendations) && result.allRecommendations.length
    ? result.allRecommendations
    : (Array.isArray(result?.alternatives) && result.alternatives.length ? result.alternatives : result?.recommendations || []);
  return getAlternativeRecommendations(source, limit);
}

export function relativeTopForResult(result={}, limit=3){
  return getRelativeTopRecommendations(recommendationSource(result), limit);
}

export function computeAssessmentResult(answers, profile={}){
  const grouped = groupedScores(answers);
  const riasecRaw = Object.keys(RIASEC_INFO).map(code => ({
    code,
    label: RIASEC_INFO[code].label,
    score: grouped[`riasec:${code}`] || 0,
    percent: normalize(grouped[`riasec:${code}`] || 0),
    description: RIASEC_INFO[code].description
  })).sort((a,b)=>b.score-a.score);

  const academic = ['numerik','verbal','logika','sosial','digital','visual'].map(code=>({ code, score: grouped[`academic:${code}`]||0, percent: normalize(grouped[`academic:${code}`]||0) })).sort((a,b)=>b.score-a.score);
  const values = ['mission','security','growth','flexibility','impact','spirituality'].map(code=>({ code, score: grouped[`values:${code}`]||0, percent: normalize(grouped[`values:${code}`]||0) })).sort((a,b)=>b.score-a.score);
  const workstyle = ['discipline','collaboration','leadership','communication','resilience','independence'].map(code=>({ code, score: grouped[`workstyle:${code}`]||0, percent: normalize(grouped[`workstyle:${code}`]||0) })).sort((a,b)=>b.score-a.score);

  const topRiasec = riasecRaw.slice(0,3);
  const summaryScores = {};
  riasecRaw.forEach(x=> summaryScores[x.code] = x.score);
  academic.forEach(x=> summaryScores[x.code] = x.score);
  values.forEach(x=> summaryScores[x.code] = x.score);
  workstyle.forEach(x=> summaryScores[x.code] = x.score);
  summaryScores.workstyle = avg(workstyle.map(x=>x.score));

  const allRecommendations = MAJOR_CLUSTERS.map(cluster => {
    let score = 0;
    let total = 0;
    Object.entries(cluster.weights).forEach(([key, weight]) => {
      score += (summaryScores[key] || 0) * weight;
      total += weight * 5;
    });
    const percent = Math.round((score / total) * 100);
    return enrichRecommendation({
      cluster: cluster.name,
      majors: cluster.majors,
      islamicMajors: cluster.islamicMajors || [],
      percent,
      reasons: buildReasons(cluster.name, topRiasec, academic, values, workstyle)
    });
  }).sort((a,b)=>b.percent-a.percent);

  const recommendations = getQualifiedRecommendations(allRecommendations,5);
  const alternatives = getAlternativeRecommendations(allRecommendations,3);
  const relativeTop = getRelativeTopRecommendations(allRecommendations,3);

  return {
    participant: {
      name: profile.name || '-',
      className: profile.className || '-',
      school: profile.school || '-',
      gender: profile.gender || '-'
    },
    topRiasec,
    riasecChart: riasecRaw,
    academic,
    values,
    workstyle,
    recommendations,
    alternatives,
    allRecommendations,
    tkaGuidance: buildTkaGuidance(recommendations),
    recommendationPolicy: {
      minimumPercent: RECOMMENDATION_MIN_PERCENT,
      note:'Skor kecocokan menunjukkan tingkat keselarasan profil dengan karakteristik rumpun studi, bukan probabilitas keberhasilan kuliah.'
    },
    summaryNarrative: makeNarrative(topRiasec, academic, values, workstyle, recommendations, relativeTop),
    completedItems: Object.keys(answers || {}).length,
    createdAt: Date.now()
  };
}

function buildReasons(clusterName, topRiasec, academic, values, workstyle){
  return [
    `Profil RIASEC-mu cenderung ${topRiasec.map(x=>x.label).join(', ')}.`,
    `Kekuatan akademik yang cukup menonjol: ${academic.slice(0,2).map(x=>labelAcademic(x.code)).join(' dan ')}.`,
    `Nilai hidup yang paling kuat: ${values.slice(0,2).map(x=>labelValue(x.code)).join(' dan ')}.`,
    `Cara kerja yang menonjol: ${workstyle.slice(0,2).map(x=>labelWorkstyle(x.code)).join(' dan ')}.`,
    `Karena itu, rumpun ${clusterName} layak menjadi salah satu arah eksplorasi.`
  ];
}

function makeNarrative(topRiasec, academic, values, workstyle, recommendations, relativeTop){
  const intro = `Profilmu menunjukkan kecenderungan kuat pada ${topRiasec.map(x=>x.label).join(', ')}. Pada sisi akademik, kekuatanmu terlihat pada ${academic.slice(0,2).map(x=>labelAcademic(x.code)).join(' dan ')}. Nilai hidup yang menonjol adalah ${values.slice(0,2).map(x=>labelValue(x.code)).join(' dan ')}, sementara gaya kerjamu cenderung ${workstyle.slice(0,2).map(x=>labelWorkstyle(x.code)).join(' dan ')}.`;
  if(recommendations.length){
    return `${intro} Berdasarkan pola ini, rumpun studi yang mencapai batas rekomendasi dan paling layak kamu eksplorasi terlebih dahulu adalah ${recommendations.slice(0,2).map(x=>x.cluster).join(' serta ')}.`;
  }
  const topNames = relativeTop.slice(0,2).map(x=>x.cluster).join(' dan ');
  return `${intro} Belum ada rumpun studi yang mencapai batas rekomendasi 60%. Secara relatif, arah yang paling dekat saat ini adalah ${topNames || 'beberapa rumpun teratas'}, sehingga sebaiknya digunakan sebagai bahan eksplorasi awal dan didiskusikan bersama pembimbing.`;
}

export function labelAcademic(code){
  return ({ numerik:'numerik', verbal:'verbal', logika:'logika', sosial:'pemahaman sosial', digital:'teknologi digital', visual:'visual-spasial' })[code] || code;
}
export function labelValue(code){
  return ({ mission:'makna dan misi hidup', security:'keamanan masa depan', growth:'pertumbuhan diri', flexibility:'fleksibilitas', impact:'dampak sosial', spirituality:'keselarasan nilai dan spiritualitas' })[code] || code;
}
export function labelWorkstyle(code){
  return ({ discipline:'disiplin', collaboration:'kolaborasi', leadership:'kepemimpinan', communication:'komunikasi', resilience:'daya juang', independence:'kemandirian' })[code] || code;
}
