import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getDatabase, ref, get, set, update, push, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAyxH4C8mQdHnP7AnKuMGEiop9RxnuxIr8',
  authDomain: 'kompasjurusan-dc89f.firebaseapp.com',
  projectId: 'kompasjurusan-dc89f',
  storageBucket: 'kompasjurusan-dc89f.firebasestorage.app',
  messagingSenderId: '417505745100',
  appId: '1:417505745100:web:dfba19e915d828edbb0a69',
  databaseURL: 'https://kompasjurusan-dc89f-default-rtdb.firebaseio.com/'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export { ref, get, set, update, push, onValue, onAuthStateChanged, signOut, serverTimestamp };

export const dbRefs = {
  user: uid => ref(db, `users/${uid}`),
  settingsPublic: () => ref(db, 'settings/public'),
  paymentRoot: uid => ref(db, `payments/${uid}`),
  payment: (uid, id) => ref(db, `payments/${uid}/${id}`),
  paymentIndexRoot: () => ref(db, 'paymentIndex'),
  paymentIndex: id => ref(db, `paymentIndex/${id}`),
  access: uid => ref(db, `access/${uid}`),
  draft: uid => ref(db, `drafts/${uid}`),
  resultsRoot: uid => ref(db, `results/${uid}`),
  result: (uid, id) => ref(db, `results/${uid}/${id}`)
};
