import { auth, dbRefs, get, onAuthStateChanged, signOut, getProfile } from './firebase.js';
import { defaultPublicSettings } from './data.js';

export const rupiah = num => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(Number(num || 0));
export const formatDateTime = value => new Date(value || Date.now()).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
export const formatDate = value => new Date(value || Date.now()).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
export const initials = (name='User') => name.split(' ').filter(Boolean).slice(0,2).map(v=>v[0]?.toUpperCase() || '').join('') || 'U';

export function setMessage(target, text='', type='info'){
  if(!target) return;
  if(!text){ target.innerHTML = ''; return; }
  target.innerHTML = `<div class="message ${type}">${text}</div>`;
}

export async function ensurePublicSettings(){
  const snap = await get(dbRefs.settingsPublic());
  if(!snap.exists()){
    await import('./firebase.js').then(({ set }) => set(dbRefs.settingsPublic(), { ...defaultPublicSettings(), updatedAt: Date.now() }));
    return defaultPublicSettings();
  }
  return { ...defaultPublicSettings(), ...snap.val() };
}

export function bindLogout(button){
  if(!button) return;
  button.addEventListener('click', async ()=>{
    await signOut(auth);
    window.location.href = 'index.html';
  });
}

export function toggleModal(el, show){
  if(!el) return;
  el.classList.toggle('show', !!show);
}

export function fileToDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImage(file, maxWidth = 1200, quality = .78){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = ()=>{
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if(width > maxWidth){
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function guardPage(requiredRole){
  return new Promise((resolve, reject)=>{
    onAuthStateChanged(auth, async (user)=>{
      if(!user){
        window.location.href = 'index.html';
        return reject(new Error('No user'));
      }
      const profile = await getProfile(user.uid);
      if(!profile){
        window.location.href = 'index.html';
        return reject(new Error('No profile'));
      }
      if(requiredRole && profile.role !== requiredRole){
        window.location.href = profile.role === 'admin' ? 'admin.html' : 'peserta.html';
        return reject(new Error('Wrong role'));
      }
      resolve({ user, profile });
    });
  });
}

export function renderBrand(host){
  if(!host) return;
  host.innerHTML = `
    <img class="brand-logo" src="assets/logo-icon.svg" alt="Kompas Jurusan">
    <span class="brand-text"><b>Kompas Jurusan</b><small>Cahaya Academy</small></span>
  `;
}

export function fillPublicPrices(value){
  document.querySelectorAll('[data-public-price]').forEach(el=>{
    el.textContent = rupiah(value);
  });
}
