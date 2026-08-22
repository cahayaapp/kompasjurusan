import { buildTkaGuidance, TKA_REQUIRED } from './tka-map.js?v=10.3';
import { labelAcademic, labelValue, labelWorkstyle, recommendationsForResult, alternativesForResult, relativeTopForResult, getFitInterpretation, RECOMMENDATION_MIN_PERCENT } from './scoring.js?v=10.3';
import { ASSESSMENT_INFO } from './assessment-info.js?v=10.3';

const PAGE_W = 1240;
const PAGE_H = 1754;
const PDF_W = 595.28;
const PDF_H = 841.89;

const C = {
  navy:'#0B2F4A',
  blue:'#1268F4',
  cyan:'#13B8C4',
  teal:'#0D8D96',
  gold:'#F6BD42',
  pale:'#F4F8FC',
  pale2:'#EDF3FA',
  white:'#FFFFFF',
  ink:'#17263A',
  muted:'#64748B',
  line:'#D9E4F1',
  green:'#0FA36B',
  orange:'#E98324'
};

function canvasPage(){
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_W;
  canvas.height = PAGE_H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = C.white;
  ctx.fillRect(0,0,PAGE_W,PAGE_H);
  ctx.textBaseline = 'top';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { canvas, ctx };
}

function rr(ctx,x,y,w,h,r,fill,stroke=null,lw=1){
  const radius = Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+radius,y);
  ctx.arcTo(x+w,y,x+w,y+h,radius);
  ctx.arcTo(x+w,y+h,x,y+h,radius);
  ctx.arcTo(x,y+h,x,y,radius);
  ctx.arcTo(x,y,x+w,y,radius);
  if(fill){ ctx.fillStyle=fill; ctx.fill(); }
  if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=lw; ctx.stroke(); }
}

function line(ctx,x1,y1,x2,y2,color=C.line,lw=1){
  ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
}

function font(ctx,size=28,weight=400,color=C.ink,family='Arial'){
  ctx.font = `${weight} ${size}px ${family}, sans-serif`;
  ctx.fillStyle = color;
}

function wrap(ctx,text,maxWidth){
  const clean = String(text ?? '').replace(/\s+/g,' ').trim();
  if(!clean) return ['-'];
  const words = clean.split(' ');
  const lines=[];
  let current='';
  for(const word of words){
    const test = current ? `${current} ${word}` : word;
    if(ctx.measureText(test).width <= maxWidth || !current){ current=test; }
    else { lines.push(current); current=word; }
  }
  if(current) lines.push(current);
  return lines;
}

function textBlock(ctx,text,x,y,maxWidth,{size=28,weight=400,color=C.ink,lineHeight=1.35,maxLines=99,align='left'}={}){
  font(ctx,size,weight,color);
  const lines=wrap(ctx,text,maxWidth).slice(0,maxLines);
  const lh=size*lineHeight;
  lines.forEach((ln,i)=>{
    let tx=x;
    if(align==='center') tx=x+(maxWidth-ctx.measureText(ln).width)/2;
    if(align==='right') tx=x+maxWidth-ctx.measureText(ln).width;
    ctx.fillText(ln,tx,y+i*lh);
  });
  return y+lines.length*lh;
}

function title(ctx,text,x,y,size=34,color=C.navy){ font(ctx,size,800,color); ctx.fillText(text,x,y); }
function smallLabel(ctx,text,x,y,color=C.muted){ font(ctx,17,700,color); ctx.fillText(String(text).toUpperCase(),x,y); }

function formatDate(ts){
  try { return new Date(ts || Date.now()).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}); }
  catch { return '-'; }
}
function formatTime(ts){
  try { return new Date(ts || Date.now()).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  catch { return '-'; }
}
function reportId(result, participant){
  const stamp = String(result?.createdAt || Date.now()).slice(-8);
  const name = String(participant?.name || result?.participant?.name || 'PESERTA').replace(/[^A-Za-z0-9]/g,'').slice(0,5).toUpperCase();
  return `KJ-${name || 'USER'}-${stamp}`;
}
function fileSafe(name='peserta'){ return String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48) || 'peserta'; }

async function loadImage(src){
  return new Promise(resolve=>{
    const img = new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=src;
  });
}

async function drawHeader(ctx, pageNo, totalPages, result, participant, logo){
  const g=ctx.createLinearGradient(0,0,PAGE_W,0); g.addColorStop(0,C.navy); g.addColorStop(.55,'#0A5679'); g.addColorStop(1,C.cyan);
  ctx.fillStyle=g; ctx.fillRect(0,0,PAGE_W,170);
  ctx.fillStyle='rgba(255,255,255,.07)'; ctx.beginPath(); ctx.arc(1120,20,170,0,Math.PI*2); ctx.fill();
  if(logo) ctx.drawImage(logo,58,34,88,88);
  font(ctx,34,800,C.white); ctx.fillText('KOMPAS JURUSAN',165,42);
  font(ctx,18,700,'#9DE7ED'); ctx.fillText('LAPORAN HASIL ASESMEN ARAH STUDI & KARIER',165,88);
  font(ctx,16,600,'#CDEFF2'); ctx.fillText(`No. Laporan: ${reportId(result,participant)}`,165,118);
  font(ctx,18,700,C.white); ctx.fillText(`Halaman ${pageNo}/${totalPages}`,1040,48);
  font(ctx,15,500,'#D8F3F4'); ctx.fillText(formatDate(result?.createdAt),1040,83);
}

function drawFooter(ctx, pageNo){
  line(ctx,60,1686,1180,1686,'#DDE7F0',1.5);
  font(ctx,14,500,C.muted); ctx.fillText('Kompas Jurusan - kompasjurusan.cahayaapp.com',60,1704);
  font(ctx,14,500,C.muted); ctx.fillText(`Laporan digital • Halaman ${pageNo}`,970,1704);
}

function drawParticipantCard(ctx,result,participant,y){
  const p={...result?.participant,...participant};
  rr(ctx,60,y,1120,206,24,C.pale,'#E1EAF4',2);
  smallLabel(ctx,'Data Peserta',88,y+24,C.blue);
  const fields=[
    ['Nama Lengkap',p.name||'-'],['Email',p.email||'-'],
    ['Kelas',p.className||'-'],['Asal Sekolah/Pesantren',p.school||'-'],
    ['Jenis Kelamin',p.gender||'-'],['Tanggal Asesmen',formatTime(result?.createdAt)]
  ];
  fields.forEach((f,i)=>{
    const col=i%2,row=Math.floor(i/2); const x=88+col*548, yy=y+60+row*44;
    font(ctx,15,700,C.muted); ctx.fillText(f[0],x,yy);
    font(ctx,20,700,C.ink); ctx.fillText(String(f[1]),x+170,yy-2);
  });
  return y+230;
}

function drawSummary(ctx,result,y){
  title(ctx,'Ringkasan Utama',60,y,32); y+=50;
  const top=result?.topRiasec?.[0]||{}; const topRec=recommendationsForResult(result,1)[0]||null; const relativeTop=relativeTopForResult(result,1)[0]||null;
  const cards=[
    {label:'Profil RIASEC Dominan',value:`${top.label||'-'} (${top.code||'-'})`,note:top.description||'Kecenderungan minat utama.'},
    {label:'Rumpun Studi Terkuat',value:topRec ? `${topRec.cluster}` : 'Belum mencapai batas 60%',note:topRec ? `${topRec.percent}% • ${getFitInterpretation(topRec.percent).label}` : `Arah relatif tertinggi: ${relativeTop?.cluster||'-'} (${relativeTop?.percent||0}%).`},
    {label:'Jurusan Prioritas',value:topRec ? (topRec.majors||[]).slice(0,3).join(', ') : '-',note:topRec ? 'Pilihan awal yang paling layak dieksplorasi lebih lanjut.' : 'Belum ditetapkan sebagai rekomendasi utama.'}
  ];
  cards.forEach((c,i)=>{
    const x=60+i*374; rr(ctx,x,y,352,198,22,i===0?'#EEF5FF':i===1?'#EAFBFA':'#FFF7E6','#DCE7F4',2);
    smallLabel(ctx,c.label,x+24,y+22,i===0?C.blue:i===1?C.teal:C.orange);
    textBlock(ctx,c.value,x+24,y+58,304,{size:27,weight:800,color:C.navy,lineHeight:1.2,maxLines:3});
    textBlock(ctx,c.note,x+24,y+130,304,{size:17,weight:500,color:C.muted,lineHeight:1.35,maxLines:3});
  });
  return y+228;
}

function drawRiasec(ctx,result,y){
  title(ctx,'Profil Minat RIASEC',60,y,32); y+=48;
  textBlock(ctx,'Enam skor berikut menunjukkan kecenderungan minat relatif peserta. Skor yang tinggi bukan berarti satu-satunya pilihan, melainkan area yang paling layak dieksplorasi lebih dulu.',60,y,1120,{size:18,color:C.muted,lineHeight:1.4}); y+=72;
  const data=result?.riasecChart||[];
  data.forEach((item,i)=>{
    const yy=y+i*64;
    rr(ctx,60,yy,60,46,14,['#D9ECFF','#E3F7F1','#FFF0D9','#F0E6FF','#FFE8EB','#EAF0F4'][i]||C.pale);
    font(ctx,22,800,C.navy); ctx.fillText(item.code||'-',82,yy+10);
    font(ctx,18,700,C.ink); ctx.fillText(item.label||'',136,yy+12);
    rr(ctx,340,yy+14,690,18,9,'#E7EDF5');
    const pct=Math.max(0,Math.min(100,Number(item.percent||0)));
    const grad=ctx.createLinearGradient(340,0,1030,0); grad.addColorStop(0,C.blue);grad.addColorStop(1,C.cyan);
    rr(ctx,340,yy+14,690*pct/100,18,9,grad);
    font(ctx,20,800,C.navy); ctx.fillText(`${pct}%`,1060,yy+8);
  });
  return y+data.length*64+20;
}

function drawInterpretation(ctx,result,y){
  rr(ctx,60,y,1120,250,24,'#F8FBFE','#DDE8F3',2);
  smallLabel(ctx,'Interpretasi Ringkas',88,y+24,C.blue);
  textBlock(ctx,result?.summaryNarrative||'Hasil asesmen menunjukkan kombinasi minat, gaya kerja, nilai hidup, dan kekuatan akademik yang dapat digunakan sebagai bahan eksplorasi arah studi.',88,y+60,1064,{size:21,weight:500,color:C.ink,lineHeight:1.45,maxLines:6});
  textBlock(ctx,`Catatan: skor kecocokan menunjukkan tingkat keselarasan profil dengan karakteristik rumpun studi, bukan probabilitas keberhasilan kuliah. Rekomendasi utama ditampilkan mulai ${RECOMMENDATION_MIN_PERCENT}%.`,88,y+195,1040,{size:15,weight:600,color:C.muted,lineHeight:1.25,maxLines:2});
}

function drawSectionBand(ctx,text,y,subtitle=''){
  const g=ctx.createLinearGradient(60,0,1180,0);g.addColorStop(0,'#0E5EEB');g.addColorStop(1,'#0CA5B0');
  rr(ctx,60,y,1120,88,22,g);
  font(ctx,29,800,C.white);ctx.fillText(text,88,y+20);
  if(subtitle){font(ctx,15,500,'#DDF6F7');ctx.fillText(subtitle,88,y+57);}
  return y+112;
}


function drawAssessmentInfoPage(ctx,y){
  const info=ASSESSMENT_INFO;
  y=drawSectionBand(ctx,info.title,y,'Penjelasan asesmen dan alasan hasilnya penting dijadikan bahan pertimbangan.');

  rr(ctx,60,y,1120,178,22,'#F3F8FE','#DDE8F4',2);
  smallLabel(ctx,'Tentang Asesmen',86,y+22,C.blue);
  textBlock(ctx,info.intro,86,y+54,1068,{size:18,weight:520,color:C.ink,lineHeight:1.42,maxLines:6});
  y+=198;

  title(ctx,info.importanceTitle,60,y,27); y+=40;
  textBlock(ctx,info.importanceIntro,60,y,1120,{size:17,weight:500,color:C.muted,lineHeight:1.38,maxLines:4}); y+=72;
  info.importancePoints.forEach((item,i)=>{
    rr(ctx,60,y,1120,62,16,i%2===0?'#F8FBFE':'#F3F7FB','#E1EAF4',1);
    rr(ctx,78,y+14,34,34,10,i===0?C.blue:i===1?C.cyan:i===2?C.gold:C.teal);
    font(ctx,16,800,i===2?C.navy:C.white);ctx.fillText(String(i+1),89,y+22);
    textBlock(ctx,item,130,y+13,1010,{size:16,weight:550,color:C.ink,lineHeight:1.26,maxLines:2});
    y+=68;
  });
  rr(ctx,60,y,1120,118,18,'#FFF9EC','#F3D99A',1.5);
  textBlock(ctx,info.importanceClosing,84,y+20,1072,{size:16,weight:550,color:C.ink,lineHeight:1.35,maxLines:4});
  y+=140;

  title(ctx,info.dimensionsTitle,60,y,27); y+=42;
  const dimX=[60,630];
  info.dimensions.forEach((item,i)=>{
    const col=i%2,row=Math.floor(i/2),x=dimX[col],yy=y+row*184;
    const fills=['#EEF5FF','#EFFBF9','#FFF8E9','#F4F0FF'];
    const accents=[C.blue,C.teal,C.orange,'#6F55C9'];
    rr(ctx,x,yy,550,164,20,fills[i], '#DDE7F2',1.5);
    rr(ctx,x+20,yy+20,48,48,14,accents[i]);
    font(ctx,18,800,C.white);ctx.fillText(`0${i+1}`,x+31,yy+32);
    font(ctx,20,800,C.navy);ctx.fillText(item.title.replace(/^\d+\.\s*/,''),x+82,yy+22);
    textBlock(ctx,item.text,x+82,yy+54,440,{size:14,weight:520,color:C.ink,lineHeight:1.34,maxLines:6});
  });
  y+=386;

  return y;
}

function drawRiasecGuidePage(ctx,y){
  const info=ASSESSMENT_INFO;
  y=drawSectionBand(ctx,info.riasecTitle,y,'Enam kecenderungan minat dan cara membaca hasil asesmen dengan tepat.');
  textBlock(ctx,info.riasecIntro,60,y,1120,{size:17,weight:500,color:C.muted,lineHeight:1.4,maxLines:3}); y+=68;
  info.riasecTypes.forEach((item,i)=>{
    const col=i%3,row=Math.floor(i/3),x=60+col*374,yy=y+row*116;
    rr(ctx,x,yy,352,100,17,'#F8FBFE','#E1EAF4',1.3);
    rr(ctx,x+16,yy+18,48,48,14,['#DCEBFF','#E1F8F2','#FFF0D9','#F0E7FF','#FFE8EB','#E9F0F4'][i]);
    font(ctx,19,800,C.navy);ctx.fillText(item.code,x+31,yy+29);
    font(ctx,17,800,C.ink);ctx.fillText(item.label,x+78,yy+15);
    textBlock(ctx,item.description,x+78,yy+42,252,{size:14,weight:500,color:C.muted,lineHeight:1.28,maxLines:3});
  });
  y+=246;
  return drawReadingGuide(ctx,y);
}

function drawReadingGuide(ctx,y){
  const info=ASSESSMENT_INFO;
  title(ctx,info.readingTitle,60,y,28); y+=46;
  info.readingPoints.forEach((item,i)=>{
    const h=86;
    rr(ctx,60,y,1120,h,18,i%2===0?'#F7FAFE':'#F1F6FB','#DEE8F3',1.3);
    rr(ctx,80,y+20,38,38,12,i===0?C.blue:i===1?C.green:i===2?C.orange:C.teal);
    font(ctx,18,800,C.white);ctx.fillText('✓',91,y+27);
    textBlock(ctx,item,136,y+15,1008,{size:16,weight:540,color:C.ink,lineHeight:1.34,maxLines:4});
    y+=96;
  });
  rr(ctx,60,y,1120,120,20,C.navy);
  smallLabel(ctx,'Prinsip Utama',86,y+18,'#9FE9E9');
  textBlock(ctx,info.closing,86,y+50,1068,{size:18,weight:650,color:C.white,lineHeight:1.38,maxLines:4});
  return y+140;
}

function drawStudyTable(ctx,result,y){
  const recs=recommendationsForResult(result,5);
  // # | Rumpun | Jurusan Umum | Ilmu Keislaman | TKA
  const cols=[60,112,322,617,912,1180];
  const widths=[52,210,295,295,268];
  const headers=['#','Rumpun Studi','Jurusan Umum','Ilmu Keislaman','Mapel Pilihan TKA'];
  rr(ctx,60,y,1120,72,16,C.navy);
  headers.forEach((h,i)=>{
    textBlock(ctx,h,cols[i]+10,y+17,widths[i]-20,{size:14,weight:800,color:C.white,lineHeight:1.15,maxLines:3});
  });
  y+=72;
  if(!recs.length){
    ctx.fillStyle='#F8FBFE';ctx.fillRect(60,y,1120,118);
    font(ctx,20,800,C.navy);ctx.fillText(`Belum ada rumpun yang mencapai batas rekomendasi ${RECOMMENDATION_MIN_PERCENT}%.`,88,y+22);
    textBlock(ctx,'Rumpun dengan skor di bawah batas tetap dapat digunakan sebagai arah eksplorasi relatif, tetapi tidak ditetapkan sebagai rekomendasi utama.',88,y+58,1040,{size:17,weight:500,color:C.muted,lineHeight:1.35,maxLines:3});
    y+=118;
  }
  recs.forEach((rec,idx)=>{
    const guidance=buildTkaGuidance([rec]);
    const umumTka=(guidance.priorityElectives||[]);
    const islamTka=(guidance.islamicPriorityElectives||[]);
    const majors=(rec.majors||[]).join(', ') || '—';
    const islamicMajors=(rec.islamicMajors||[]).join(', ') || '—';
    const tkaText = (rec.islamicMajors||[]).length
      ? `Umum: ${umumTka.join(', ') || 'sesuaikan prodi'}\nKeislaman: ${islamTka.join(', ') || 'sesuaikan prodi'}`
      : `${umumTka.join(', ') || 'Sesuaikan prodi spesifik'}`;

    font(ctx,15,600,C.ink);
    const lineCounts=[
      wrap(ctx,rec.cluster||'-',widths[1]-20).length,
      wrap(ctx,majors,widths[2]-20).length,
      wrap(ctx,islamicMajors,widths[3]-20).length,
      ...String(tkaText).split('\n').map(part=>wrap(ctx,part,widths[4]-20).length)
    ];
    const h=Math.max(112,Math.max(...lineCounts)*22+48);
    ctx.fillStyle=idx%2===0?'#F8FBFE':'#F1F6FB';ctx.fillRect(60,y,1120,h);
    line(ctx,60,y+h,1180,y+h,'#DCE6F1',1);
    // vertical guides
    [112,322,617,912].forEach(x=>line(ctx,x,y,x,y+h,'#E3EBF4',1));

    font(ctx,18,800,C.blue);ctx.fillText(String(idx+1),78,y+22);
    textBlock(ctx,rec.cluster||'-',124,y+18,widths[1]-24,{size:17,weight:800,color:C.navy,lineHeight:1.25,maxLines:4});
    const fit=getFitInterpretation(rec.percent);
    textBlock(ctx,`${rec.percent||0}% • ${fit.label}`,124,y+h-35,widths[1]-24,{size:13,weight:700,color:C.green,lineHeight:1.1,maxLines:1});

    textBlock(ctx,majors,334,y+18,widths[2]-24,{size:15,weight:600,color:C.ink,lineHeight:1.32,maxLines:7});
    textBlock(ctx,islamicMajors,629,y+18,widths[3]-24,{size:15,weight:650,color:(rec.islamicMajors||[]).length?C.teal:C.muted,lineHeight:1.32,maxLines:7});

    let ty=y+18;
    if((rec.islamicMajors||[]).length){
      font(ctx,13,800,C.muted);ctx.fillText('UMUM',924,ty);ty+=20;
      ty=textBlock(ctx,umumTka.join(', ')||'Sesuaikan prodi',924,ty,widths[4]-24,{size:14,weight:700,color:C.teal,lineHeight:1.28,maxLines:4});
      ty+=8;
      font(ctx,13,800,C.muted);ctx.fillText('KEISLAMAN',924,ty);ty+=20;
      textBlock(ctx,islamTka.join(', ')||'Sesuaikan prodi',924,ty,widths[4]-24,{size:14,weight:700,color:C.orange,lineHeight:1.28,maxLines:4});
    }else{
      textBlock(ctx,umumTka.join(', ')||'Sesuaikan prodi spesifik',924,ty,widths[4]-24,{size:14,weight:700,color:C.teal,lineHeight:1.3,maxLines:6});
    }
    y+=h;
  });
  line(ctx,60,y,1180,y,'#C8D7E8',2);
  return y+18;
}


function drawAlternativeStudy(ctx,result,y){
  const alternatives=alternativesForResult(result,3);
  if(!alternatives.length) return y;
  if(y>1430) return y;
  title(ctx,'Alternatif Eksplorasi (50-59%)',60,y,25); y+=40;
  textBlock(ctx,'Rumpun berikut tidak masuk rekomendasi utama, tetapi masih dapat dipertimbangkan sebagai eksplorasi tambahan.',60,y,1120,{size:16,color:C.muted,lineHeight:1.3}); y+=48;
  alternatives.forEach((rec,idx)=>{
    const h=58;
    ctx.fillStyle=idx%2===0?'#FFF9EE':'#FFFCF5';ctx.fillRect(60,y,1120,h);
    font(ctx,18,800,C.navy);ctx.fillText(`${rec.cluster}`,82,y+16);
    font(ctx,17,800,C.orange);ctx.fillText(`${rec.percent}% • Alternatif`,680,y+16);
    y+=h;
  });
  return y+14;
}

function drawMandatoryTka(ctx,result,y){
  rr(ctx,60,y,1120,175,24,'#FFF8E9','#F7D88C',2);
  smallLabel(ctx,'Paket Dasar Persiapan TKA',88,y+24,C.orange);
  font(ctx,23,800,C.navy);ctx.fillText('Mapel wajib untuk semua peserta',88,y+57);
  const required=TKA_REQUIRED||['Bahasa Indonesia','Bahasa Inggris','Matematika'];
  required.forEach((s,i)=>{
    const x=88+i*335;rr(ctx,x,y+100,315,48,15,C.white,'#F0D99E',1.5);font(ctx,18,700,C.ink);ctx.fillText(s,x+18,y+114);
  });
  return y+198;
}

function drawTopClusterBreakdown(ctx,result,y){
  const top=recommendationsForResult(result,1)[0];
  if(!top) return y;
  const g=buildTkaGuidance([top]);
  title(ctx,`Rincian Jurusan Prioritas - ${top.cluster}`,60,y,30); y+=48;
  textBlock(ctx,'Mapel berikut adalah fokus tambahan yang relevan untuk jurusan pada rumpun teratas. Gunakan sebagai arahan memilih paket bimbel TKA.',60,y,1120,{size:18,color:C.muted,lineHeight:1.4}); y+=66;
  const rows=g.majorBreakdown||[];
  rows.forEach((row,idx)=>{
    const subjects=row.options?.length?row.options.join(', '):(row.customLabel||'Sesuaikan dengan prodi target');
    const h=Math.max(60,wrap(ctx,subjects,500).length*23+28);
    ctx.fillStyle=idx%2===0?'#F8FBFE':'#F2F7FB';ctx.fillRect(60,y,1120,h);
    font(ctx,18,800,C.navy);ctx.fillText(row.major||'-',82,y+18);
    textBlock(ctx,subjects,600,y+16,520,{size:17,weight:650,color:C.teal,lineHeight:1.35,maxLines:4});
    y+=h;
  });
  return y+18;
}

function scorePill(ctx,label,pct,x,y,w,color){
  rr(ctx,x,y,w,60,18,'#F8FBFE','#E0E9F3',1.5);
  font(ctx,18,700,C.ink);ctx.fillText(label,x+18,y+18);
  font(ctx,20,800,color);ctx.fillText(`${pct}%`,x+w-70,y+16);
}

function drawDetailedScores(ctx,result,y){
  title(ctx,'Dimensi Pendukung',60,y,32); y+=48;
  const groups=[
    ['Kekuatan Akademik',result?.academic||[],labelAcademic,C.blue],
    ['Gaya Kerja',result?.workstyle||[],labelWorkstyle,C.teal],
    ['Nilai Hidup',result?.values||[],labelValue,C.orange]
  ];
  groups.forEach((g,gi)=>{
    const x=60+gi*374;rr(ctx,x,y,352,430,22,gi===0?'#F1F6FF':gi===1?'#EEFBF9':'#FFF8EC','#DDE7F2',2);
    smallLabel(ctx,g[0],x+22,y+22,g[3]);
    (g[1]||[]).slice(0,6).forEach((item,i)=>scorePill(ctx,g[2](item.code),item.percent||0,x+18,y+60+i*58,316,g[3]));
  });
  return y+458;
}

function drawNextSteps(ctx,result,y){
  rr(ctx,60,y,1120,340,24,C.navy);
  smallLabel(ctx,'Saran Tindak Lanjut',88,y+24,'#9FE9E9');
  const top=recommendationsForResult(result,1)[0]; const g=buildTkaGuidance(top?[top]:[]);
  const steps=[
    top ? `Eksplorasi lebih dalam 2-3 jurusan teratas pada rumpun ${top.cluster}.` : `Belum ada rumpun yang mencapai ${RECOMMENDATION_MIN_PERCENT}%; gunakan hasil sebagai bahan eksplorasi awal bersama pembimbing.`,
    `Untuk TKA, pertahankan mapel wajib: ${(TKA_REQUIRED||[]).join(', ')}.`,
    `Prioritaskan pendalaman mapel pilihan: ${(g.priorityElectives||[]).join(' dan ')||'sesuaikan dengan prodi target'}.`,
    'Bandingkan hasil asesmen dengan nilai rapor, pengalaman belajar, aktivitas yang paling dinikmati, dan target kampus.',
    'Diskusikan keputusan akhir bersama orang tua, guru BK/pembimbing, atau mentor akademik.'
  ];
  steps.forEach((s,i)=>{
    rr(ctx,88,y+64+i*50,34,34,10,i<2?C.gold:C.cyan);font(ctx,17,800,C.navy);ctx.fillText(String(i+1),100,y+72+i*50);
    textBlock(ctx,s,140,y+67+i*50,980,{size:17,weight:550,color:C.white,lineHeight:1.3,maxLines:2});
  });
  font(ctx,14,500,'#C6DEE5');ctx.fillText('Laporan ini adalah alat bantu eksplorasi pendidikan. Persentase kecocokan bukan peluang sukses kuliah dan bukan diagnosis psikologis.',88,y+306);
}

async function buildCanvases(result,participant){
  const logo=await loadImage('assets/logo-icon.svg');
  const pages=[];
  const totalPages=5;

  // Halaman 1 — identitas dan ringkasan hasil utama
  let p=canvasPage(); pages.push(p.canvas); await drawHeader(p.ctx,1,totalPages,result,participant,logo);
  let y=205;
  y=drawParticipantCard(p.ctx,result,participant,y);
  y=drawSummary(p.ctx,result,y);
  y=drawRiasec(p.ctx,result,y);
  drawInterpretation(p.ctx,result,y);
  drawFooter(p.ctx,1);

  // Halaman 2 — rumpun studi, jurusan umum, ilmu keislaman, dan persiapan TKA
  p=canvasPage(); pages.push(p.canvas); await drawHeader(p.ctx,2,totalPages,result,participant,logo); y=205;
  y=drawSectionBand(p.ctx,'Rekomendasi Rumpun Studi & Persiapan TKA',y,`Setiap rumpun menampilkan jurusan umum dan pilihan Ilmu Keislaman yang relevan. Batas rekomendasi utama ${RECOMMENDATION_MIN_PERCENT}%.`);
  y=drawMandatoryTka(p.ctx,result,y);
  y=drawStudyTable(p.ctx,result,y);
  if(y<1490) y=drawAlternativeStudy(p.ctx,result,y);
  drawFooter(p.ctx,2);

  // Halaman 3 — penjabaran skor dan langkah tindak lanjut
  p=canvasPage(); pages.push(p.canvas); await drawHeader(p.ctx,3,totalPages,result,participant,logo); y=205;
  y=drawSectionBand(p.ctx,'Penjabaran Hasil',y,'Dimensi pendukung, fokus persiapan, dan rekomendasi tindak lanjut.');
  y=drawDetailedScores(p.ctx,result,y);
  if(y<1240) y=drawTopClusterBreakdown(p.ctx,result,y);
  drawNextSteps(p.ctx,result,y+12);
  drawFooter(p.ctx,3);

  // Halaman 4 — penjelasan tentang asesmen dan empat dimensi
  p=canvasPage(); pages.push(p.canvas); await drawHeader(p.ctx,4,totalPages,result,participant,logo); y=205;
  drawAssessmentInfoPage(p.ctx,y);
  drawFooter(p.ctx,4);

  // Halaman 5 — RIASEC dan panduan membaca hasil
  p=canvasPage(); pages.push(p.canvas); await drawHeader(p.ctx,5,totalPages,result,participant,logo); y=205;
  drawRiasecGuidePage(p.ctx,y);
  drawFooter(p.ctx,5);

  return pages;
}


function base64ToBytes(dataUrl){
  const b64=dataUrl.split(',')[1];
  const bin=atob(b64); const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
function ascii(str){ return new TextEncoder().encode(str); }
function concat(parts){
  const total=parts.reduce((n,p)=>n+p.length,0); const out=new Uint8Array(total); let off=0;
  parts.forEach(p=>{out.set(p,off);off+=p.length;}); return out;
}

function canvasesToPdf(canvases){
  const jpgs=canvases.map(c=>base64ToBytes(c.toDataURL('image/jpeg',0.93)));
  const objects=[];
  const kids=[];
  // placeholders by object number index (1-based)
  objects[1]=ascii('<< /Type /Catalog /Pages 2 0 R >>');
  canvases.forEach((_,i)=>kids.push(`${3+i*3} 0 R`));
  objects[2]=ascii(`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${canvases.length} >>`);
  jpgs.forEach((jpg,i)=>{
    const pageObj=3+i*3, contentObj=pageObj+1, imageObj=pageObj+2;
    objects[pageObj]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_W} ${PDF_H}] /Resources << /XObject << /Im0 ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>`);
    const stream=`q\n${PDF_W} 0 0 ${PDF_H} 0 0 cm\n/Im0 Do\nQ\n`;
    objects[contentObj]=ascii(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    objects[imageObj]=concat([
      ascii(`<< /Type /XObject /Subtype /Image /Width ${PAGE_W} /Height ${PAGE_H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),
      jpg,
      ascii('\nendstream')
    ]);
  });
  const header=ascii('%PDF-1.4\n%KJPDF\n');
  const parts=[header]; const offsets=[0]; let pos=header.length;
  const maxObj=objects.length-1;
  for(let n=1;n<=maxObj;n++){
    offsets[n]=pos;
    const obj=concat([ascii(`${n} 0 obj\n`),objects[n],ascii('\nendobj\n')]);
    parts.push(obj); pos+=obj.length;
  }
  const xrefPos=pos;
  let xref=`xref\n0 ${maxObj+1}\n0000000000 65535 f \n`;
  for(let n=1;n<=maxObj;n++) xref+=`${String(offsets[n]).padStart(10,'0')} 00000 n \n`;
  xref+=`trailer\n<< /Size ${maxObj+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  parts.push(ascii(xref));
  return new Blob([concat(parts)],{type:'application/pdf'});
}

export async function buildAssessmentPdfBlob(result,participant={}){
  const canvases=await buildCanvases(result,participant);
  return canvasesToPdf(canvases);
}

export async function downloadAssessmentPdf(result,participant={},options={}){
  if(!result) throw new Error('Data hasil asesmen tidak tersedia.');
  const merged={...(result.participant||{}),...participant};
  const blob=await buildAssessmentPdfBlob(result,merged);
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const date=new Date(result.createdAt||Date.now()).toISOString().slice(0,10);
  a.href=url;
  a.download=options.filename || `hasil-kompas-jurusan-${fileSafe(merged.name)}-${date}.pdf`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  return blob;
}
