import { QUESTIONS, RIASEC_INFO, MAJOR_CLUSTERS } from './data.js';

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

  const recommendations = MAJOR_CLUSTERS.map(cluster => {
    let score = 0;
    let total = 0;
    Object.entries(cluster.weights).forEach(([key, weight]) => {
      score += (summaryScores[key] || 0) * weight;
      total += weight * 5;
    });
    const percent = Math.round((score / total) * 100);
    return {
      cluster: cluster.name,
      majors: cluster.majors,
      percent,
      reasons: buildReasons(cluster.name, topRiasec, academic, values, workstyle)
    };
  }).sort((a,b)=>b.percent-a.percent).slice(0,4);

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
    summaryNarrative: makeNarrative(topRiasec, academic, values, workstyle, recommendations),
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
    `Karena itu, rumpun ${clusterName} layak menjadi salah satu arah eksplorasi utama.`
  ];
}

function makeNarrative(topRiasec, academic, values, workstyle, recommendations){
  return `Profilmu menunjukkan kecenderungan kuat pada ${topRiasec.map(x=>x.label).join(', ')}. Pada sisi akademik, kekuatanmu terlihat pada ${academic.slice(0,2).map(x=>labelAcademic(x.code)).join(' dan ')}. Nilai hidup yang menonjol adalah ${values.slice(0,2).map(x=>labelValue(x.code)).join(' dan ')}, sementara gaya kerjamu cenderung ${workstyle.slice(0,2).map(x=>labelWorkstyle(x.code)).join(' dan ')}. Berdasarkan pola ini, rumpun studi yang paling layak kamu eksplorasi terlebih dahulu adalah ${recommendations.slice(0,2).map(x=>x.cluster).join(' serta ')}.`;
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
