import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getDatabase, ref, child, get, set, update, push, onValue, query, orderByChild, equalTo, remove
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAyxH4C8mQdHnP7AnKuMGEiop9RxnuxIr8',
  authDomain: 'kompasjurusan-dc89f.firebaseapp.com',
  projectId: 'kompasjurusan-dc89f',
  storageBucket: 'kompasjurusan-dc89f.firebasestorage.app',
  messagingSenderId: '417505745100',
  appId: '1:417505745100:web:dfba19e915d828edbb0a69',
  databaseURL: 'https://kompasjurusan-dc89f-default-rtdb.firebaseio.com/'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const dbRefs = {
  users: (uid='') => ref(db, `users/${uid}`),
  settingsPublic: () => ref(db, 'settings/public'),
  settingsAdmin: () => ref(db, 'settings/admin'),
  payments: (uid='') => ref(db, `payments/${uid}`),
  payment: (uid, paymentId) => ref(db, `payments/${uid}/${paymentId}`),
  access: (uid='') => ref(db, `access/${uid}`),
  drafts: (uid='') => ref(db, `drafts/${uid}`),
  results: (uid='') => ref(db, `results/${uid}`),
  result: (uid, resultId) => ref(db, `results/${uid}/${resultId}`),
  publicStats: () => ref(db, 'publicStats'),
};

async function getSnapshot(pathRef){ return get(pathRef); }

async function getProfile(uid){
  const snap = await get(dbRefs.users(uid));
  return snap.exists() ? snap.val() : null;
}

async function upsertUser(uid, payload){
  const existingSnap = await get(dbRefs.users(uid));
  const existing = existingSnap.exists() ? existingSnap.val() : {};
  const merged = { ...existing, ...payload, updatedAt: Date.now() };
  if(!merged.createdAt) merged.createdAt = Date.now();
  await set(dbRefs.users(uid), merged);
  return merged;
}

function listen(pathRef, cb){
  return onValue(pathRef, snap => cb(snap.exists() ? snap.val() : null, snap));
}

export {
  app, auth, db, ref, child, get, set, update, push, query, orderByChild, equalTo, onValue,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail,
  signOut, updateProfile, onAuthStateChanged, remove,
  dbRefs, getSnapshot, getProfile, upsertUser, listen
};
