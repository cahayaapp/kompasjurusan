import { dbRefs, listen, set, update, get, ref, db } from './firebase.js';
import { guardPage, renderBrand, initials, bindLogout, rupiah, formatDateTime, setMessage, toggleModal } from './common.js';
import { defaultPublicSettings } from './data.js';

const state = {
  user: null,
  profile: null,
  settings: defaultPublicSettings(),
  allUsers: {},
  allPayments: [],
  allResults: [],
  selectedPayment: null
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

function activateSection(id){
  sections.forEach(sec=>sec.classList.toggle('active', sec.id === id));
  navButtons.forEach(btn=>btn.classList.toggle('active', btn.dataset.sectionTarget === id));
  mobilePanel?.classList.remove('show');
}

function paintProfile(){
  document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent = state.profile.name || 'Admin');
  document.querySelectorAll('[data-user-email]').forEach(el=>el.textContent = state.profile.email || '-');
  document.querySelectorAll('[data-user-initials]').forEach(el=>el.textContent = initials(state.profile.name || 'Admin'));
}

function flattenPayments(data){
  const rows = [];
  Object.entries(data || {}).forEach(([uid, items])=>{
    Object.entries(items || {}).forEach(([id, payment])=> rows.push({ uid, id, ...payment }));
  });
  return rows.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
}
function flattenResults(data){
  const rows = [];
  Object.entries(data || {}).forEach(([uid, items])=>{
    Object.entries(items || {}).forEach(([id, result])=> rows.push({ uid, id, ...result }));
  });
  return rows.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
}

function updateStats(){
  const pending = state.allPayments.filter(x=>x.status === 'pending').length;
  const approved = state.allPayments.filter(x=>x.status === 'approved').length;
  const participants = Object.values(state.allUsers).filter(x=>x.role === 'participant').length;
  const results = state.allResults.length;
  document.getElementById('statParticipants').textContent = participants;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statApproved').textContent = approved;
  document.getElementById('statResults').textContent = results;
  document.getElementById('dashboardPaymentsMini').innerHTML = pending ? `<span class="badge pending">${pending} pembayaran menunggu</span>` : '<span class="badge approved">Tidak ada antrean</span>';
}

function renderPayments(){
  const tbody = document.getElementById('paymentsBody');
  const rows = state.allPayments;
  if(!rows.length){ tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Belum ada data pembayaran.</div></td></tr>'; return; }
  tbody.innerHTML = rows.map(item=>`
    <tr>
      <td><strong>${item.participantName || state.allUsers[item.uid]?.name || '-'}</strong><br><small>${item.participantEmail || state.allUsers[item.uid]?.email || ''}</small></td>
      <td>${item.senderName}<br><small>${item.senderBank}</small></td>
      <td>${rupiah(item.amount)}</td>
      <td>${formatDateTime(item.createdAt)}</td>
      <td><span class="badge ${item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending'}">${labelStatus(item.status)}</span></td>
      <td><button class="btn btn-secondary btn-sm" data-open-payment="${item.uid}__${item.id}">Tinjau</button></td>
    </tr>
  `).join('');
  tbody.querySelectorAll('[data-open-payment]').forEach(btn=>btn.addEventListener('click', ()=> openPayment(btn.dataset.openPayment)));
}

function renderParticipants(){
  const tbody = document.getElementById('participantsBody');
  const users = Object.values(state.allUsers).filter(x=>x.role === 'participant').sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  if(!users.length){ tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Belum ada peserta terdaftar.</div></td></tr>'; return; }
  tbody.innerHTML = users.map(u=>{
    const latestResult = state.allResults.find(r=>r.uid === u.uid);
    const access = state.accessMap?.[u.uid];
    return `
      <tr>
        <td><strong>${u.name || '-'}</strong><br><small>${u.email || ''}</small></td>
        <td>${u.className || '-'}</td>
        <td>${u.school || '-'}</td>
        <td>${access?.paymentApproved ? '<span class="badge approved">Aktif</span>' : '<span class="badge pending">Belum aktif</span>'}</td>
        <td>${latestResult ? latestResult.recommendations?.[0]?.cluster || '-' : '-'}</td>
        <td>${latestResult ? formatDateTime(latestResult.createdAt) : '-'}</td>
      </tr>
    `;
  }).join('');
}

function renderRecentResults(){
  const wrap = document.getElementById('recentResults');
  const rows = state.allResults.slice(0,6);
  if(!rows.length){ wrap.innerHTML = '<div class="empty">Belum ada hasil asesmen dari peserta.</div>'; return; }
  wrap.innerHTML = rows.map(r=>`
    <div class="history-item">
      <div>
        <strong>${r.participant?.name || state.allUsers[r.uid]?.name || '-'}</strong>
        <small>${r.recommendations?.[0]?.cluster || '-'} • ${formatDateTime(r.createdAt)}</small>
      </div>
      <div class="inline-actions"><span class="badge info">${r.topRiasec?.map(x=>x.code).join('-') || 'Profil'}</span></div>
    </div>
  `).join('');
}

function labelStatus(status){
  return status === 'approved' ? 'Disetujui' : status === 'rejected' ? 'Ditolak' : 'Menunggu';
}

function openPayment(token){
  const [uid, id] = token.split('__');
  const item = state.allPayments.find(p=>p.uid === uid && p.id === id);
  if(!item) return;
  state.selectedPayment = item;
  document.getElementById('paymentReviewProof').innerHTML = `<img src="${item.proofDataUrl}" alt="Bukti transfer">`;
  document.getElementById('paymentReviewMeta').innerHTML = `
    <div class="reco-card"><b>${item.participantName || state.allUsers[item.uid]?.name || '-'}</b><small>${item.participantEmail || state.allUsers[item.uid]?.email || ''}</small></div>
    <div class="reco-card"><b>Transfer atas nama</b><small>${item.senderName} • ${item.senderBank}</small></div>
    <div class="reco-card"><b>Jumlah</b><small>${rupiah(item.amount)} • ${formatDateTime(item.createdAt)}</small></div>
  `;
  document.getElementById('reviewNote').value = item.note || '';
  toggleModal(document.getElementById('paymentModal'), true);
}

document.getElementById('closePaymentModal')?.addEventListener('click', ()=> toggleModal(document.getElementById('paymentModal'), false));
document.getElementById('paymentModal')?.addEventListener('click', (e)=>{ if(e.target.id === 'paymentModal') toggleModal(document.getElementById('paymentModal'), false); });

document.getElementById('approvePaymentBtn')?.addEventListener('click', ()=> updatePaymentStatus('approved'));
document.getElementById('rejectPaymentBtn')?.addEventListener('click', ()=> updatePaymentStatus('rejected'));

async function updatePaymentStatus(status){
  if(!state.selectedPayment) return;
  const note = document.getElementById('reviewNote').value.trim();
  const paymentRef = dbRefs.payment(state.selectedPayment.uid, state.selectedPayment.id);
  await update(paymentRef, { status, note, updatedAt: Date.now(), adminUid: state.user.uid });
  if(status === 'approved'){
    await set(dbRefs.access(state.selectedPayment.uid), {
      paymentApproved: true,
      paymentId: state.selectedPayment.id,
      paymentApprovedAt: Date.now(),
      amount: state.selectedPayment.amount,
      approvedBy: state.user.uid
    });
  }
  if(status === 'rejected'){
    await set(dbRefs.access(state.selectedPayment.uid), {
      paymentApproved: false,
      paymentId: state.selectedPayment.id,
      paymentApprovedAt: null,
      amount: state.selectedPayment.amount,
      approvedBy: null
    });
  }
  toggleModal(document.getElementById('paymentModal'), false);
}

document.getElementById('settingsForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    price: Number(document.getElementById('settingPrice').value || 59000),
    bankName: document.getElementById('settingBankName').value.trim(),
    accountNumber: document.getElementById('settingAccountNumber').value.trim(),
    accountName: document.getElementById('settingAccountName').value.trim(),
    updatedAt: Date.now(),
    updatedBy: state.user.uid
  };
  await set(dbRefs.settingsPublic(), payload);
  setMessage(document.getElementById('settingsMsg'), 'Pengaturan berhasil disimpan.', 'success');
});

function fillSettings(){
  document.getElementById('settingPrice').value = state.settings.price;
  document.getElementById('settingBankName').value = state.settings.bankName || '';
  document.getElementById('settingAccountNumber').value = state.settings.accountNumber || '';
  document.getElementById('settingAccountName').value = state.settings.accountName || '';
}

async function init(){
  const { user, profile } = await guardPage('admin');
  state.user = user;
  state.profile = profile;
  paintProfile();

  listen(dbRefs.settingsPublic(), (data)=>{ state.settings = { ...defaultPublicSettings(), ...(data || {}) }; fillSettings(); });
  listen(ref(db, 'users'), (data)=>{ state.allUsers = data || {}; renderParticipants(); updateStats(); });
  listen(ref(db, 'payments'), (data)=>{ state.allPayments = flattenPayments(data); renderPayments(); updateStats(); });
  listen(ref(db, 'results'), (data)=>{ state.allResults = flattenResults(data); renderRecentResults(); renderParticipants(); updateStats(); });
  listen(ref(db, 'access'), (data)=>{ state.accessMap = data || {}; renderParticipants(); });

  activateSection('section-dashboard');
}

init().catch(console.error);
