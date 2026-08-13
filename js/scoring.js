import { QUESTIONS, RIASEC_INFO, MAJOR_CLUSTERS } from './data.js';

function sumByCode(answers, section){
  const result = {};
  QUESTIONS.filter(q => q.section === section).forEach(q=>{
    const score = Number(answers[q.id] || 0);
    result[q.code] = (result[q.code] || 0) + score;
  });
  return result;
}

function normalize(map){
  const values = Object.values(map);
  const max = Math.max(...values, 1);
  return Object.fromEntries(Object.entries(map).map(([k,v])=>[k, Math.round((v/max)*100)]));
}

export function buildResult(profile, answers){
  const riasecRaw = sumByCode(answers, 'riasec');
  const valuesRaw = sumByCode(answers, 'values');
  const workRaw = sumByCode(answers, 'workstyle');
  const academicRaw = sumByCode(answers, 'academic');

  const riasec = normalize(riasecRaw);
  const values = normalize(valuesRaw);
  const workstyle = normalize(workRaw);
  const academic = normalize(academicRaw);

  const merged = { ...riasec, ...values, ...workstyle, ...academic };
  const topRiasec = Object.entries(riasec).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>({ code:k, score:v, ...RIASEC_INFO[k] }));

  const clusterScores = MAJOR_CLUSTERS.map(cluster=>{
    let total = 0;
    let weightTotal = 0;
    Object.entries(cluster.weights).forEach(([metric, weight])=>{
      total += (merged[metric] || 0) * weight;
      weightTotal += 100 * weight;
    });
    const score = Math.round((total / (weightTotal || 1)) * 100);
    return {
      ...cluster,
      score,
      reasons: buildReasons(cluster, topRiasec, academic, values, workstyle)
    };
  }).sort((a,b)=>b.score-a.score);

  const recommendations = clusterScores.slice(0,5).map((cluster, idx)=>(
    {
      rank: idx + 1,
      cluster: cluster.name,
      score: cluster.score,
      majors: cluster.majors,
      reasons: cluster.reasons
    }
  ));

  const confidence = Math.round((
    average(Object.values(riasec)) * 0.35 +
    average(Object.values(academic)) * 0.25 +
    average(Object.values(workstyle)) * 0.20 +
    average(Object.values(values)) * 0.20
  ));

  const summary = buildSummary(topRiasec, recommendations[0], profile);

  return {
    topRiasec,
    riasec,
    values,
    workstyle,
    academic,
    recommendations,
    confidence,
    summary,
    createdAt: Date.now(),
    participant: {
      uid: profile.uid,
      name: profile.name,
      className: profile.className || '',
      school: profile.school || '',
      gender: profile.gender || ''
    }
  };
}

function average(arr){ return Math.round(arr.reduce((a,b)=>a+b,0)/(arr.length || 1)); }

function buildReasons(cluster, topRiasec, academic, values, workstyle){
  const riasecText = topRiasec.slice(0,2).map(item=>item.label).join(' dan ');
  const topAcademic = Object.entries(academic).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'logika';
  const topValue = Object.entries(values).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'mission';
  const topWork = Object.entries(workstyle).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'discipline';
  return [
    `Kecenderungan utama kamu saat ini mengarah pada ${riasecText}.`,
    `Kekuatan pendukung yang menonjol terlihat pada area ${toLabel(topAcademic)}.`,
    `Pilihan ini juga selaras dengan nilai hidup dominanmu pada aspek ${toLabel(topValue)} dan gaya kerja ${toLabel(topWork)}.`
  ];
}

function buildSummary(topRiasec, recommendation, profile){
  const names = topRiasec.map(v=>v.label).join(', ');
  return `${profile.name || 'Peserta'} menunjukkan kecenderungan kuat pada profil ${names}. Berdasarkan kombinasi minat, nilai hidup, gaya kerja, dan kekuatan akademik, rumpun ${recommendation.cluster} menjadi area eksplorasi paling menonjol saat ini.`;
}

function toLabel(key){
  const map = {
    numerik:'numerik', verbal:'verbal', logika:'logika', sosial:'sosial', digital:'digital', visual:'visual',
    mission:'misi hidup', security:'keamanan masa depan', growth:'pertumbuhan diri', flexibility:'fleksibilitas', impact:'dampak', spirituality:'nilai dan makna',
    discipline:'disiplin', collaboration:'kolaborasi', leadership:'kepemimpinan', communication:'komunikasi', resilience:'daya juang', independence:'kemandirian'
  };
  return map[key] || key;
}
