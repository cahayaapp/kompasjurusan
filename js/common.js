import { auth, dbRefs, get, onAuthStateChanged, signOut, onValue } from './firebase.js';
import { defaultPublicSettings } from './data.js';

export function renderBrand(el){
  if(!el) return;
  el.innerHTML = `<img src="assets/logo-icon.svg" alt="Kompas Jurusan" class="brand-logo"><span class="brand-text"><b>Kompas Jurusan</b><small>Cahaya Academy</small></span>`;
}

export function initials(name='User'){
  return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('') || 'U';
}

export function rupiah(n=0){ return new Intl.NumberFormat('id-ID',{ style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(Number(n||0)); }
export function formatDateTime(ts){ if(!ts) return '-'; return new Date(ts).toLocaleString('id-ID',{ dateStyle:'medium', timeStyle:'short' }); }

export function setMessage(target, text='', type='info'){
  if(!target) return;
  target.innerHTML = text ? `<div class="message ${type}">${text}</div>` : '';
}

export function toggleModal(el, show){ if(!el) return; el.classList.toggle('show', !!show); }

export function readFileAsDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function listen(dbRef, cb){ return onValue(dbRef, snap => cb(snap.val())); }

export function onceAuth(){
  return new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, user => { unsub(); resolve(user); });
  });
}

export async function guardPage(requiredRole){
  const user = await onceAuth();
  if(!user){ window.location.href = 'index.html'; throw new Error('Not authenticated'); }
  const snap = await get(dbRefs.user(user.uid));
  const profile = snap.val() || {};
  if(requiredRole && profile.role !== requiredRole){
    window.location.href = profile.role === 'admin' ? 'admin.html' : 'peserta.html';
    throw new Error('Wrong role');
  }
  return { user, profile };
}

export function bindLogout(el){
  if(!el) return;
  el.addEventListener('click', async ()=>{ await signOut(auth); window.location.href = 'index.html'; });
}

export async function getPublicSettings(){
  try{
    const snap = await get(dbRefs.settingsPublic());
    return { ...defaultPublicSettings(), ...(snap.val() || {}) };
  }catch{
    return defaultPublicSettings();
  }
}
