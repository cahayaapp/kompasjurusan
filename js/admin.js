import { db, ref, onValue, get, update, set } from './firebase.js';
import { dbRefs } from './firebase.js';
import { guardPage, renderBrand, bindLogout, initials, rupiah, formatDateTime, setMessage, toggleModal } from './common.js';
import { defaultPublicSettings } from './data.js';

const state = {
  user: null,
  profile: null,
  settings: defaultPublicSettings(),
  participants: [],
  payments: [],
  results: []
};

document.querySelectorAll('[data-brand]').forEach(renderBrand);
bindLogout(document.getElementById('logoutBtn'));
bindLogout(document.getElementById('logoutBtnMobile'));

document.querySelectorAll('[data-section-target]').forEach(btn=> btn.addEventListener('click', ()=> activateSection(btn.dataset.sectionTarget)));
document.getElementById('mobileMenuBtn')?.addEventListener('click', ()=> document.getElementById('mobilePanel').classList.add('show'));
document.getElementById('closeMobilePanel')?.addEventListener('click', ()=> document.getElementById('mobilePanel').classList.remove('show'));

function activateSection(id){
  document.querySelectorAll('.section').forEach(sec=> sec.classList.toggle('active', sec.id === id));
  document.querySelectorAll('[data-section-target]').forEach(btn=> btn.classList.toggle('active', btn.dataset.sectionTarget === id));
  document.getElementById('mobilePanel')?.classList.remove('show');
}

function paintProfile(){
  document.querySelectorAll('[data-user-name]').forEach(el=> el.textContent = state.profile.name || 'Administrator');
  document.querySelectorAll('[data-user-email]').forEach(el=> el.textContent = state.profile.email || '-');
  document.querySelectorAll('[data-user-initials]').forEach(el=> el.textContent = initials(state.profile.name || 'Administrator'));
}

function summarize(){
  document.getElementById('statParticipants').textContent = state.participants.length;
  document.getElementById('statPending').textContent = state.payments.filter(x=>x.status==='pending').length;
  document.getElementById('statApproved').textContent = state.payments.filter(x=>x.status==='approved').length;
  document.getElementById('statResults').textContent = state.results.length;
  document.getElementById('dashboardPaymentsMini').innerHTML = `<span class="badge pending">${state.payments.filter(x=>x.status==='pending').length} pembayaran menunggu</span>`;
  const recentWrap = document.getElementById('recentResults');
  if(!state.results.length){ recentWrap.innerHTML = '<div class="empty">Belum ada hasil asesmen.</div>'; }
  else recentWrap.innerHTML = state.results.slice(0,6).map(item=> `<div class="history-item"><div><strong>${item.name || item.participant?.name || '-'}</strong><small>${item.recommendations?.[0]?.cluster || '-'} • ${formatDateTime(item.createdAt)}</small></div><span class="badge info">${item.topRiasec?.map(x=>x.code).join('-')}</span></div>`).join('');
}

function renderPayments(){
  const tbody = document.getElementById('paymentsBody');
  if(!state.payments.length){ tbody.innerHTML = '<tr><td colspan="6">Belum ada data pembayaran.</td></tr>'; return; }
  tbody.innerHTML = state.payments.map(item=>`
    <tr>
      <td data-label="Peserta"><strong>${item.participantName || '-'}</strong><small>${item.participantEmail || ''}</small></td>
      <td data-label="Pengirim"><strong>${item.senderName}</strong><small>${item.senderBank}</small></td>
      <td data-label="Jumlah">${rupiah(item.amount)}</td>
      <td data-label="Waktu">${formatDateTime(item.createdAt)}</td>
      <td data-label="Status"><span class="badge ${item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending'}">${item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></td>
      <td data-label="Aksi"><button class="btn btn-secondary btn-sm" data-review="${item.uid}|${item.id}">Tinjau</button></td>
    </tr>`).join('');
  tbody.querySelectorAll('[data-review]').forEach(btn=> btn.addEventListener('click', ()=> openPayment(btn.dataset.review)));
}

let selectedPayment = null;
function openPayment(key){
  const [uid,id] = key.split('|');
  selectedPayment = state.payments.find(x=> x.uid===uid && x.id===id);
  if(!selectedPayment) return;
  document.getElementById('paymentReviewProof').innerHTML = `<img src="${selectedPayment.proofDataUrl}" alt="Bukti transfer">`;
  document.getElementById('paymentReviewMeta').innerHTML = `
    <div class="reco-card"><b>Peserta</b><small>${selectedPayment.participantName}<br>${selectedPayment.participantEmail}</small></div>
    <div class="reco-card"><b>Pengirim</b><small>${selectedPayment.senderName} • ${selectedPayment.senderBank}</small></div>
    <div class="reco-card"><b>Nominal</b><small>${rupiah(selectedPayment.amount)}</small></div>
    <div class="reco-card"><b>Status</b><small>${selectedPayment.status}</small></div>`;
  document.getElementById('reviewNote').value = selectedPayment.note || '';
  toggleModal(document.getElementById('paymentModal'), true);
}

document.getElementById('closePaymentModal')?.addEventListener('click', ()=> toggleModal(document.getElementById('paymentModal'), false));
document.getElementById('paymentModal')?.addEventListener('click', e=> { if(e.target.id === 'paymentModal') toggleModal(document.getElementById('paymentModal'), false); });

document.getElementById('approvePaymentBtn')?.addEventListener('click', ()=> handlePaymentDecision('approved'));
document.getElementById('rejectPaymentBtn')?.addEventListener('click', ()=> handlePaymentDecision('rejected'));

async function handlePaymentDecision(status){
  if(!selectedPayment) return;
  const note = document.getElementById('reviewNote').value.trim();
  await update(dbRefs.payment(selectedPayment.uid, selectedPayment.id), { status, note, reviewedAt: Date.now(), reviewedBy: state.profile.name || 'Admin' });
  if(status === 'approved') await set(dbRefs.access(selectedPayment.uid), { paymentApproved:true, approvedAt: Date.now(), approvedBy: state.profile.name || 'Admin' });
  toggleModal(document.getElementById('paymentModal'), false);
}

function renderParticipants(){
  const tbody = document.getElementById('participantsBody');
  if(!state.participants.length){ tbody.innerHTML = '<tr><td colspan="6">Belum ada peserta.</td></tr>'; return; }
  tbody.innerHTML = state.participants.map(p=> {
    const latestResult = state.results.filter(r=>r.uid===p.uid).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];
    const approved = state.payments.some(pay=> pay.uid===p.uid && pay.status === 'approved');
    return `<tr>
      <td data-label="Nama"><strong>${p.name || '-'}</strong><small>${p.email || ''}</small></td>
      <td data-label="Kelas">${p.className || '-'}</td>
      <td data-label="Asal">${p.school || '-'}</td>
      <td data-label="Akses"><span class="badge ${approved ? 'approved' : 'pending'}">${approved ? 'Aktif' : 'Belum aktif'}</span></td>
      <td data-label="Hasil">${latestResult?.recommendations?.[0]?.cluster || '-'}</td>
      <td data-label="Tes terakhir">${formatDateTime(latestResult?.createdAt)}</td>
    </tr>`;
  }).join('');
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
  document.getElementById('settingPrice').value = state.settings.price || 0;
  document.getElementById('settingBankName').value = state.settings.bankName || '';
  document.getElementById('settingAccountNumber').value = state.settings.accountNumber || '';
  document.getElementById('settingAccountName').value = state.settings.accountName || '';
}

async function init(){
  const { user, profile } = await guardPage('admin');
  state.user = user; state.profile = profile; paintProfile(); activateSection('section-dashboard');

  onValue(dbRefs.settingsPublic(), snap => { state.settings = { ...defaultPublicSettings(), ...(snap.val() || {}) }; renderSettings(); });
  onValue(ref(db, 'users'), snap => {
    state.participants = Object.values(snap.val() || {}).filter(x=>x.role==='participant');
    renderParticipants(); summarize();
  });
  onValue(ref(db, 'payments'), snap => {
    const raw = snap.val() || {};
    state.payments = Object.entries(raw).flatMap(([uid, group]) => Object.entries(group || {}).map(([id, val])=>({ uid, id, ...val }))).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    renderPayments(); summarize(); renderParticipants();
  });
  onValue(ref(db, 'results'), snap => {
    const raw = snap.val() || {};
    state.results = Object.entries(raw).flatMap(([uid, group]) => Object.entries(group || {}).map(([id, val])=>({ uid, id, name: val.participant?.name, ...val }))).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    summarize(); renderParticipants();
  });
}

init().catch(console.error);
