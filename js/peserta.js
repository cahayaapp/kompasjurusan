import { auth, dbRefs, get, set, update, push, listen, upsertUser } from './firebase.js';
import { QUESTIONS, QUESTION_SECTIONS, SCALE_LABELS, defaultPublicSettings } from './data.js';
import { buildResult } from './scoring.js';
import { guardPage, renderBrand, initials, setMessage, rupiah, formatDateTime, compressImage, toggleModal, bindLogout } from './common.js';

const state = {
  profile: null,
  user: null,
  settings: defaultPublicSettings(),
  access: null,
  payments: {},
  draft: null,
  results: {},
  questionIndex: 0,
  answers: {},
  currentResult: null,
  saveState: 'idle'
};

const brandEls = document.querySelectorAll('[data-brand]');
brandEls.forEach(renderBrand);
bindLogout(document.getElementById('logoutBtn'));
bindLogout(document.getElementById('logoutBtnMobile'));

const sections = [...document.querySelectorAll('.section')];
const navButtons = [...document.querySelectorAll('[data-section-target]')];
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobilePanel = document.getElementById('mobilePanel');
const closeMobilePanel = document.getElementById('closeMobilePanel');

function activateSection(id){
  sections.forEach(sec=>sec.classList.toggle('active', sec.id === id));
  navButtons.forEach(btn=>btn.classList.toggle('active', btn.dataset.sectionTarget === id));
  mobilePanel?.classList.remove('show');
}
navButtons.forEach(btn=>btn.addEventListener('click', ()=> activateSection(btn.dataset.sectionTarget)));
mobileMenuBtn?.addEventListener('click', ()=> mobilePanel.classList.add('show'));
closeMobilePanel?.addEventListener('click', ()=> mobilePanel.classList.remove('show'));

function paintProfile(){
  const { profile } = state;
  document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent = profile.name || 'Peserta');
  document.querySelectorAll('[data-user-email]').forEach(el=>el.textContent = profile.email || '-');
  document.querySelectorAll('[data-user-initials]').forEach(el=>el.textContent = initials(profile.name));
  document.querySelectorAll('[data-user-role]').forEach(el=>el.textContent = 'Peserta');
}

function renderPaymentSummary(){
  const accessApproved = !!state.access?.paymentApproved;
  const paymentStatusEl = document.getElementById('paymentStatusBadge');
  const paymentInfoEl = document.getElementById('paymentInfoBox');
  const latestPayment = Object.values(state.payments || {}).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];
  if(accessApproved){
    paymentStatusEl.innerHTML = '<span class="badge approved">Aktif</span>';
    paymentInfoEl.innerHTML = `<div class="message success">Akses asesmen kamu aktif. Kamu bisa tes ulang berkali-kali tanpa membayar lagi.</div>`;
    return;
  }
  if(latestPayment?.status === 'pending'){
    paymentStatusEl.innerHTML = '<span class="badge pending">Menunggu verifikasi</span>';
    paymentInfoEl.innerHTML = `<div class="message info">Bukti transfer sudah dikirim. Mohon tunggu verifikasi admin.</div>`;
    return;
  }
  if(latestPayment?.status === 'rejected'){
    paymentStatusEl.innerHTML = '<span class="badge rejected">Perlu perbaikan</span>';
    paymentInfoEl.innerHTML = `<div class="message error">Pembayaran perlu diperbaiki. Catatan admin: ${latestPayment.note || 'Silakan kirim ulang bukti transfer yang lebih jelas.'}</div>`;
    return;
  }
  paymentStatusEl.innerHTML = '<span class="badge info">Belum aktif</span>';
  paymentInfoEl.innerHTML = `<div class="message info">Akses penuh belum aktif. Silakan lakukan pembayaran agar asesmen dapat dibuka.</div>`;
}

function renderSettingsInfo(){
  document.querySelectorAll('[data-price]').forEach(el=>el.textContent = rupiah(state.settings.price));
  document.getElementById('bankNameText').textContent = state.settings.bankName;
  document.getElementById('bankAccText').textContent = state.settings.accountNumber;
  document.getElementById('bankHolderText').textContent = state.settings.accountName;
}

function renderHistory(){
  const wrap = document.getElementById('historyList');
  const items = Object.entries(state.results || {}).map(([id, val])=>({ id, ...val })).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  document.getElementById('historyCount').textContent = items.length;
  if(!items.length){ wrap.innerHTML = '<div class="empty">Belum ada hasil tes. Setelah akses aktif, kamu bisa memulai asesmen dari menu Asesmen.</div>'; return; }
  wrap.innerHTML = items.map(item=>`
    <div class="history-item">
      <div>
        <strong>${item.recommendations?.[0]?.cluster || 'Hasil asesmen'}</strong>
        <small>Dikerjakan pada ${formatDateTime(item.createdAt)} • Kepercayaan hasil ${item.confidence || 0}%</small>
      </div>
      <div class="inline-actions">
        <span class="badge info">${item.topRiasec?.map(v=>v.code).join('-') || 'Profil'}</span>
        <button class="btn btn-secondary btn-sm" data-open-result="${item.id}">Lihat hasil</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-open-result]').forEach(btn=>btn.addEventListener('click', ()=> showResult(items.find(i=>i.id === btn.dataset.openResult))));
}

function renderResultSummary(latest){
  const resultWrap = document.getElementById('latestResultWrap');
  if(!latest){ resultWrap.innerHTML = '<div class="empty">Belum ada hasil terbaru. Kerjakan asesmen terlebih dahulu.</div>'; return; }
  resultWrap.innerHTML = buildResultHTML(latest);
  bindResultButtons(resultWrap, latest);
}

function buildResultHTML(result){
  return `
    <div class="result-hero">
      <div class="card" style="padding:0;border:none;box-shadow:none;background:transparent">
        <div class="result-score-box">
          <small>Ringkasan utama</small>
          <b>${result.recommendations?.[0]?.cluster || '-'}</b>
          <small>${result.summary || ''}</small>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="panel-header"><div><h3>Profil RIASEC</h3><p>Bidang kecenderungan yang paling menonjol dari jawabanmu.</p></div><span class="badge info">${result.topRiasec?.map(x=>x.code).join('-') || '-'}</span></div>
          <div class="bars">
            ${(result.topRiasec || []).map(item=>`
              <div class="bar-item"><label>${item.code}</label><div class="bar-shell"><span style="width:${item.score}%"></span></div><strong>${item.score}%</strong></div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="panel-header"><div><h3>Status hasil</h3><p>Laporan ini bisa kamu gunakan sebagai bahan diskusi dengan pembimbing atau orang tua.</p></div></div>
        <div class="reco-list">
          <div class="reco-card"><b>Kepercayaan hasil</b><small>${result.confidence || 0}% • Semakin tinggi, semakin konsisten pola jawabanmu.</small></div>
          <div class="reco-card"><b>Waktu tes</b><small>${formatDateTime(result.createdAt)}</small></div>
          <div class="reco-card"><b>Tes ulang</b><small>Kamu bisa mengerjakan ulang kapan saja untuk melihat perubahan arah dan kematangan pilihanmu.</small></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="panel-header"><div><h3>Rekomendasi rumpun & jurusan</h3><p>Area eksplorasi yang paling menonjol berdasarkan kombinasi empat dimensi asesmen.</p></div><div class="inline-actions"><button class="btn btn-primary btn-sm" data-retest>Tes Ulang Gratis</button></div></div>
      <div class="reco-list">
        ${(result.recommendations || []).slice(0,5).map(rec=>`
          <div class="reco-card">
            <b>#${rec.rank} • ${rec.cluster} <span class="badge info">${rec.score}%</span></b>
            <small><b>Contoh jurusan:</b> ${rec.majors.join(', ')}<br>${rec.reasons.map(r=>`• ${r}`).join('<br>')}</small>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindResultButtons(root, result){
  root.querySelectorAll('[data-retest]').forEach(btn=>btn.addEventListener('click', ()=>{
    activateSection('section-assessment');
    startNewAssessment();
  }));
}

function showResult(result){
  if(!result) return;
  state.currentResult = result;
  const modal = document.getElementById('resultModal');
  document.getElementById('resultModalBody').innerHTML = buildResultHTML(result);
  bindResultButtons(document.getElementById('resultModalBody'), result);
  toggleModal(modal, true);
}

document.getElementById('closeResultModal')?.addEventListener('click', ()=> toggleModal(document.getElementById('resultModal'), false));
document.getElementById('resultModal')?.addEventListener('click', (e)=>{ if(e.target.id === 'resultModal') toggleModal(document.getElementById('resultModal'), false); });

function updateHomeState(){
  const latest = Object.entries(state.results || {}).map(([id,val])=>({id,...val})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];
  document.getElementById('homeAccess').innerHTML = state.access?.paymentApproved ? '<span class="badge approved">Akses aktif</span>' : '<span class="badge pending">Menunggu aktivasi</span>';
  document.getElementById('homeDraft').innerHTML = state.draft?.answers && !state.draft?.submitted ? `<span class="badge info">Progres ${Object.keys(state.draft.answers || {}).length}/${QUESTIONS.length}</span>` : '<span class="badge info">Belum ada progres</span>';
  document.getElementById('homeLatest').innerHTML = latest ? `<span class="badge approved">${latest.recommendations?.[0]?.cluster || 'Sudah ada hasil'}</span>` : '<span class="badge info">Belum ada hasil</span>';
  document.getElementById('homePaymentPrice').textContent = rupiah(state.settings.price);
  renderResultSummary(latest);
}

function renderQuestion(){
  const current = QUESTIONS[state.questionIndex];
  const card = document.getElementById('questionArea');
  if(!current){
    finishAssessment();
    return;
  }
  document.getElementById('questionCount').textContent = `${state.questionIndex + 1}/${QUESTIONS.length}`;
  document.getElementById('questionSection').textContent = QUESTION_SECTIONS[current.section];
  document.getElementById('questionProgressFill').style.width = `${((state.questionIndex)/QUESTIONS.length)*100}%`;
  document.getElementById('saveStateText').innerHTML = saveIndicatorText();
  card.innerHTML = `
    <h2 class="question-title">${current.prompt}</h2>
    <p class="question-helper">Jawab sesuai dirimu saat ini. Tidak perlu mencoba terlihat ideal. Semakin jujur, hasilnya semakin membantu.</p>
    <div class="option-stack">
      ${Object.entries(SCALE_LABELS).map(([value, item])=>`
        <button class="option-btn ${Number(state.answers[current.id]) === Number(value) ? 'selected' : ''}" type="button" data-answer="${value}">
          <span class="option-score">${value}</span>
          <span class="option-copy"><b>${item.title}</b><small>${item.desc}</small></span>
        </button>
      `).join('')}
    </div>
  `;
  card.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click', ()=> chooseAnswer(current, Number(btn.dataset.answer))));
  document.getElementById('prevBtn').disabled = state.questionIndex === 0;
  document.getElementById('nextBtn').disabled = !state.answers[current.id];
}

function saveIndicatorText(){
  const map = {
    idle: '<span class="save-indicator"><span class="dot"></span>Belum ada perubahan</span>',
    saving: '<span class="save-indicator"><span class="dot saving"></span>Menyimpan jawaban…</span>',
    saved: '<span class="save-indicator"><span class="dot saved"></span>Jawaban tersimpan</span>',
    error: '<span class="save-indicator"><span class="dot error"></span>Gagal menyimpan. Coba lagi.</span>'
  };
  return map[state.saveState] || map.idle;
}

async function persistDraft(){
  state.saveState = 'saving';
  document.getElementById('saveStateText').innerHTML = saveIndicatorText();
  try{
    await set(dbRefs.drafts(state.user.uid), {
      uid: state.user.uid,
      answers: state.answers,
      questionIndex: state.questionIndex,
      submitted: false,
      updatedAt: Date.now()
    });
    state.saveState = 'saved';
  }catch(err){
    console.error(err);
    state.saveState = 'error';
  }
  document.getElementById('saveStateText').innerHTML = saveIndicatorText();
}

async function chooseAnswer(question, value){
  state.answers[question.id] = value;
  document.getElementById('nextBtn').disabled = false;
  await persistDraft();
  setTimeout(()=>{
    if(state.questionIndex < QUESTIONS.length - 1){
      state.questionIndex += 1;
      renderQuestion();
    }else{
      finishAssessment();
    }
  }, 180);
}

document.getElementById('prevBtn')?.addEventListener('click', ()=>{
  if(state.questionIndex > 0){ state.questionIndex -= 1; renderQuestion(); }
});
document.getElementById('nextBtn')?.addEventListener('click', ()=>{
  if(state.questionIndex < QUESTIONS.length - 1){ state.questionIndex += 1; renderQuestion(); } else { finishAssessment(); }
});

document.getElementById('startAssessmentBtn')?.addEventListener('click', ()=>{
  if(!state.access?.paymentApproved){ activateSection('section-payment'); return; }
  activateSection('section-assessment');
  if(state.draft?.answers && !state.draft?.submitted){
    state.answers = { ...state.draft.answers };
    state.questionIndex = Number(state.draft.questionIndex || 0);
  }else{
    startNewAssessment();
  }
  renderQuestion();
});

document.getElementById('resumeAssessmentBtn')?.addEventListener('click', ()=>{
  activateSection('section-assessment');
  state.answers = { ...(state.draft?.answers || {}) };
  state.questionIndex = Number(state.draft?.questionIndex || 0);
  renderQuestion();
});

function startNewAssessment(){
  state.answers = {};
  state.questionIndex = 0;
  state.draft = null;
  set(dbRefs.drafts(state.user.uid), { uid: state.user.uid, answers:{}, questionIndex:0, submitted:false, updatedAt: Date.now() });
  renderQuestion();
}

document.getElementById('startRetestBtn')?.addEventListener('click', ()=>{
  activateSection('section-assessment');
  startNewAssessment();
});

async function finishAssessment(){
  const result = buildResult({ ...state.profile, uid: state.user.uid }, state.answers);
  const newRef = push(dbRefs.results(state.user.uid));
  const resultId = newRef.key;
  const payload = { ...result, resultId, answers: state.answers };
  await set(newRef, payload);
  await set(dbRefs.drafts(state.user.uid), { uid: state.user.uid, answers:{}, questionIndex:0, submitted:true, updatedAt: Date.now() });
  state.results[resultId] = payload;
  state.draft = { answers:{}, questionIndex:0, submitted:true };
  renderHistory();
  updateHomeState();
  showResult({ id: resultId, ...payload });
  activateSection('section-results');
}

async function handlePaymentSubmit(e){
  e.preventDefault();
  const msg = document.getElementById('paymentMsg');
  setMessage(msg, '');
  const senderName = document.getElementById('senderName').value.trim();
  const senderBank = document.getElementById('senderBank').value.trim();
  const file = document.getElementById('paymentProof').files[0];
  if(!senderName || !senderBank || !file){ setMessage(msg, 'Lengkapi nama pengirim, bank, dan bukti transfer.', 'error'); return; }
  try{
    const proofDataUrl = await compressImage(file, 1080, .78);
    const paymentRef = push(dbRefs.payments(state.user.uid));
    await set(paymentRef, {
      uid: state.user.uid,
      participantName: state.profile.name,
      participantEmail: state.profile.email,
      senderName,
      senderBank,
      amount: state.settings.price,
      proofDataUrl,
      status: 'pending',
      note: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setMessage(msg, 'Bukti transfer berhasil dikirim. Mohon tunggu verifikasi admin.', 'success');
    document.getElementById('paymentForm').reset();
  }catch(err){
    console.error(err);
    setMessage(msg, 'Gagal mengirim bukti transfer. Silakan coba lagi.', 'error');
  }
}

function paintPaymentHistory(){
  const wrap = document.getElementById('paymentHistory');
  const items = Object.entries(state.payments || {}).map(([id,val])=>({ id,...val })).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if(!items.length){ wrap.innerHTML = '<div class="empty">Belum ada pengiriman bukti transfer.</div>'; return; }
  wrap.innerHTML = items.map(item=>`
    <div class="history-item">
      <div>
        <strong>${item.senderName} • ${rupiah(item.amount)}</strong>
        <small>${item.senderBank} • dikirim ${formatDateTime(item.createdAt)}</small>
      </div>
      <div class="inline-actions">
        <span class="badge ${item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending'}">${item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span>
        <button class="btn btn-secondary btn-sm" data-view-proof="${item.id}">Lihat bukti</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-view-proof]').forEach(btn=>btn.addEventListener('click', ()=> openProof(items.find(it=>it.id === btn.dataset.viewProof))));
}

function openProof(item){
  if(!item) return;
  document.getElementById('proofPreview').innerHTML = `<img src="${item.proofDataUrl}" alt="Bukti transfer">`;
  document.getElementById('proofMeta').innerHTML = `
    <div class="reco-card"><b>${item.senderName}</b><small>${item.senderBank} • ${rupiah(item.amount)}</small></div>
    <div class="reco-card"><b>Status</b><small>${item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu verifikasi'}</small></div>
    ${item.note ? `<div class="reco-card"><b>Catatan admin</b><small>${item.note}</small></div>` : ''}
  `;
  toggleModal(document.getElementById('proofModal'), true);
}

document.getElementById('closeProofModal')?.addEventListener('click', ()=> toggleModal(document.getElementById('proofModal'), false));
document.getElementById('proofModal')?.addEventListener('click', (e)=>{ if(e.target.id === 'proofModal') toggleModal(document.getElementById('proofModal'), false); });
document.getElementById('paymentForm')?.addEventListener('submit', handlePaymentSubmit);

document.getElementById('profileForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    uid: state.user.uid,
    name: document.getElementById('profileName').value.trim(),
    email: state.profile.email,
    className: document.getElementById('profileClass').value.trim(),
    school: document.getElementById('profileSchool').value.trim(),
    gender: document.getElementById('profileGender').value,
    role: 'participant',
    status: 'active',
    lastLoginAt: Date.now()
  };
  await upsertUser(state.user.uid, payload);
  state.profile = payload;
  paintProfile();
  setMessage(document.getElementById('profileMsg'), 'Profil berhasil diperbarui.', 'success');
});

function fillProfileForm(){
  document.getElementById('profileName').value = state.profile.name || '';
  document.getElementById('profileClass').value = state.profile.className || '';
  document.getElementById('profileSchool').value = state.profile.school || '';
  document.getElementById('profileGender').value = state.profile.gender || '';
}

async function init(){
  const { user, profile } = await guardPage('participant');
  state.user = user;
  state.profile = { ...profile, uid: user.uid };
  paintProfile();
  fillProfileForm();
  renderSettingsInfo();

  listen(dbRefs.settingsPublic(), (data)=>{ state.settings = { ...defaultPublicSettings(), ...(data || {}) }; renderSettingsInfo(); updateHomeState(); });
  listen(dbRefs.access(user.uid), (data)=>{ state.access = data || null; renderPaymentSummary(); updateHomeState(); });
  listen(dbRefs.payments(user.uid), (data)=>{ state.payments = data || {}; paintPaymentHistory(); renderPaymentSummary(); });
  listen(dbRefs.drafts(user.uid), (data)=>{ state.draft = data || null; const count = Object.keys(data?.answers || {}).length; document.getElementById('draftProgressText').textContent = count ? `${count} dari ${QUESTIONS.length} butir telah terisi.` : 'Belum ada progres pengerjaan.'; updateHomeState(); });
  listen(dbRefs.results(user.uid), (data)=>{ state.results = data || {}; renderHistory(); updateHomeState(); });

  activateSection('section-home');
  document.getElementById('assessmentCount').textContent = QUESTIONS.length;
}

init().catch(console.error);
