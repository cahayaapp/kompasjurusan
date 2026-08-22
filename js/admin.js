import { db, ref, onValue, get, update, set } from './firebase.js';
import { dbRefs } from './firebase.js';
import { guardPage, renderBrand, bindLogout, initials, rupiah, formatDateTime, setMessage, toggleModal } from './common.js';
import { defaultPublicSettings } from './data.js?v=11.0';
import { downloadAssessmentPdf, downloadResultsRecapPdf } from './report-pdf.js?v=11.0';
import { recommendationsForResult, getFitInterpretation, labelAcademic, labelValue, labelWorkstyle } from './scoring.js?v=11.0';
import { buildTkaGuidance, TKA_REQUIRED } from './tka-map.js?v=11.0';

const state = {
  user: null,
  profile: null,
  settings: defaultPublicSettings(),
  participants: [],
  paymentIndex: [],
  legacyPayments: [],
  payments: [],
  results: [],
  paymentFilter: 'all',
  selectedResults: new Set(),
  currentResult: null
};

document.querySelectorAll('[data-brand]').forEach(renderBrand);
bindLogout(document.getElementById('logoutBtn'));
bindLogout(document.getElementById('logoutBtnMobile'));
bindAdminPdfButtons();

document.querySelectorAll('[data-section-target]').forEach(btn=> btn.addEventListener('click', ()=> activateSection(btn.dataset.sectionTarget)));
document.getElementById('mobileMenuBtn')?.addEventListener('click', ()=> document.getElementById('mobilePanel')?.classList.add('show'));
document.getElementById('closeMobilePanel')?.addEventListener('click', ()=> document.getElementById('mobilePanel')?.classList.remove('show'));

function closeOpenModals(){
  document.querySelectorAll('.modal.show').forEach(modal=>toggleModal(modal,false));
}

function activateSection(id){
  closeOpenModals();
  document.querySelectorAll('.section').forEach(sec=> sec.classList.toggle('active', sec.id === id));
  document.querySelectorAll('[data-section-target]').forEach(btn=> btn.classList.toggle('active', btn.dataset.sectionTarget === id));
  document.getElementById('mobilePanel')?.classList.remove('show');
}

function paintProfile(){
  document.querySelectorAll('[data-user-name]').forEach(el=> el.textContent = state.profile.name || 'Administrator');
  document.querySelectorAll('[data-user-email]').forEach(el=> el.textContent = state.profile.email || '-');
  document.querySelectorAll('[data-user-initials]').forEach(el=> el.textContent = initials(state.profile.name || 'Administrator'));
}

function paymentKey(item){
  return `${item.uid || ''}|${item.id || item.paymentId || ''}`;
}

function looksLikePayment(value){
  return !!value && typeof value === 'object' && (
    'senderName' in value || 'senderBank' in value || 'proofDataUrl' in value ||
    'amount' in value || 'status' in value || 'participantName' in value
  );
}

function normalizePayments(raw){
  const rows = [];
  Object.entries(raw || {}).forEach(([firstKey, firstValue])=>{
    if(looksLikePayment(firstValue)){
      const uid = firstValue.uid || firstValue.userId || firstValue.participantUid || '';
      const id = firstValue.paymentId || firstValue.id || firstKey;
      rows.push({ uid, id, paymentId:id, ...firstValue });
      return;
    }
    if(firstValue && typeof firstValue === 'object'){
      Object.entries(firstValue).forEach(([secondKey, secondValue])=>{
        if(!looksLikePayment(secondValue)) return;
        const uid = secondValue.uid || secondValue.userId || secondValue.participantUid || firstKey;
        const id = secondValue.paymentId || secondValue.id || secondKey;
        rows.push({ uid, id, paymentId:id, ...secondValue });
      });
    }
  });
  return rows;
}

function mergePaymentSources(){
  const map = new Map();
  // Legacy/detail first so proofDataUrl remains available when present.
  state.legacyPayments.forEach(item=> map.set(paymentKey(item), { ...item }));
  state.paymentIndex.forEach(item=>{
    const key = paymentKey(item);
    map.set(key, { ...(map.get(key) || {}), ...item });
  });
  state.payments = [...map.values()].filter(item=> item.id || item.paymentId).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  renderPayments();
  summarize();
  renderParticipants();
  backfillPaymentIndex();
}

async function backfillPaymentIndex(){
  if(!state.profile || state.profile.role !== 'admin') return;
  const indexed = new Set(state.paymentIndex.map(paymentKey));
  const candidates = state.legacyPayments.filter(item=> item.uid && item.id && !indexed.has(paymentKey(item)));
  for(const item of candidates.slice(0, 50)){
    const payload = {
      uid: item.uid,
      paymentId: item.id,
      participantName: item.participantName || participantNameFor(item.uid, item.participantEmail),
      participantEmail: item.participantEmail || participantEmailFor(item.uid),
      senderName: item.senderName || '-',
      senderBank: item.senderBank || '-',
      amount: Number(item.amount || 0),
      status: item.status || 'pending',
      note: item.note || '',
      createdAt: item.createdAt || Date.now(),
      reviewedAt: item.reviewedAt || null,
      reviewedBy: item.reviewedBy || ''
    };
    try { await set(dbRefs.paymentIndex(item.id), payload); } catch(e) { console.warn('Gagal backfill paymentIndex', e); }
  }
}

function participantNameFor(uid, fallbackEmail=''){
  const p = state.participants.find(x=>x.uid===uid || (fallbackEmail && x.email===fallbackEmail));
  return p?.name || '-';
}
function participantEmailFor(uid){
  return state.participants.find(x=>x.uid===uid)?.email || '';
}

function summarize(){
  document.getElementById('statParticipants').textContent = state.participants.length;
  document.getElementById('statPending').textContent = state.payments.filter(x=>x.status==='pending').length;
  document.getElementById('statApproved').textContent = state.payments.filter(x=>x.status==='approved').length;
  document.getElementById('statResults').textContent = state.results.length;
  const pending = state.payments.filter(x=>x.status==='pending').length;
  document.getElementById('dashboardPaymentsMini').innerHTML = pending
    ? `<span class="badge pending">${pending} pembayaran menunggu</span>`
    : '<span class="badge approved">Tidak ada antrean pembayaran</span>';
  const recentWrap = document.getElementById('recentResults');
  if(!state.results.length){ recentWrap.innerHTML = '<div class="empty">Belum ada hasil asesmen.</div>'; }
  else {
    recentWrap.innerHTML = state.results.slice(0,6).map(item=> { const topRec=recommendationsForResult(item,1)[0]; return `<div class="history-item"><div><strong>${item.name || item.participant?.name || '-'}</strong><small>${topRec?.cluster || 'Belum mencapai 60%'} • ${formatDateTime(item.createdAt)}</small></div><div class="inline-actions"><span class="badge info">${item.topRiasec?.map(x=>x.code).join('-') || '-'}</span><button class="btn btn-primary btn-sm" data-admin-pdf="${item.uid}|${item.id}">⬇ PDF</button></div></div>`; }).join('');
    bindAdminPdfButtons();
  }
  renderPaymentSummary();
}

function renderPaymentSummary(){
  const wrap = document.getElementById('paymentSummary');
  if(!wrap) return;
  const counts = {
    all: state.payments.length,
    pending: state.payments.filter(x=>x.status==='pending').length,
    approved: state.payments.filter(x=>x.status==='approved').length,
    rejected: state.payments.filter(x=>x.status==='rejected').length
  };
  wrap.innerHTML = `
    <button type="button" class="payment-filter ${state.paymentFilter==='all'?'active':''}" data-payment-filter="all">Semua <b>${counts.all}</b></button>
    <button type="button" class="payment-filter ${state.paymentFilter==='pending'?'active':''}" data-payment-filter="pending">Menunggu <b>${counts.pending}</b></button>
    <button type="button" class="payment-filter ${state.paymentFilter==='approved'?'active':''}" data-payment-filter="approved">Disetujui <b>${counts.approved}</b></button>
    <button type="button" class="payment-filter ${state.paymentFilter==='rejected'?'active':''}" data-payment-filter="rejected">Ditolak <b>${counts.rejected}</b></button>`;
  wrap.querySelectorAll('[data-payment-filter]').forEach(btn=>btn.addEventListener('click', ()=>{
    state.paymentFilter = btn.dataset.paymentFilter;
    renderPaymentSummary();
    renderPayments();
  }));
}

function renderPayments(){
  const tbody = document.getElementById('paymentsBody');
  if(!tbody) return;
  const rows = state.paymentFilter === 'all' ? state.payments : state.payments.filter(x=>x.status===state.paymentFilter);
  if(!rows.length){
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">${state.payments.length ? 'Tidak ada pembayaran pada status ini.' : 'Belum ada konfirmasi pembayaran yang masuk.'}</div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(item=>{
    const participantName = item.participantName || participantNameFor(item.uid, item.participantEmail);
    const participantEmail = item.participantEmail || participantEmailFor(item.uid);
    return `
      <tr>
        <td data-label="Peserta"><strong>${participantName || '-'}</strong><small>${participantEmail || ''}</small></td>
        <td data-label="Pengirim"><strong>${item.senderName || '-'}</strong><small>${item.senderBank || '-'}</small></td>
        <td data-label="Jumlah">${rupiah(item.amount)}</td>
        <td data-label="Waktu">${formatDateTime(item.createdAt)}</td>
        <td data-label="Status"><span class="badge ${item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending'}">${item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></td>
        <td data-label="Aksi"><button class="btn btn-secondary btn-sm" data-review="${item.uid}|${item.id}">Tinjau</button></td>
      </tr>`;
  }).join('');
  tbody.querySelectorAll('[data-review]').forEach(btn=> btn.addEventListener('click', ()=> openPayment(btn.dataset.review)));
}

let selectedPayment = null;
async function openPayment(key){
  const [uid,id] = key.split('|');
  selectedPayment = state.payments.find(x=> x.uid===uid && x.id===id);
  if(!selectedPayment) return;

  let detail = selectedPayment;
  if(uid && id && !detail.proofDataUrl){
    try {
      const snap = await get(dbRefs.payment(uid,id));
      if(snap.exists()) detail = { ...detail, ...snap.val(), uid, id };
    } catch(e){ console.warn('Detail pembayaran tidak dapat dimuat', e); }
  }
  selectedPayment = detail;

  const proofEl = document.getElementById('paymentReviewProof');
  proofEl.innerHTML = detail.proofDataUrl
    ? `<img src="${detail.proofDataUrl}" alt="Bukti transfer">`
    : '<div class="empty">Bukti transfer tidak ditemukan pada data ini.</div>';
  document.getElementById('paymentReviewMeta').innerHTML = `
    <div class="reco-card"><b>Peserta</b><small>${detail.participantName || participantNameFor(uid, detail.participantEmail)}<br>${detail.participantEmail || participantEmailFor(uid)}</small></div>
    <div class="reco-card"><b>Pengirim</b><small>${detail.senderName || '-'} • ${detail.senderBank || '-'}</small></div>
    <div class="reco-card"><b>Nominal</b><small>${rupiah(detail.amount)}</small></div>
    <div class="reco-card"><b>Dikirim</b><small>${formatDateTime(detail.createdAt)}</small></div>
    <div class="reco-card"><b>Status</b><small>${detail.status || 'pending'}</small></div>`;
  document.getElementById('reviewNote').value = detail.note || '';
  toggleModal(document.getElementById('paymentModal'), true);
}

document.getElementById('closePaymentModal')?.addEventListener('click', ()=> toggleModal(document.getElementById('paymentModal'), false));
document.getElementById('paymentModal')?.addEventListener('click', e=> { if(e.target.id === 'paymentModal') toggleModal(document.getElementById('paymentModal'), false); });
document.getElementById('approvePaymentBtn')?.addEventListener('click', ()=> handlePaymentDecision('approved'));
document.getElementById('rejectPaymentBtn')?.addEventListener('click', ()=> handlePaymentDecision('rejected'));

async function handlePaymentDecision(status){
  if(!selectedPayment) return;
  if(!selectedPayment.uid || !selectedPayment.id){
    alert('Data pembayaran lama ini belum memiliki UID peserta sehingga belum dapat diverifikasi otomatis.');
    return;
  }
  const note = document.getElementById('reviewNote').value.trim();
  const reviewedAt = Date.now();
  const reviewedBy = state.profile.name || 'Admin';
  try{
    await update(dbRefs.payment(selectedPayment.uid, selectedPayment.id), { status, note, reviewedAt, reviewedBy });
    try { await update(dbRefs.paymentIndex(selectedPayment.id), { status, note, reviewedAt, reviewedBy }); } catch(e){ console.warn('Index pembayaran tidak dapat diperbarui', e); }
    if(status === 'approved'){
      await set(dbRefs.access(selectedPayment.uid), { paymentApproved:true, approvedAt: reviewedAt, approvedBy: reviewedBy, paymentId:selectedPayment.id });
    } else {
      await set(dbRefs.access(selectedPayment.uid), { paymentApproved:false, rejectedAt: reviewedAt, rejectedBy: reviewedBy, paymentId:selectedPayment.id });
    }
    toggleModal(document.getElementById('paymentModal'), false);
  }catch(err){
    console.error(err);
    alert('Gagal memperbarui pembayaran. Pastikan rules Firebase terbaru sudah dipublish.');
  }
}

function renderParticipants(){
  const tbody = document.getElementById('participantsBody');
  if(!tbody) return;
  if(!state.participants.length){ tbody.innerHTML = '<tr><td colspan="7">Belum ada peserta.</td></tr>'; return; }
  tbody.innerHTML = state.participants.map(p=> {
    const latestResult = state.results.filter(r=>r.uid===p.uid).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];
    const approved = state.payments.some(pay=> pay.uid===p.uid && pay.status === 'approved');
    return `<tr>
      <td data-label="Nama"><strong>${p.name || '-'}</strong><small>${p.email || ''}</small></td>
      <td data-label="Kelas">${p.className || '-'}</td>
      <td data-label="Asal">${p.school || '-'}</td>
      <td data-label="Akses"><span class="badge ${approved ? 'approved' : 'pending'}">${approved ? 'Aktif' : 'Belum aktif'}</span></td>
      <td data-label="Hasil">${latestResult ? (recommendationsForResult(latestResult,1)[0]?.cluster || 'Belum mencapai 60%') : '-'}</td>
      <td data-label="Tes terakhir">${formatDateTime(latestResult?.createdAt)}</td>
      <td data-label="Laporan">${latestResult ? `<button class="btn btn-primary btn-sm" data-admin-pdf="${latestResult.uid}|${latestResult.id}">⬇ PDF</button>` : '-'}</td>
    </tr>`;
  }).join('');
  bindAdminPdfButtons();
}


function adminReportId(result, participant){
  const stamp = String(result?.createdAt || Date.now()).slice(-8);
  const name = String(participant?.name || result?.participant?.name || 'PESERTA').replace(/[^A-Za-z0-9]/g,'').slice(0,5).toUpperCase();
  return `KJ-${name || 'USER'}-${stamp}`;
}

function participantForResult(result){
  const p = state.participants.find(x=>x.uid===result?.uid) || {};
  return { ...(result?.participant || {}), ...p, uid:result?.uid || p.uid || '' };
}

async function resolveResult(uid,id){
  let result = state.results.find(x=>x.uid===uid && x.id===id);
  if(result) return result;
  if(!uid || !id) return null;
  try{
    const snap = await get(dbRefs.result(uid,id));
    if(!snap.exists()) return null;
    result = { uid, id, ...(snap.val() || {}) };
    state.results.unshift(result);
    return result;
  }catch(err){
    console.error('Gagal memuat hasil langsung dari Firebase', err);
    return null;
  }
}

async function resolveParticipant(result){
  const merged = participantForResult(result);
  if(merged?.name && merged?.email) return merged;
  if(!result?.uid) return merged;
  try{
    const snap = await get(dbRefs.user(result.uid));
    if(snap.exists()) return { ...(result?.participant || {}), ...(snap.val() || {}), uid: result.uid };
  }catch(err){
    console.warn('Profil peserta tidak dapat dimuat untuk PDF', err);
  }
  return merged;
}

async function handleAdminPdfByKey(uid,id,button){
  const old = button?.innerHTML;
  try{
    if(button){ button.disabled=true; button.innerHTML='Menyiapkan PDF...'; }
    const result = await resolveResult(uid,id);
    if(!result) throw new Error('Data hasil asesmen tidak ditemukan.');
    const participant = await resolveParticipant(result);
    const safeName = (participant?.name || 'peserta').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    await downloadAssessmentPdf(result, participant, { filename:`hasil-kompas-jurusan-${safeName || 'peserta'}.pdf` });
  }catch(err){
    console.error('Admin PDF failed', err);
    alert(`Laporan PDF belum dapat dibuat. ${err?.message || 'Silakan coba lagi.'}`);
  }finally{
    if(button){ button.disabled=false; button.innerHTML=old; }
  }
}

function bindAdminPdfButtons(){
  // Event delegation: aman untuk tombol yang dibuat ulang secara dinamis oleh render dashboard.
  if(document.documentElement.dataset.adminPdfDelegated) return;
  document.documentElement.dataset.adminPdfDelegated='1';
  document.addEventListener('click', event=>{
    const btn = event.target.closest?.('[data-admin-pdf]');
    if(!btn) return;
    event.preventDefault();
    event.stopPropagation();
    const token = btn.dataset.adminPdf || '';
    const sep = token.indexOf('|');
    const uid = sep >= 0 ? token.slice(0,sep) : '';
    const id = sep >= 0 ? token.slice(sep+1) : '';
    if(!uid || !id){
      alert('ID hasil asesmen tidak lengkap. Muat ulang halaman admin lalu coba lagi.');
      return;
    }
    handleAdminPdfByKey(uid,id,btn);
  });
}


function resultToken(item){ return `${item?.uid || ''}|${item?.id || ''}`; }
function parseResultToken(token=''){
  const at=token.indexOf('|');
  return at<0 ? {uid:'',id:''} : {uid:token.slice(0,at),id:token.slice(at+1)};
}
function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[ch]));
}
function updateResultSelectionUi(){
  const valid=new Set(state.results.map(resultToken));
  [...state.selectedResults].forEach(token=>{ if(!valid.has(token)) state.selectedResults.delete(token); });
  const count=state.selectedResults.size;
  const countEl=document.getElementById('resultsSelectedCount'); if(countEl) countEl.textContent=String(count);
  const btn=document.getElementById('downloadSelectedResultsBtn'); if(btn) btn.disabled=count===0;
  const all=document.getElementById('resultsSelectAll');
  if(all){
    all.checked=state.results.length>0 && count===state.results.length;
    all.indeterminate=count>0 && count<state.results.length;
  }
}
function adminFitBadge(percent){
  const fit=getFitInterpretation(percent||0);
  return `<span class="fit-badge ${fit.key || 'low'}">${escapeHtml(fit.label)}</span>`;
}
function renderAdminStudyRows(result){
  const recs=recommendationsForResult(result,5);
  if(!recs.length) return `<div class="empty">Belum ada rumpun yang mencapai batas rekomendasi utama.</div>`;
  return `<div class="admin-study-list">${recs.map(rec=>{
    const g=buildTkaGuidance([rec]);
    const tka=[...(g.priorityElectives||[]),...(g.islamicPriorityElectives||[])].filter((x,i,a)=>a.indexOf(x)===i);
    return `<div class="admin-study-row">
      <div class="admin-study-title"><b>${escapeHtml(rec.cluster)}</b><div><strong>${rec.percent||0}%</strong>${adminFitBadge(rec.percent)}</div></div>
      <div class="admin-study-cols">
        <div><small>Jurusan Umum</small><p>${escapeHtml((rec.majors||[]).join(', ')||'—')}</p></div>
        <div class="islamic-column"><small>Ilmu Keislaman</small><p>${escapeHtml((rec.islamicMajors||[]).join(', ')||'—')}</p></div>
        <div><small>Mapel TKA Tambahan</small><p>${escapeHtml(tka.join(', ')||'Sesuaikan dengan prodi target')}</p></div>
      </div>
    </div>`;
  }).join('')}</div>`;
}
function openAdminResult(result){
  if(!result) return;
  state.currentResult=result;
  const p=participantForResult(result);
  const recs=recommendationsForResult(result,5);
  const top=recs[0];
  const riasec=result.topRiasec?.[0]||{};
  const modal=document.getElementById('adminResultModal');
  const body=document.getElementById('adminResultModalBody');
  const titleEl=document.getElementById('adminResultModalTitle');
  if(titleEl) titleEl.textContent=`Hasil ${p.name||'Peserta'}`;
  if(body) body.innerHTML=`
    <div class="admin-result-surface">
      <div class="report-surface-header">
        <div>
          <div class="report-surface-kicker">Hasil Asesmen</div>
          <h2>${escapeHtml(p.name||'Peserta')}</h2>
          <p>Tampilan detail hasil peserta diselaraskan dengan struktur laporan PDF resmi agar lebih rapi, mudah dibaca, dan nyaman digunakan saat review oleh admin.</p>
        </div>
        <div class="report-surface-meta">
          <div class="report-meta-chip"><small>Nomor Laporan</small><b>${adminReportId(result,p)}</b></div>
          <div class="report-meta-chip"><small>Tanggal Asesmen</small><b>${escapeHtml(formatDateTime(result.createdAt))}</b></div>
        </div>
      </div>
      <div class="admin-result-person">
        <div><small>Nama Peserta</small><b>${escapeHtml(p.name||'-')}</b></div>
        <div><small>Kelas</small><b>${escapeHtml(p.className||'-')}</b></div>
        <div><small>Sekolah/Pesantren</small><b>${escapeHtml(p.school||'-')}</b></div>
        <div><small>Tanggal Tes</small><b>${escapeHtml(formatDateTime(result.createdAt))}</b></div>
      </div>
      <div class="result-hero admin-result-hero">
        <div class="result-score-box"><small>Profil RIASEC Dominan</small><b>${escapeHtml(`${riasec.label||'-'} (${riasec.code||'-'})`)}</b><p class="result-hero-desc">${escapeHtml(riasec.description||'')}</p></div>
        <div class="result-score-box emphasis"><small>Rumpun Studi Terkuat</small><b>${escapeHtml(top?.cluster||'Belum mencapai 60%')}</b><div class="result-hero-copy">${top?`${top.percent}% • ${escapeHtml(getFitInterpretation(top.percent).label)}<br>${escapeHtml((top.majors||[]).slice(0,4).join(', '))}${(top.islamicMajors||[]).length?`<br><span class="islamic-line">Ilmu Keislaman: ${escapeHtml((top.islamicMajors||[]).slice(0,4).join(', '))}</span>`:''}`:'Gunakan sebagai bahan eksplorasi lebih lanjut.'}</div></div>
      </div>
    <div class="admin-result-section"><div class="panel-header"><div><h3>Profil RIASEC</h3><p>Distribusi kecenderungan minat peserta.</p></div></div><div class="bars">${(result.riasecChart||[]).map(item=>`<div class="bar-item"><label>${escapeHtml(item.code||'-')}</label><div class="bar-shell"><span style="width:${Math.max(0,Math.min(100,Number(item.percent||0)))}%"></span></div><strong>${item.percent||0}%</strong></div>`).join('')}</div></div>
    <div class="admin-result-section"><div class="panel-header"><div><h3>Rekomendasi Rumpun & Jurusan</h3><p>Jurusan umum, Ilmu Keislaman, dan fokus mapel TKA berada dalam rumpun yang sama.</p></div></div>${renderAdminStudyRows(result)}</div>
    <div class="grid-3 admin-score-summary">
      <div class="card"><h3>Kekuatan Akademik</h3>${(result.academic||[]).slice(0,4).map(x=>`<div class="admin-mini-score"><span>${escapeHtml(labelAcademic(x.code))}</span><b>${x.percent||0}%</b></div>`).join('')}</div>
      <div class="card"><h3>Gaya Kerja</h3>${(result.workstyle||[]).slice(0,4).map(x=>`<div class="admin-mini-score"><span>${escapeHtml(labelWorkstyle(x.code))}</span><b>${x.percent||0}%</b></div>`).join('')}</div>
      <div class="card"><h3>Nilai Hidup</h3>${(result.values||[]).slice(0,4).map(x=>`<div class="admin-mini-score"><span>${escapeHtml(labelValue(x.code))}</span><b>${x.percent||0}%</b></div>`).join('')}</div>
    </div>
    <div class="score-disclaimer">Persentase kecocokan menunjukkan tingkat keselarasan profil peserta dengan karakteristik rumpun studi, bukan peluang keberhasilan kuliah.</div>
    </div>`;
  toggleModal(modal,true);
}
async function openAdminResultByKey(uid,id){
  try{
    const result=await resolveResult(uid,id);
    if(!result) throw new Error('Hasil tidak ditemukan.');
    openAdminResult(result);
  }catch(err){ alert(err.message||'Hasil belum dapat dibuka.'); }
}
function setBatchMessage(text,type='info'){
  const el=document.getElementById('resultsBatchMessage');
  if(!el) return;
  setMessage(el,text,type);
}
function sleep(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }
async function downloadSelectedResults(){
  const btn=document.getElementById('downloadSelectedResultsBtn');
  const tokens=[...state.selectedResults];
  if(!tokens.length) return;
  const original=btn?.innerHTML;
  try{
    if(btn){btn.disabled=true;btn.innerHTML='Menyiapkan...';}
    setBatchMessage(`Menyiapkan ${tokens.length} laporan PDF. File akan diunduh satu per satu.`,'info');
    let done=0;
    for(const token of tokens){
      const {uid,id}=parseResultToken(token);
      const result=await resolveResult(uid,id);
      if(!result) continue;
      const participant=await resolveParticipant(result);
      const safeName=String(participant?.name||'peserta').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      await downloadAssessmentPdf(result,participant,{filename:`hasil-kompas-jurusan-${safeName||'peserta'}-${id.slice(-6)}.pdf`});
      done++;
      if(btn) btn.innerHTML=`Mengunduh ${done}/${tokens.length}`;
      await sleep(350);
    }
    setBatchMessage(`${done} laporan berhasil diproses sebagai file PDF terpisah.`,'success');
  }catch(err){
    console.error(err);setBatchMessage('Sebagian laporan belum dapat diunduh. Silakan coba lagi.','error');
  }finally{
    if(btn){btn.innerHTML=original||'⬇ Download Massal';btn.disabled=state.selectedResults.size===0;}
  }
}
async function downloadAllResultsRecap(){
  const btn=document.getElementById('downloadResultsRecapBtn');
  if(!state.results.length) return setBatchMessage('Belum ada hasil untuk direkap.','error');
  const original=btn?.innerHTML;
  try{
    if(btn){btn.disabled=true;btn.innerHTML='Menyusun Rekap...';}
    setBatchMessage(`Menyusun ${state.results.length} hasil menjadi satu PDF rekap. Bagian penjelasan asesmen tidak disertakan.`,'info');
    const entries=[];
    for(const result of state.results){ entries.push({result,participant:await resolveParticipant(result)}); }
    await downloadResultsRecapPdf(entries,{filename:`rekap-semua-hasil-kompas-jurusan-${new Date().toISOString().slice(0,10)}.pdf`});
    setBatchMessage('PDF rekap semua hasil berhasil dibuat.','success');
  }catch(err){
    console.error(err);setBatchMessage('PDF rekap belum dapat dibuat. Silakan coba lagi.','error');
  }finally{ if(btn){btn.disabled=false;btn.innerHTML=original||'▤ Download Rekap Semua';} }
}

function renderResults(){
  const tbody=document.getElementById('resultsBody');
  if(!tbody) return;
  if(!state.results.length){
    tbody.innerHTML='<tr><td colspan="7"><div class="empty">Belum ada hasil asesmen.</div></td></tr>';
    state.selectedResults.clear();updateResultSelectionUi();return;
  }
  tbody.innerHTML=state.results.map(item=>{
    const p=participantForResult(item);
    const top=recommendationsForResult(item,1)[0];
    const fit=top ? getFitInterpretation(top.percent) : null;
    const token=resultToken(item);
    return `<tr>
      <td class="check-col" data-label="Pilih"><label class="result-check"><input type="checkbox" data-result-select="${escapeHtml(token)}" ${state.selectedResults.has(token)?'checked':''}><span></span></label></td>
      <td data-label="Peserta"><strong>${escapeHtml(p.name||'-')}</strong><small>${escapeHtml(p.email||'')}</small></td>
      <td data-label="Tanggal">${escapeHtml(formatDateTime(item.createdAt))}</td>
      <td data-label="RIASEC"><span class="badge info">${escapeHtml(item.topRiasec?.map(x=>x.code).join('-')||'-')}</span></td>
      <td data-label="Rumpun">${top?escapeHtml(top.cluster):'<span class="badge pending">Belum mencapai 60%</span>'}</td>
      <td data-label="Kecocokan">${top ? `<strong>${top.percent||0}%</strong><small>${escapeHtml(fit.label)}</small>` : '<strong>—</strong><small>Perlu eksplorasi</small>'}</td>
      <td data-label="Aksi"><div class="result-row-actions"><button class="btn btn-secondary btn-sm" data-admin-view="${escapeHtml(token)}">Lihat Hasil</button><button class="btn btn-primary btn-sm" data-admin-pdf="${escapeHtml(token)}">⬇ PDF</button></div></td>
    </tr>`;
  }).join('');
  tbody.querySelectorAll('[data-result-select]').forEach(cb=>cb.addEventListener('change',()=>{
    const token=cb.dataset.resultSelect;
    if(cb.checked) state.selectedResults.add(token); else state.selectedResults.delete(token);
    updateResultSelectionUi();
  }));
  tbody.querySelectorAll('[data-admin-view]').forEach(btn=>btn.addEventListener('click',()=>{
    const {uid,id}=parseResultToken(btn.dataset.adminView);openAdminResultByKey(uid,id);
  }));
  bindAdminPdfButtons();
  updateResultSelectionUi();
}

document.getElementById('settingsForm')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const payload = {
    price: Number(document.getElementById('settingPrice').value || 0),
    bankName: document.getElementById('settingBankName').value.trim(),
    accountNumber: document.getElementById('settingAccountNumber').value.trim(),
    accountName: document.getElementById('settingAccountName').value.trim()
  };
  await set(dbRefs.settingsPublic(), payload);
  setMessage(document.getElementById('settingsMsg'), 'Pengaturan pembayaran berhasil disimpan.', 'success');
});

function renderSettings(){
  document.getElementById('settingPrice').value = state.settings.price || '';
  document.getElementById('settingBankName').value = state.settings.bankName || '';
  document.getElementById('settingAccountNumber').value = state.settings.accountNumber || '';
  document.getElementById('settingAccountName').value = state.settings.accountName || '';
}


document.getElementById('resultsSelectAll')?.addEventListener('change',e=>{
  state.selectedResults.clear();
  if(e.target.checked) state.results.forEach(item=>state.selectedResults.add(resultToken(item)));
  renderResults();
});
document.getElementById('downloadSelectedResultsBtn')?.addEventListener('click',downloadSelectedResults);
document.getElementById('downloadResultsRecapBtn')?.addEventListener('click',downloadAllResultsRecap);
document.getElementById('closeAdminResultModal')?.addEventListener('click',()=>toggleModal(document.getElementById('adminResultModal'),false));
document.getElementById('adminResultModal')?.addEventListener('click',e=>{if(e.target.id==='adminResultModal')toggleModal(document.getElementById('adminResultModal'),false);});
document.getElementById('downloadResultFromModalBtn')?.addEventListener('click',async e=>{
  if(!state.currentResult) return;
  const btn=e.currentTarget;const original=btn.innerHTML;
  try{btn.disabled=true;btn.innerHTML='Menyiapkan PDF...';const participant=await resolveParticipant(state.currentResult);await downloadAssessmentPdf(state.currentResult,participant);}
  catch(err){console.error(err);alert('PDF belum dapat dibuat.');}
  finally{btn.disabled=false;btn.innerHTML=original;}
});

function showPaymentsError(message){
  const el = document.getElementById('paymentsLoadError');
  if(el) setMessage(el, message, 'error');
}

async function init(){
  const { user, profile } = await guardPage('admin');
  state.user = user; state.profile = profile; paintProfile(); activateSection('section-dashboard');

  onValue(dbRefs.settingsPublic(), snap => { state.settings = { ...defaultPublicSettings(), ...(snap.val() || {}) }; renderSettings(); });
  onValue(ref(db, 'users'), snap => {
    state.participants = Object.entries(snap.val() || {}).map(([uid,val])=>({uid,...val})).filter(x=>x.role==='participant');
    renderParticipants(); summarize(); mergePaymentSources();
  }, err=> console.error('users read failed', err));

  // Sumber utama baru: indeks ringan agar dashboard pembayaran cepat dan stabil.
  onValue(dbRefs.paymentIndexRoot(), snap => {
    state.paymentIndex = Object.entries(snap.val() || {}).map(([id,val])=>({ id, paymentId:id, ...val }));
    mergePaymentSources();
    const el = document.getElementById('paymentsLoadError'); if(el) el.innerHTML = '';
  }, err=>{
    console.warn('paymentIndex read failed', err);
    showPaymentsError('Indeks pembayaran belum dapat dibaca. Dashboard akan mencoba membaca data konfirmasi lama. Publish database.rules.json terbaru agar antrean admin bekerja optimal.');
  });

  // Kompatibilitas semua data lama + backup bila paymentIndex belum ada.
  onValue(ref(db, 'payments'), snap => {
    state.legacyPayments = normalizePayments(snap.val() || {});
    mergePaymentSources();
  }, err=>{
    console.error('payments read failed', err);
    showPaymentsError('Data pembayaran tidak dapat dibaca oleh akun admin. Pastikan role akun adalah "admin" dan database.rules.json terbaru sudah dipublish.');
  });

  onValue(ref(db, 'results'), snap => {
    const raw = snap.val() || {};
    state.results = Object.entries(raw).flatMap(([uid, group]) => Object.entries(group || {}).map(([id, val])=>({ uid, id, name: val.participant?.name, ...val }))).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    summarize(); renderParticipants(); renderResults();
  }, err=> console.error('results read failed', err));
}

init().catch(err=>{
  console.error(err);
  showPaymentsError('Dashboard admin gagal memuat data. Silakan login ulang dan pastikan rules Firebase terbaru sudah dipublish.');
});
