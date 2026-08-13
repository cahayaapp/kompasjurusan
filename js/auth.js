import {
  auth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, onAuthStateChanged, updateProfile, getProfile, upsertUser
} from './firebase.js';
import { ensurePublicSettings, fillPublicPrices, setMessage, renderBrand } from './common.js';

const authBox = document.getElementById('authBox');
const sessionHint = document.getElementById('sessionHint');
const authForm = document.getElementById('authForm');
const authMsg = document.getElementById('authMsg');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const titleEl = document.getElementById('authTitle');
const subEl = document.getElementById('authSub');
const forgotBtn = document.getElementById('forgotBtn');
const togglePass = document.getElementById('togglePass');
const passwordInput = document.getElementById('password');
const resetModal = document.getElementById('resetModal');
const closeReset = document.getElementById('closeReset');
const resetForm = document.getElementById('resetForm');
const resetMsg = document.getElementById('resetMsg');
const resetEmail = document.getElementById('resetEmail');
const registerNow = document.querySelector('[data-register-now]');
const regOnly = document.querySelectorAll('.reg-only');
const loginOnly = document.querySelectorAll('.login-only');

let mode = 'login';

function setMode(next){
  mode = next;
  const register = next === 'register';
  tabLogin?.classList.toggle('active', !register);
  tabRegister?.classList.toggle('active', register);
  regOnly.forEach(el=>el.classList.toggle('hidden', !register));
  loginOnly.forEach(el=>el.classList.toggle('hidden', register));
  titleEl.textContent = register ? 'Buat akun peserta' : 'Masuk ke akunmu';
  subEl.textContent = register ? 'Daftar satu kali, lengkapi pembayaran, lalu kamu bisa mengerjakan asesmen dan tes ulang berkali-kali.' : 'Masuk untuk melanjutkan perjalanan mengenali arah studimu.';
  document.getElementById('authSubmit').innerHTML = register ? 'Daftar Sekarang <span>→</span>' : 'Masuk <span>→</span>';
  setMessage(authMsg, '');
}

function routeByRole(profile){
  window.location.href = profile.role === 'admin' ? 'admin.html' : 'peserta.html';
}

async function bootstrap(){
  document.querySelectorAll('[data-brand]').forEach(renderBrand);
  const settings = await ensurePublicSettings();
  fillPublicPrices(settings.price);
  let settled = false;
  const fallback = setTimeout(()=>{
    if(!settled && sessionHint){
      sessionHint.textContent = 'Form siap digunakan. Pemeriksaan sesi masih berjalan di belakang.';
    }
  }, 2200);

  onAuthStateChanged(auth, async (user)=>{
    settled = true;
    clearTimeout(fallback);
    if(user){
      if(sessionHint) sessionHint.textContent = 'Akun ditemukan. Menyiapkan dashboard…';
      const profile = await getProfile(user.uid);
      if(profile?.role){ routeByRole(profile); return; }
    }
    if(sessionHint) sessionHint.classList.add('hidden');
  }, (error)=>{
    settled = true;
    clearTimeout(fallback);
    console.error(error);
    if(sessionHint){
      sessionHint.textContent = 'Pemeriksaan sesi tidak berhasil, tetapi form login tetap dapat digunakan.';
      sessionHint.classList.remove('hidden');
    }
  });
}

function normalizeError(err){
  const code = err?.code || '';
  if(code.includes('auth/invalid-credential')) return 'Email atau kata sandi tidak sesuai.';
  if(code.includes('auth/email-already-in-use')) return 'Email ini sudah digunakan. Silakan masuk.';
  if(code.includes('auth/weak-password')) return 'Kata sandi minimal 6 karakter.';
  if(code.includes('auth/invalid-email')) return 'Format email tidak valid.';
  if(code.includes('auth/too-many-requests')) return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
  return err?.message || 'Terjadi kesalahan. Silakan coba lagi.';
}

authForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  setMessage(authMsg, '');
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value.trim();
  const submitBtn = document.getElementById('authSubmit');
  submitBtn.disabled = true;
  submitBtn.textContent = mode === 'register' ? 'Membuat akun…' : 'Memproses…';
  try {
    if(mode === 'login'){
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getProfile(cred.user.uid);
      if(!profile) throw new Error('Akun tidak ditemukan. Silakan hubungi admin.');
      routeByRole(profile);
      return;
    }

    const name = document.getElementById('regName').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const consent = document.getElementById('consent').checked;
    if(!name) throw new Error('Nama lengkap wajib diisi.');
    if(password !== confirmPassword) throw new Error('Konfirmasi kata sandi tidak sama.');
    if(!consent) throw new Error('Silakan setujui pernyataan terlebih dahulu.');

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await upsertUser(cred.user.uid, {
      uid: cred.user.uid,
      name,
      email,
      role: 'participant',
      status: 'active',
      lastLoginAt: Date.now()
    });
    setMessage(authMsg, 'Akun berhasil dibuat. Sebentar, kamu diarahkan ke ruang peserta…', 'success');
    setTimeout(()=>window.location.href='peserta.html', 700);
  } catch(err){
    setMessage(authMsg, normalizeError(err), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = mode === 'register' ? 'Daftar Sekarang <span>→</span>' : 'Masuk <span>→</span>';
  }
});

forgotBtn?.addEventListener('click', ()=> resetModal.classList.add('show'));
closeReset?.addEventListener('click', ()=> resetModal.classList.remove('show'));
resetModal?.addEventListener('click', (e)=>{ if(e.target === resetModal) resetModal.classList.remove('show'); });

togglePass?.addEventListener('click', ()=>{
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePass.textContent = isPassword ? 'Sembunyi' : 'Lihat';
});

tabLogin?.addEventListener('click', ()=> setMode('login'));
tabRegister?.addEventListener('click', ()=> setMode('register'));
registerNow?.addEventListener('click', ()=>{ setMode('register'); document.getElementById('regName')?.focus(); window.scrollTo({ top: 0, behavior:'smooth' }); });

resetForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  try{
    await sendPasswordResetEmail(auth, resetEmail.value.trim());
    setMessage(resetMsg, 'Tautan reset berhasil dikirim ke email tersebut.', 'success');
  }catch(err){
    setMessage(resetMsg, normalizeError(err), 'error');
  }
});

bootstrap();
