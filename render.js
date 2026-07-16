// ============================================================
// render.js
// Reads the "projects", "certifications", and "publications"
// collections from Firestore and renders them into the page.
// This runs for every visitor — it is the "public read" half
// of the admin panel. Writes happen in admin.js.
// ============================================================

import { db } from './firebase-config.js';
import {
  collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
export function escapeAttr(s) {
  return (s || '').replace(/"/g, '&quot;');
}

async function fetchCollection(name) {
  try {
    const q = query(collection(db, name), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`Failed to load "${name}" from Firestore:`, err);
    return [];
  }
}

export async function renderExtraProjects() {
  const items = await fetchCollection('projects');
  const el = document.getElementById('extraProjects');
  if (!el) return;
  el.innerHTML = items.map((p, i) => `
    <div class="proj">
      <div class="proj-pid">PID<span class="n">+${i + 1}</span></div>
      <div>
        <div class="proj-head">
          <div class="proj-title">${escapeHtml(p.title)}</div>
          <div class="proj-status">${escapeHtml(p.status || '● new')}</div>
        </div>
        <div class="proj-desc"><ul>${(p.desc || []).map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul></div>
        <div class="proj-tags">${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
        <div class="proj-links">
          ${p.demo ? `<a href="${escapeAttr(p.demo)}" target="_blank">▶ live demo</a>` : ''}
          ${p.github ? `<a href="${escapeAttr(p.github)}" target="_blank">⌘ github</a>` : ''}
          <span class="extra-item-remove" data-collection="projects" data-id="${p.id}">✕ remove</span>
        </div>
      </div>
    </div>`).join('');
}

export async function renderExtraCerts() {
  const items = await fetchCollection('certifications');
  const el = document.getElementById('extraCerts');
  if (!el) return;
  el.innerHTML = items.map(c => `
    <div class="ach-item"><span class="ach-icon">▸</span><span class="ach-text">
      ${c.link ? `<a href="${escapeAttr(c.link)}" target="_blank" style="color:var(--amber);"><b>${escapeHtml(c.title)}</b></a>` : `<b>${escapeHtml(c.title)}</b>`}
      — ${escapeHtml(c.org)} ${c.date ? `(${escapeHtml(c.date)})` : ''}
      <span class="extra-item-remove" data-collection="certifications" data-id="${c.id}">✕ remove</span>
    </span></div>`).join('');
}

export async function renderExtraPubs() {
  const items = await fetchCollection('publications');
  const el = document.getElementById('extraPubs');
  if (!el) return;
  el.innerHTML = items.map(p => `
    <div class="pub-card" style="margin-top:12px;">
      <span class="tag">${escapeHtml(p.venue || 'Paper')} ${p.date ? '· ' + escapeHtml(p.date) : ''}</span>
      <p>${p.link ? `<a href="${escapeAttr(p.link)}" target="_blank" style="color:inherit;text-decoration:underline;">"${escapeHtml(p.title)}"</a>` : `"${escapeHtml(p.title)}"`}</p>
      ${p.note ? `<div class="venue">${escapeHtml(p.note)}</div>` : ''}
      <span class="extra-item-remove" data-collection="publications" data-id="${p.id}">✕ remove</span>
    </div>`).join('');
}

export async function renderAll() {
  await Promise.all([renderExtraProjects(), renderExtraCerts(), renderExtraPubs()]);
}
