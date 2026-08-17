import { auth, dbRefs, get, set, onAuthStateChanged } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { renderBrand, setMessage, toggleModal, getPublicSettings } from './common.js';

const els = {
  tabLogin: document.getElementById('tabLogin'),
  tabRegister: document.getElementById('tabRegister'),
  authTitle: document.getElementById('authTitle'),
  authSub: document.getElementById('authSub'),
  authForm: document.getElementById('authForm'),
  authSubmit: document.getElementById('authSubmit'),
  authMsg: document.getElementById('authMsg'),
  regOnly: [...document.querySelectorAll('.reg-only')],
  loginOnly: [...document.querySelectorAll('.login-only')],
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  confirmPassword: document.getElementById('confirmPassword'),
  regName: document.getElementById('regName'),
  consent: document.getElementById('consent'),
  togglePass: document.getElementById('togglePass'),
  forgotBtn: document.getElementById('forgotBtn'),
  resetModal: document.getElementById('resetModal'),
  closeReset: document.getElementById('closeReset'),
  resetForm: document.getElementById('resetForm'),
  resetEmail: document.getElementById('resetEmail'),
  resetMsg: document.getElementById('resetMsg'),
  sessionLoading: document.getElementById('sessionLoading'),
  authBox: document.getElementById('authBox')
};

let mode = 'login';

document.querySelectorAll('[data-brand]').forEach(renderBrand);

document.querySelectorAll('[data-register-now]').forEach(btn=> btn.addEventListener('click', ()=>{
  switchMode('register');
  document.getElementById('authBox')?.scrollIntoView({ behavior:'smooth', block:'start' });
}));

function switchMode(next){
  mode = next;
  els.tabLogin?.classList.toggle('active', mode==='login');
  els.tabRegister?.classList.toggle('active', mode==='register');
  els.regOnly.forEach(el => el.classList.toggle('hidden', mode !== 'register'));
  els.loginOnly.forEach(el => el.classList.toggle('hidden', mode !== 'login'));
  els.authTitle.textContent = mode === 'login' ? 'Masuk ke akunmu' : 'Daftar peserta baru';
  els.authSub.textContent = mode === 'login' ? 'Masuk untuk melanjutkan perjalanan mengenali arah studimu.' : 'Buat akun terlebih dahulu, lalu aktivasi akses dengan pembayaran satu kali.';
  els.authSubmit.innerHTML = mode === 'login' ? 'Masuk <span>→</span>' : 'Daftar sekarang <span>→</span>';
  setMessage(els.authMsg, '');
}

function describeError(err){
  const code = err?.code || '';
  if(code.includes('auth/invalid-credential')) return 'Email atau kata sandi tidak cocok.';
  if(code.includes('auth/email-already-in-use')) return 'Email ini sudah terdaftar. Silakan masuk.';
  if(code.includes('auth/weak-password')) return 'Kata sandi terlalu lemah. Minimal 6 karakter.';
  if(code.includes('auth/invalid-email')) return 'Format email tidak valid.';
  if(code.includes('auth/network-request-failed')) return 'Koneksi ke layanan login gagal. Pastikan domain aplikasi sudah diizinkan di Firebase.';
  if(code.includes('auth/operation-not-allowed')) return 'Metode Email/Password belum diaktifkan di Firebase Authentication.';
  return err?.message || 'Terjadi kesalahan. Silakan coba lagi.';
}

els.tabLogin?.addEventListener('click', ()=> switchMode('login'));
els.tabRegister?.addEventListener('click', ()=> switchMode('register'));
els.togglePass?.addEventListener('click', ()=>{
  const type = els.password.type === 'password' ? 'text' : 'password';
  els.password.type = type;
  if(els.confirmPassword) els.confirmPassword.type = type;
  els.togglePass.textContent = type === 'password' ? 'Lihat' : 'Sembunyi';
});

els.forgotBtn?.addEventListener('click', ()=>{
  els.resetEmail.value = els.email.value.trim();
  toggleModal(els.resetModal, true);
});
els.closeReset?.addEventListener('click', ()=> toggleModal(els.resetModal, false));
els.resetModal?.addEventListener('click', e=>{ if(e.target === els.resetModal) toggleModal(els.resetModal, false); });

els.resetForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  try{
    await sendPasswordResetEmail(auth, els.resetEmail.value.trim());
    setMessage(els.resetMsg, 'Tautan reset kata sandi telah dikirim ke email tersebut.', 'success');
  }catch(err){ setMessage(els.resetMsg, describeError(err), 'error'); }
});

els.authForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = els.email.value.trim();
  const password = els.password.value;
  try{
    setMessage(els.authMsg, mode === 'login' ? 'Sedang masuk ke akun...' : 'Sedang membuat akun...', 'info');
    if(mode === 'register'){
      if(!els.regName.value.trim()) throw new Error('Nama lengkap wajib diisi.');
      if(password.length < 6) throw new Error('Kata sandi minimal 6 karakter.');
      if(password !== els.confirmPassword.value) throw new Error('Konfirmasi kata sandi tidak sama.');
      if(!els.consent.checked) throw new Error('Silakan centang persetujuan terlebih dahulu.');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await set(dbRefs.user(cred.user.uid), {
        uid: cred.user.uid,
        name: els.regName.value.trim(),
        email,
        role: 'participant',
        className: '',
        school: '',
        gender: '',
        createdAt: Date.now()
      });
      await set(dbRefs.access(cred.user.uid), { paymentApproved:false });
      setMessage(els.authMsg, 'Akun berhasil dibuat. Mengarahkan ke ruang peserta...', 'success');
    }else{
      await signInWithEmailAndPassword(auth, email, password);
      setMessage(els.authMsg, 'Login berhasil. Mengarahkan...', 'success');
    }
  }catch(err){
    setMessage(els.authMsg, describeError(err), 'error');
  }
});

async function boot(){
  const settings = await getPublicSettings();
  document.querySelectorAll('[data-public-price]').forEach(el=> el.textContent = new Intl.NumberFormat('id-ID',{ style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(settings.price));
  const offer = document.querySelector('.offer-chip');
  if(offer){ offer.innerHTML = `<div><small>Akses penuh</small><strong>${new Intl.NumberFormat('id-ID',{ style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(settings.price)}</strong><p>Sekali bayar, lalu tes ulang berkali-kali setelah pembayaran diverifikasi.</p></div><div class="chip">108 butir • 4 dimensi</div>`; }
  els.sessionLoading.classList.add('hidden');
  els.authBox.classList.remove('hidden');
  onAuthStateChanged(auth, async user => {
    if(!user) return;
    const snap = await get(dbRefs.user(user.uid));
    const profile = snap.val() || {};
    window.location.href = profile.role === 'admin' ? 'admin.html' : 'peserta.html';
  });
}

boot();
switchMode('login');
