// ============================================================
// main.js — page animations (terminal typing, uptime, reveal)
// No Firebase dependency. Loaded as a plain script.
// ============================================================

// ---- Terminal typing sequence ----
const lines = [
  { p: '~$', c: 'whoami' },
  { o: 'khush_jain — CSE (AI & ML), VIT Pune' },
  { p: '~$', c: 'status --current' },
  { o: 'building real-time systems, ML pipelines & OS-level schedulers' },
  { p: '~$', c: 'cat stats.log' },
  { o: '150+ leetcode solved · 15+ hackathons · 1 publication · CGPA 9.33' },
  { p: '~$', c: './open --internships' },
  { o: 'accepting offers... type y/n' }
];
const termBody = document.getElementById('termBody');
let li = 0;

function typeNext() {
  if (li >= lines.length) {
    const cur = document.createElement('span');
    cur.className = 'cursor';
    termBody.appendChild(cur);
    return;
  }
  const item = lines[li];
  if (item.p) {
    const div = document.createElement('div');
    div.className = 'term-line';
    const promptSpan = document.createElement('span');
    promptSpan.className = 'prompt';
    promptSpan.textContent = item.p + ' ';
    const cmdSpan = document.createElement('span');
    cmdSpan.className = 'cmd';
    div.appendChild(promptSpan);
    div.appendChild(cmdSpan);
    termBody.appendChild(div);
    const text = item.c;
    let idx = 0;
    const iv = setInterval(() => {
      cmdSpan.textContent += text[idx];
      idx++;
      if (idx >= text.length) { clearInterval(iv); li++; setTimeout(typeNext, 260); }
    }, 32);
  } else {
    const div = document.createElement('div');
    div.className = 'term-out';
    div.textContent = item.o;
    div.style.opacity = 0;
    termBody.appendChild(div);
    requestAnimationFrame(() => { div.style.transition = 'opacity .4s'; div.style.opacity = 1; });
    li++; setTimeout(typeNext, 320);
  }
}
setTimeout(typeNext, 400);

// ---- Uptime counter ----
const start = Date.now();
function pad(n) { return n.toString().padStart(2, '0'); }
function tickUptime() {
  const diff = Math.floor((Date.now() - start) / 1000);
  const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
  document.getElementById('uptime').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}
setInterval(tickUptime, 1000);

// ---- Reveal on scroll ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
