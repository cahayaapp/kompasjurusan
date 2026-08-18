import { auth, dbRefs, get, set, update, push, ref, db } from './firebase.js';
import { QUESTIONS, QUESTION_SECTIONS, SCALE_LABELS, defaultPublicSettings } from './data.js';
import { computeAssessmentResult, labelAcademic, labelValue, labelWorkstyle } from './scoring.js';
import { buildTkaGuidance, getMajorTkaInfo } from './tka-map.js';
import { downloadAssessmentPdf } from './report-pdf.js';
import { guardPage, renderBrand, initials, bindLogout, rupiah, formatDateTime, setMessage, toggleModal, compressImage, listen } from './common.js';

const state = {
  user: null,
  profile: null,
  settings: defaultPublicSettings(),
  access: { paymentApproved:false },
  draft: { index:0, answers:{} },
  results: [],
  payments: [],
  assessmentSession: 1,
  advanceToken: 0,
  draftSessionId: '',
  currentResult: null
};

document.querySelectorAll('[data-brand]').forEach(renderBrand);
bindLogout(document.getElementById('logoutBtn'));
bindLogout(document.getElementById('logoutBtnMobile'));

const sections = [...document.querySelectorAll('.section')];
const navButtons = [...document.querySelectorAll('[data-section-target]')];
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobilePanel = document.getElementById('mobilePanel');
const closeMobilePanel = document.getElementById('closeMobilePanel');
navButtons.forEach(btn=>btn.addEventListener('click', ()=> activateSection(btn.dataset.sectionTarget)));
mobileMenuBtn?.addEventListener('click', ()=> mobilePanel.classList.add('show'));
closeMobilePanel?.addEventListener('click', ()=> mobilePanel.classList.remove('show'));

document.getElementById('startAssessmentBtn')?.addEventListener('click', ()=>{ activateSection('section-assessment'); document.querySelector('.question-card-focus')?.scrollIntoView({behavior:'smooth', block:'start'}); });
document.getElementById('resumeAssessmentBtn')?.addEventListener('click', ()=>{ activateSection('section-assessment'); document.querySelector('.question-card-focus')?.scrollIntoView({behavior:'smooth', block:'start'}); });
document.getElementById('startRetestBtn')?.addEventListener('click', ()=>{
  if(!state.access.paymentApproved) return alert('Akses asesmen belum aktif.');
  if(!confirm('Mulai asesmen dari awal? Progres sebelumnya akan diganti.')) return;

  // Buat sesi baru secara lokal terlebih dahulu. Tidak menunggu jaringan.
  state.assessmentSession += 1;
  state.advanceToken += 1;
  state.draftSessionId = `session-${Date.now()}-${state.assessmentSession}`;
  state.draft = { index:0, answers:{}, sessionId: state.draftSessionId, updatedAt: Date.now() };
  renderQuestion();
  setSaveState('saved', 'Asesmen baru siap');
  persistDraftSnapshot(state.draft);
});

function activateSection(id){
  sections.forEach(sec=>sec.classList.toggle('active', sec.id === id));
  navButtons.forEach(btn=>btn.classList.toggle('active', btn.dataset.sectionTarget === id));
  mobilePanel?.classList.remove('show');
}

function paintProfile(){
  document.querySelectorAll('[data-user-name]').forEach(el=> el.textContent = state.profile.name || 'Peserta');
  document.querySelectorAll('[data-user-email]').forEach(el=> el.textContent = state.profile.email || '-');
  document.querySelectorAll('[data-user-initials]').forEach(el=> el.textContent = initials(state.profile.name || 'Peserta'));
  document.getElementById('profileName').value = state.profile.name || '';
  document.getElementById('profileClass').value = state.profile.className || '';
  document.getElementById('profileSchool').value = state.profile.school || '';
  document.getElementById('profileGender').value = state.profile.gender || '';
}

function renderHome(){
  document.getElementById('homeAccess').innerHTML = state.access.paymentApproved ? '<span class="badge approved">Akses aktif</span>' : '<span class="badge pending">Menunggu verifikasi</span>';
  const answered = Object.keys(state.draft.answers || {}).length;
  document.getElementById('homeDraft').innerHTML = `<span class="badge info">${answered}/${QUESTIONS.length} butir</span>`;
  document.getElementById('homeLatest').innerHTML = state.results[0] ? `<span class="badge approved">${state.results[0].recommendations?.[0]?.cluster || 'Tersedia'}</span>` : '<span class="badge info">Belum ada hasil</span>';
  document.getElementById('homePaymentPrice').textContent = rupiah(state.settings.price);
  const wrap = document.getElementById('latestResultWrap');
  if(!state.results[0]){
    wrap.innerHTML = `<div class="card">
      <div class="panel-header"><div><h3>Belum ada hasil tes</h3><p>Hasil pertama akan muncul setelah kamu menyelesaikan seluruh asesmen.</p></div><span class="badge info">108 butir</span></div>
      <div class="reco-list">
        <div class="reco-card"><b>🎯 Hasil personal</b><small>Rumpun studi dan contoh jurusan disusun dari kombinasi beberapa dimensi dirimu.</small></div>
        <div class="reco-card"><b>📊 Mudah dibaca</b><small>Profil RIASEC, kekuatan akademik, nilai hidup, dan gaya kerja diringkas tanpa angka rumit.</small></div>
        <div class="reco-card"><b>🔁 Bisa dibandingkan</b><small>Setelah akses aktif, kamu dapat tes ulang dan melihat perubahan hasil dari waktu ke waktu.</small></div>
      </div>
    </div>`;
    return;
  }
  wrap.innerHTML = renderResultCard(state.results[0], true);
  wrap.querySelectorAll('[data-result]').forEach(btn=> btn.addEventListener('click', ()=> showResult(state.results.find(x=>x.id===btn.dataset.result))));
  bindResultPdfButtons(wrap);
}

function renderPaymentSection(){
  document.querySelectorAll('[data-price]').forEach(el=> el.textContent = rupiah(state.settings.price));
  document.getElementById('bankNameText').textContent = state.settings.bankName;
  document.getElementById('bankAccText').textContent = state.settings.accountNumber;
  document.getElementById('bankHolderText').textContent = state.settings.accountName;
  document.getElementById('paymentStatusBadge').innerHTML = state.access.paymentApproved ? '<span class="badge approved">Akses sudah aktif</span>' : '<span class="badge pending">Belum aktif</span>';
  document.getElementById('paymentInfoBox').innerHTML = state.access.paymentApproved ? `<div class="message success">Pembayaran sudah diverifikasi. Kamu bisa mengerjakan tes dan mengulangnya kapan saja.</div>` : `<div class="message info">Transfer ke rekening yang tertera, lalu unggah bukti transfer. Admin akan memverifikasi pembayaranmu.</div>`;

  const wrap = document.getElementById('paymentHistory');
  if(!state.payments.length){ wrap.innerHTML = '<div class="empty">Belum ada riwayat pembayaran yang dikirim.</div>'; return; }
  wrap.innerHTML = state.payments.map(item=>`
    <div class="history-item">
      <div>
        <strong>${item.senderName} • ${item.senderBank}</strong>
        <small>${rupiah(item.amount)} • ${formatDateTime(item.createdAt)} • ${item.note || 'Tanpa catatan admin.'}</small>
      </div>
      <div class="inline-actions">
        <span class="badge ${item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending'}">${item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span>
        <button class="btn btn-secondary btn-sm" data-proof="${item.id}">Lihat bukti</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-proof]').forEach(btn=> btn.addEventListener('click', ()=> openProof(btn.dataset.proof)));
}

function openProof(id){
  const item = state.payments.find(x=>x.id === id);
  if(!item) return;
  document.getElementById('proofPreview').innerHTML = `<img src="${item.proofDataUrl}" alt="Bukti transfer">`;
  document.getElementById('proofMeta').innerHTML = `
    <div class="reco-card"><b>Nama pengirim</b><small>${item.senderName}</small></div>
    <div class="reco-card"><b>Bank</b><small>${item.senderBank}</small></div>
    <div class="reco-card"><b>Jumlah</b><small>${rupiah(item.amount)}</small></div>
    <div class="reco-card"><b>Status</b><small>${item.status}</small></div>
  `;
  toggleModal(document.getElementById('proofModal'), true);
}

document.getElementById('closeProofModal')?.addEventListener('click', ()=> toggleModal(document.getElementById('proofModal'), false));
document.getElementById('proofModal')?.addEventListener('click', e=>{ if(e.target.id === 'proofModal') toggleModal(document.getElementById('proofModal'), false); });
document.getElementById('closeResultModal')?.addEventListener('click', ()=> toggleModal(document.getElementById('resultModal'), false));
document.getElementById('resultModal')?.addEventListener('click', e=>{ if(e.target.id === 'resultModal') toggleModal(document.getElementById('resultModal'), false); });

document.getElementById('paymentForm')?.addEventListener('submit', async e=>{
  e.preventDefault();
  try{
    const senderName = document.getElementById('senderName').value.trim();
    const senderBank = document.getElementById('senderBank').value.trim();
    const file = document.getElementById('paymentProof').files[0];
    if(!senderName || !senderBank || !file) throw new Error('Lengkapi nama pengirim, nama bank, dan bukti transfer.');
    const proofDataUrl = await compressImage(file, 1200, .78);
    const itemRef = push(dbRefs.paymentRoot(state.user.uid));
    const paymentId = itemRef.key;
    const createdAt = Date.now();
    const detail = {
      uid: state.user.uid, paymentId, senderName, senderBank, amount: state.settings.price, proofDataUrl,
      status:'pending', note:'', createdAt,
      participantName: state.profile.name || '', participantEmail: state.profile.email || ''
    };
    const indexItem = {
      uid: state.user.uid, paymentId, senderName, senderBank, amount: state.settings.price,
      status:'pending', note:'', createdAt,
      participantName: state.profile.name || '', participantEmail: state.profile.email || ''
    };
    // Simpan detail utama terlebih dahulu agar konfirmasi tidak hilang meski indeks admin sedang bermasalah.
    await set(dbRefs.payment(state.user.uid, paymentId), detail);
    // Indeks ringan khusus dashboard admin; tidak membawa gambar bukti agar daftar cepat dimuat.
    try {
      await set(dbRefs.paymentIndex(paymentId), indexItem);
    } catch(indexError) {
      console.warn('paymentIndex belum dapat ditulis, detail pembayaran tetap tersimpan.', indexError);
    }
    e.target.reset();
    setMessage(document.getElementById('paymentMsg'), 'Bukti transfer berhasil dikirim. Silakan tunggu verifikasi admin.', 'success');
  }catch(err){ setMessage(document.getElementById('paymentMsg'), err.message || 'Gagal mengirim bukti transfer.', 'error'); }
});

document.getElementById('profileForm')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const payload = {
    name: document.getElementById('profileName').value.trim(),
    className: document.getElementById('profileClass').value.trim(),
    school: document.getElementById('profileSchool').value.trim(),
    gender: document.getElementById('profileGender').value
  };
  await update(dbRefs.user(state.user.uid), payload);
  Object.assign(state.profile, payload);
  paintProfile();
  setMessage(document.getElementById('profileMsg'), 'Profil berhasil disimpan.', 'success');
});

function setSaveState(kind='saved', text='Tersimpan otomatis'){
  const el = document.getElementById('saveStateText');
  if(!el) return;
  el.innerHTML = `<span class="save-indicator"><span class="dot ${kind}"></span>${text}</span>`;
}

function normalizeDraft(raw){
  const data = raw && typeof raw === 'object' ? raw : {};
  return {
    index: Number.isFinite(Number(data.index)) ? Number(data.index) : 0,
    answers: data.answers && typeof data.answers === 'object' ? { ...data.answers } : {},
    sessionId: data.sessionId || state.draftSessionId || '',
    updatedAt: Number(data.updatedAt || 0)
  };
}

function draftSnapshot(){
  return {
    index: Number(state.draft.index || 0),
    answers: { ...(state.draft.answers || {}) },
    sessionId: state.draft.sessionId || state.draftSessionId || `session-${Date.now()}-${state.assessmentSession}`,
    updatedAt: Date.now()
  };
}

function persistDraftSnapshot(snapshot){
  const payload = {
    index: Number(snapshot.index || 0),
    answers: { ...(snapshot.answers || {}) },
    sessionId: snapshot.sessionId || state.draftSessionId || '',
    updatedAt: Number(snapshot.updatedAt || Date.now())
  };
  // Firebase Realtime Database akan mengantrekan write. UI tidak boleh menunggu jaringan.
  set(dbRefs.draft(state.user.uid), payload).catch(err=>{
    console.error('Gagal menyimpan progres:', err);
    // Jangan mengunci pilihan. Hanya beri status bahwa sinkronisasi belum berhasil.
    setSaveState('error', 'Belum tersinkron. Jawaban tetap bisa dipilih.');
  });
}

function renderQuestion(){
  const answered = Object.keys(state.draft.answers || {}).length;
  document.getElementById('assessmentCount').textContent = QUESTIONS.length;
  document.getElementById('draftProgressText').textContent = `Progres saat ini: ${answered}/${QUESTIONS.length} butir terjawab.`;
  if(!state.access.paymentApproved){
    document.getElementById('questionArea').innerHTML = `<div class="empty">Akses asesmen belum aktif. Silakan selesaikan pembayaran terlebih dahulu.</div>`;
    document.getElementById('questionCount').textContent = `0/${QUESTIONS.length}`;
    document.getElementById('focusQuestionNumber').textContent = '0';
    document.getElementById('questionSection').textContent = '-';
    document.getElementById('questionProgressFill').style.width = '0%';
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('nextBtn').textContent = 'Pilih jawaban dulu';
    return;
  }

  const idx = Math.max(0, Math.min(Number(state.draft.index || 0), QUESTIONS.length - 1));
  state.draft.index = idx;
  const q = QUESTIONS[idx];
  const val = Number(state.draft.answers?.[q.id] || 0);

  document.getElementById('questionCount').textContent = `${idx+1}/${QUESTIONS.length}`;
  document.getElementById('focusQuestionNumber').textContent = `${idx+1}`;
  document.getElementById('questionSection').textContent = QUESTION_SECTIONS[q.section] || q.section;
  document.getElementById('questionProgressFill').style.width = `${((idx+1)/QUESTIONS.length)*100}%`;
  setSaveState(val ? 'saved' : '', val ? 'Jawaban tersimpan' : 'Menunggu jawaban');

  document.getElementById('questionArea').innerHTML = `
    <div class="question-intro-line">Butir ${idx+1} dari ${QUESTIONS.length}</div>
    <div class="question-title">${q.prompt}</div>
    <div class="question-helper">Pilih satu jawaban yang paling menggambarkan dirimu. Setelah dipilih, butir berikutnya akan muncul otomatis.</div>
    <div class="option-stack">
      ${Object.entries(SCALE_LABELS).map(([score, meta])=>`
        <button type="button" class="option-btn ${Number(score)===val?'selected':''}" data-answer="${score}">
          <div class="option-score">${score}</div>
          <div class="option-copy"><b>${meta.title}</b><small>${meta.desc}</small></div>
        </button>
      `).join('')}
    </div>`;

  document.querySelectorAll('#questionArea [data-answer]').forEach(btn=>{
    btn.addEventListener('click', ()=> chooseAnswer(q.id, Number(btn.dataset.answer), idx));
  });

  document.getElementById('prevBtn').disabled = idx === 0;
  document.getElementById('nextBtn').disabled = !val;
  document.getElementById('nextBtn').textContent = val ? (idx >= QUESTIONS.length - 1 ? 'Selesaikan asesmen' : 'Lanjut ke berikutnya →') : 'Pilih jawaban dulu';
}

function chooseAnswer(id, score, indexAtClick){
  const currentQuestion = QUESTIONS[state.draft.index];
  if(!currentQuestion || currentQuestion.id !== id || Number(state.draft.index) !== Number(indexAtClick)) return;

  const sessionAtClick = state.assessmentSession;
  const token = ++state.advanceToken;

  // Jawaban langsung diterapkan ke UI. Tidak pernah menunggu jaringan.
  state.draft.answers[id] = score;
  if(!state.draft.sessionId){
    state.draftSessionId = state.draftSessionId || `session-${Date.now()}-${state.assessmentSession}`;
    state.draft.sessionId = state.draftSessionId;
  }
  renderQuestion();
  setSaveState('saving', 'Menyimpan otomatis…');
  persistDraftSnapshot(draftSnapshot());

  // Perpindahan otomatis berbasis state lokal, sehingga koneksi lambat tidak membuat tombol macet.
  window.setTimeout(()=>{
    if(sessionAtClick !== state.assessmentSession || token !== state.advanceToken) return;
    if(Number(state.draft.index) !== Number(indexAtClick)) return;
    if(Number(state.draft.answers?.[id] || 0) < 1) return;

    if(indexAtClick >= QUESTIONS.length - 1){
      setSaveState('saved', 'Semua jawaban terisi');
      finalizeAssessment();
      return;
    }

    state.draft.index = indexAtClick + 1;
    renderQuestion();
    setSaveState('saved', 'Tersimpan otomatis');
    persistDraftSnapshot(draftSnapshot());
  }, 220);
}

document.getElementById('prevBtn')?.addEventListener('click', ()=>{
  if(state.draft.index <= 0) return;
  state.advanceToken += 1;
  state.draft.index -= 1;
  renderQuestion();
  persistDraftSnapshot(draftSnapshot());
});

document.getElementById('nextBtn')?.addEventListener('click', ()=>{
  const idx = Number(state.draft.index || 0);
  const current = QUESTIONS[idx];
  const hasAnswer = current && Number(state.draft.answers?.[current.id] || 0) > 0;
  if(!hasAnswer){
    setSaveState('error', 'Jawab butir ini terlebih dahulu');
    return;
  }
  state.advanceToken += 1;
  if(idx >= QUESTIONS.length - 1){ finalizeAssessment(); return; }
  state.draft.index = idx + 1;
  renderQuestion();
  persistDraftSnapshot(draftSnapshot());
});

async function finalizeAssessment(){
  const answered = Object.keys(state.draft.answers || {}).length;
  if(answered < QUESTIONS.length){
    alert('Masih ada butir yang belum dijawab. Silakan lengkapi terlebih dahulu.');
    return;
  }
  const result = computeAssessmentResult(state.draft.answers, state.profile);
  const resultRef = push(dbRefs.resultsRoot(state.user.uid));
  await set(resultRef, { ...result, createdAt: Date.now() });
  state.results.unshift({ id: resultRef.key, ...result });
  state.assessmentSession += 1;
  state.advanceToken += 1;
  state.draftSessionId = `session-${Date.now()}-${state.assessmentSession}`;
  state.draft = { index:0, answers:{}, sessionId:state.draftSessionId, updatedAt:Date.now() };
  await set(dbRefs.draft(state.user.uid), state.draft);
  renderHome(); renderHistory(); renderQuestion();
  showResult(result);
  activateSection('section-results');
}


function tkaSubjectIcon(subject=''){
  const s = subject.toLowerCase();
  if(s.includes('biologi')) return '🧬';
  if(s.includes('kimia')) return '⚗️';
  if(s.includes('fisika')) return '⚛️';
  if(s.includes('matematika')) return '📐';
  if(s.includes('ekonomi')) return '📈';
  if(s.includes('sosiologi')) return '👥';
  if(s.includes('antropologi')) return '🌍';
  if(s.includes('sejarah')) return '🏛️';
  if(s.includes('pancasila') || s.includes('ppkn')) return '🇮🇩';
  if(s.includes('bahasa indonesia')) return '📖';
  if(s.includes('bahasa inggris')) return '🌐';
  if(s.includes('kewirausahaan')) return '💡';
  if(s.includes('seni')) return '🎨';
  return '📘';
}

function renderSubjectChip(subject, type='elective'){
  return `<span class="tka-subject-chip ${type}"><span>${tkaSubjectIcon(subject)}</span>${subject}</span>`;
}

function renderTkaGuidance(result, compact=false){
  const guidance = result?.tkaGuidance?.required ? result.tkaGuidance : buildTkaGuidance(result?.recommendations || []);
  const priority = guidance.priorityElectives || [];
  return `
    <div class="tka-guidance-card ${compact ? 'compact' : ''}">
      <div class="tka-guidance-head">
        <div>
          <span class="tka-eyebrow">REKOMENDASI PAKET BIMBEL TKA</span>
          <h3>Mapel yang perlu kamu siapkan</h3>
          <p>Berdasarkan rumpun jurusan teratasmu: <b>${guidance.cluster || result?.recommendations?.[0]?.cluster || '-'}</b>${guidance.percent ? ` • ${guidance.percent}% cocok` : ''}</p>
        </div>
        <div class="tka-bimbel-badge">🎯 Arah Belajar</div>
      </div>
      <div class="tka-plan-grid">
        <div class="tka-plan-panel required-panel">
          <div class="tka-plan-label"><span>01</span><div><b>Mapel wajib</b><small>Diikuti semua peserta TKA SMA/MA sederajat</small></div></div>
          <div class="tka-chip-wrap">${(guidance.required || []).map(x=>renderSubjectChip(x,'required')).join('')}</div>
        </div>
        <div class="tka-plan-panel elective-panel">
          <div class="tka-plan-label"><span>02</span><div><b>Mapel pilihan prioritas</b><small>Inilah fokus bimbel yang paling layak kamu ambil</small></div></div>
          <div class="tka-chip-wrap priority">${priority.length ? priority.map(x=>renderSubjectChip(x,'priority')).join('') : '<span class="tka-empty-choice">Sesuaikan dengan prodi spesifik dan mapel yang ada di rapor.</span>'}</div>
          ${priority.length === 1 ? '<div class="tka-choice-note">Pilihan kedua perlu disesuaikan dengan prodi target lain yang kamu pertimbangkan dan rekam mapel di rapor.</div>' : ''}
        </div>
      </div>
      ${compact ? '' : `
        <div class="tka-major-map">
          <div class="tka-major-map-head"><b>Kalau target jurusanmu lebih spesifik</b><small>Lihat mapel pendukung/pilihan yang relevan untuk setiap jurusan pada rekomendasi teratas.</small></div>
          ${(guidance.majorBreakdown || []).map(item=>`
            <div class="tka-major-row">
              <div class="tka-major-name">${item.major}</div>
              <div class="tka-major-subjects">
                ${item.options?.length ? item.options.map(x=>renderSubjectChip(x,'mini')).join('') : `<span class="tka-custom-label">${item.customLabel || 'Sesuaikan dengan prodi target.'}</span>`}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="tka-source-note">${guidance.note || 'Gunakan sebagai panduan awal. Pilihan final menyesuaikan prodi target dan mapel yang tercantum di rapor.'}</div>
      `}
    </div>`;
}

function renderRecommendationTka(item){
  const guidance = buildTkaGuidance([item]);
  const subjects = guidance.priorityElectives || [];
  return `<div class="reco-tka-strip"><span class="reco-tka-label">Mapel pilihan TKA</span><div class="tka-chip-wrap mini-row">${subjects.length ? subjects.map(x=>renderSubjectChip(x,'mini')).join('') : '<span class="tka-custom-label">Sesuaikan prodi spesifik</span>'}</div></div>`;
}

function renderResultCard(result, compact=false){
  const top = result.topRiasec?.[0];
  return `
  <div class="card">
    <div class="panel-header"><div><h3>Hasil terbaru</h3><p>${result.summaryNarrative}</p></div><span class="badge approved">${formatDateTime(result.createdAt)}</span></div>
    <div class="result-hero">
      <div class="result-score-box"><small>Tipe dominan</small><b>${top?.label || '-'} (${top?.code || '-'})</b><div style="color:#fff4cc;line-height:1.7">${top?.description || ''}</div></div>
      <div class="result-score-box"><small>Rekomendasi utama</small><b>${result.recommendations?.[0]?.cluster || '-'}</b><div style="color:#fff4cc;line-height:1.7">${(result.recommendations?.[0]?.majors || []).slice(0,4).join(', ')}</div></div>
    </div>
    <div class="bars">${result.riasecChart.map(item=>`<div class="bar-item"><label>${item.code}</label><div class="bar-shell"><span style="width:${item.percent}%"></span></div><strong>${item.percent}%</strong></div>`).join('')}</div>
    ${renderTkaGuidance(result, true)}
    <div class="inline-actions result-download-actions" style="margin-top:18px">
      ${compact ? `<button class="btn btn-secondary btn-sm" data-result="${result.id || ''}">Lihat detail</button>` : `<button class="btn btn-secondary btn-sm" data-open-report="${result.id || ''}">Lihat detail</button>`}
      <button class="btn btn-primary btn-sm" data-download-result="${result.id || ''}">⬇ Unduh PDF Resmi</button>
    </div>
  </div>`;
}

function renderHistory(){
  document.getElementById('historyCount').textContent = state.results.length;
  const wrap = document.getElementById('historyList');
  if(!state.results.length){ wrap.innerHTML = '<div class="empty">Belum ada hasil asesmen tersimpan.</div>'; return; }
  wrap.innerHTML = state.results.map(item=>`
    <div class="history-item">
      <div><strong>${item.recommendations?.[0]?.cluster || 'Hasil asesmen'}</strong><small>${formatDateTime(item.createdAt)} • ${item.topRiasec?.map(x=>x.code).join('-')} • ${item.summaryNarrative}</small></div>
      <div class="inline-actions"><span class="badge info">${item.riasecChart?.[0]?.percent || 0}%</span><button class="btn btn-secondary btn-sm" data-result="${item.id}">Lihat</button><button class="btn btn-primary btn-sm" data-download-result="${item.id}">⬇ PDF</button></div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-result]').forEach(btn=> btn.addEventListener('click', ()=> showResult(state.results.find(x=>x.id===btn.dataset.result))));
  bindResultPdfButtons(wrap);
}

function showResult(result){
  if(!result) return;
  state.currentResult = result;
  document.getElementById('resultModalBody').innerHTML = `
    <div class="report-modal-actions"><button class="btn btn-primary btn-sm" data-download-current>⬇ Unduh Laporan PDF</button></div>
    <div class="result-hero">
      <div class="result-score-box"><small>Profil RIASEC dominan</small><b>${result.topRiasec.map(x=>`${x.label} (${x.code})`).join(' • ')}</b><div style="color:#fff4cc;line-height:1.7">${result.topRiasec.map(x=>x.description).join(' ')}</div></div>
      <div class="result-score-box"><small>Rumpun studi terkuat</small><b>${result.recommendations[0].cluster}</b><div style="color:#fff4cc;line-height:1.7">${result.recommendations[0].majors.join(', ')}</div></div>
    </div>
    <div class="card" style="padding:0;background:none;border:none;box-shadow:none">
      <div class="panel-header"><div><h3>Skor RIASEC</h3></div></div>
      <div class="bars">${result.riasecChart.map(item=>`<div class="bar-item"><label>${item.code}</label><div class="bar-shell"><span style="width:${item.percent}%"></span></div><strong>${item.percent}%</strong></div>`).join('')}</div>
    </div>
    ${renderTkaGuidance(result, false)}
    <div class="grid-2" style="margin-top:18px">
      <div class="card"><div class="panel-header"><div><h3>Kekuatan yang menonjol</h3></div></div><div class="reco-list">${result.academic.slice(0,4).map(x=>`<div class="reco-card"><b>${labelAcademic(x.code)}</b><small>${x.percent}%</small></div>`).join('')}${result.workstyle.slice(0,4).map(x=>`<div class="reco-card"><b>${labelWorkstyle(x.code)}</b><small>${x.percent}%</small></div>`).join('')}</div></div>
      <div class="card"><div class="panel-header"><div><h3>Nilai hidup</h3></div></div><div class="reco-list">${result.values.slice(0,4).map(x=>`<div class="reco-card"><b>${labelValue(x.code)}</b><small>${x.percent}%</small></div>`).join('')}</div></div>
    </div>
    <div class="card" style="margin-top:18px"><div class="panel-header"><div><h3>Rekomendasi rumpun studi</h3><p>${result.summaryNarrative}</p></div></div><div class="reco-list">${result.recommendations.map(item=>`<div class="reco-card result-reco-card"><b>${item.cluster} — ${item.percent}% cocok</b><small>${item.majors.join(', ')}<br>${item.reasons.join(' ')}</small>${renderRecommendationTka(item)}</div>`).join('')}</div></div>`;
  toggleModal(document.getElementById('resultModal'), true);
  bindResultPdfButtons(document.getElementById('resultModalBody'));
}

async function handlePdfDownload(result, button){
  if(!result) return;
  const original = button?.innerHTML;
  try{
    if(button){ button.disabled = true; button.innerHTML = 'Menyiapkan PDF...'; }
    await downloadAssessmentPdf(result, state.profile || result.participant || {});
  }catch(err){
    console.error(err);
    alert('PDF belum dapat dibuat. Silakan coba lagi.');
  }finally{
    if(button){ button.disabled = false; button.innerHTML = original; }
  }
}

function bindResultPdfButtons(root=document){
  root.querySelectorAll?.('[data-download-result]').forEach(btn=>{
    if(btn.dataset.pdfBound) return;
    btn.dataset.pdfBound='1';
    btn.addEventListener('click', ()=>{
      const result = state.results.find(x=>x.id===btn.dataset.downloadResult) || state.results[0];
      handlePdfDownload(result, btn);
    });
  });
  root.querySelectorAll?.('[data-download-current]').forEach(btn=>{
    if(btn.dataset.pdfBound) return;
    btn.dataset.pdfBound='1';
    btn.addEventListener('click', ()=>handlePdfDownload(state.currentResult, btn));
  });
}

async function init(){
  const { user, profile } = await guardPage('participant');
  state.user = user; state.profile = profile;
  paintProfile();

  listen(dbRefs.settingsPublic(), data => { state.settings = { ...defaultPublicSettings(), ...(data || {}) }; renderHome(); renderPaymentSection(); });
  listen(dbRefs.access(user.uid), data => { state.access = data || { paymentApproved:false }; renderHome(); renderPaymentSection(); renderQuestion(); });
  listen(dbRefs.draft(user.uid), data => {
    const incoming = normalizeDraft(data);
    // Abaikan snapshot sesi lama bila pengguna baru saja membuat asesmen baru.
    if(state.draftSessionId && incoming.sessionId && incoming.sessionId !== state.draftSessionId) return;
    if(incoming.sessionId) state.draftSessionId = incoming.sessionId;
    state.draft = incoming;
    renderHome();
    renderQuestion();
  });
  listen(dbRefs.paymentRoot(user.uid), data => {
    state.payments = Object.entries(data || {}).map(([id,val])=>({ id, ...val })).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    renderPaymentSection();
  });
  listen(dbRefs.resultsRoot(user.uid), data => {
    state.results = Object.entries(data || {}).map(([id,val])=>({ id, ...val })).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    renderHome(); renderHistory();
  });

  activateSection('section-home');
}

init().catch(console.error);
