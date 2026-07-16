// ============================================================
// admin.js
// Handles the admin login (Firebase Authentication), the four
// modals (login, add-project, add-cert, add-publication), and
// writing new items to Firestore. Real access control lives in
// firestore.rules — this file only controls what the *UI* shows.
// ============================================================

import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { renderExtraProjects, renderExtraCerts, renderExtraPubs } from './render.js';

// ---- Auth state ----
onAuthStateChanged(auth, (user) => {
  const isAdmin = !!user;
  document.body.classList.toggle('is-admin', isAdmin);
  const fab = document.getElementById('adminFab');
  fab.classList.toggle('on', isAdmin);
  fab.title = isAdmin ? 'Logout of admin' : 'Admin login';
});

document.getElementById('adminFab').addEventListener('click', () => {
  if (auth.currentUser) {
    signOut(auth);
  } else {
    openModal('loginModal');
  }
});

document.getElementById('loginSubmit').addEventListener('click', async () => {
  const email = document.getElementById('adminEmailInput').value.trim();
  const pass = document.getElementById('adminPassInput').value;
  const errorEl = document.getElementById('loginError');
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeModal('loginModal');
    errorEl.style.display = 'none';
    document.getElementById('adminEmailInput').value = '';
    document.getElementById('adminPassInput').value = '';
  } catch (err) {
    errorEl.textContent = 'Login failed: ' + err.message;
    errorEl.style.display = 'block';
  }
});

// ---- Modal open/close ----
export function openModal(id) { document.getElementById(id).classList.add('open'); }
export function closeModal(id) { document.getElementById(id).classList.remove('open'); }
window.openModal = openModal;
window.closeModal = closeModal;

document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
});
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay').id));
});

// ---- "+ add" trigger buttons ----
document.getElementById('addProjectBtn').addEventListener('click', () => openModal('projectModal'));
document.getElementById('addCertBtn').addEventListener('click', () => openModal('certModal'));
document.getElementById('addPubBtn').addEventListener('click', () => openModal('pubModal'));

// ---- Add project ----
document.getElementById('projectSubmit').addEventListener('click', async () => {
  const title = document.getElementById('p_title').value.trim();
  if (!title) { alert('Title is required.'); return; }
  await addDoc(collection(db, 'projects'), {
    title,
    status: document.getElementById('p_status').value.trim(),
    desc: document.getElementById('p_desc').value.split('\n').map(s => s.trim()).filter(Boolean),
    tags: document.getElementById('p_tags').value.split(',').map(s => s.trim()).filter(Boolean),
    demo: document.getElementById('p_demo').value.trim(),
    github: document.getElementById('p_github').value.trim(),
    createdAt: serverTimestamp()
  });
  ['p_title', 'p_status', 'p_desc', 'p_tags', 'p_demo', 'p_github'].forEach(id => document.getElementById(id).value = '');
  closeModal('projectModal');
  renderExtraProjects();
});

// ---- Add certification ----
document.getElementById('certSubmit').addEventListener('click', async () => {
  const title = document.getElementById('c_title').value.trim();
  if (!title) { alert('Title is required.'); return; }
  await addDoc(collection(db, 'certifications'), {
    title,
    org: document.getElementById('c_org').value.trim(),
    date: document.getElementById('c_date').value.trim(),
    link: document.getElementById('c_link').value.trim(),
    createdAt: serverTimestamp()
  });
  ['c_title', 'c_org', 'c_date', 'c_link'].forEach(id => document.getElementById(id).value = '');
  closeModal('certModal');
  renderExtraCerts();
});

// ---- Add publication / research paper ----
document.getElementById('pubSubmit').addEventListener('click', async () => {
  const title = document.getElementById('pub_title').value.trim();
  if (!title) { alert('Paper title is required.'); return; }
  await addDoc(collection(db, 'publications'), {
    title,
    venue: document.getElementById('pub_venue').value.trim(),
    date: document.getElementById('pub_date').value.trim(),
    note: document.getElementById('pub_note').value.trim(),
    link: document.getElementById('pub_link').value.trim(),
    createdAt: serverTimestamp()
  });
  ['pub_title', 'pub_venue', 'pub_date', 'pub_note', 'pub_link'].forEach(id => document.getElementById(id).value = '');
  closeModal('pubModal');
  renderExtraPubs();
});

// ---- Remove (event delegation, since items are re-rendered) ----
document.addEventListener('click', async (e) => {
  const target = e.target.closest('.extra-item-remove');
  if (!target) return;
  const coll = target.dataset.collection;
  const id = target.dataset.id;
  if (!coll || !id) return;
  if (!confirm('Remove this item for everyone?')) return;
  await deleteDoc(doc(db, coll, id));
  if (coll === 'projects') renderExtraProjects();
  if (coll === 'certifications') renderExtraCerts();
  if (coll === 'publications') renderExtraPubs();
});
