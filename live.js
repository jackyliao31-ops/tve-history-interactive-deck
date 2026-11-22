/* Firebase 即時投票：第 2 頁開場投票、第 29 頁政策投票＋理由牆。連不上網路時改為本機點選計數 */
const SLUG = 'tve1966';
const cfg = {
  apiKey: "AIzaSyBsckipoy9c8P64nK7Zc-pV0at7BUZ_7sw",
  authDomain: "changchih-class.firebaseapp.com",
  projectId: "changchih-class",
  storageBucket: "changchih-class.firebasestorage.app",
  messagingSenderId: "750042810845",
  appId: "1:750042810845:web:f4a9a07ae6923633728e34"
};
const POLLS = ['open', 'policy'];
const local = { open: {}, policy: {} };

function renderPoll(kind, counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  document.querySelectorAll(`[data-poll=${kind}] .opt`).forEach(o => {
    const n = counts[o.dataset.choice] || 0;
    o.querySelector('.n').textContent = n;
    o.querySelector('.bar').style.height = total ? (n / total * 70) + '%' : 0;
  });
  document.querySelectorAll(`[data-total=${kind}]`).forEach(e => e.textContent = total);
}

/* 理由牆：最新的在前，最多 12 則；點一則可在投影幕上隱藏（只影響本機畫面） */
const hidden = new Set();
function renderWall(items) {
  const wall = document.getElementById('wall');
  if (!wall) return;
  const show = items.filter(r => r.reason && !hidden.has(r.id)).slice(0, 12);
  if (!show.length) { wall.innerHTML = '<p class="rwall-empty">同學寫的理由會即時出現在這裡（點一則可隱藏）</p>'; return; }
  wall.replaceChildren(...show.map(r => {
    const d = document.createElement('div'); d.className = 'rs'; d.title = '點一下隱藏';
    const b = document.createElement('b'); b.textContent = r.choice;
    d.append(b, document.createTextNode(r.reason));
    d.addEventListener('click', () => { hidden.add(r.id); renderWall(items); });
    return d;
  }));
}

let db = null, fs = null;
try {
  const app = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
  fs = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
  db = fs.getFirestore(app.initializeApp(cfg));
} catch (e) { console.warn('Firebase 無法載入，改用本機計數', e); }

/* 講者端也可直接點選項（現場舉手後代為輸入） */
POLLS.forEach(kind => document.querySelectorAll(`[data-poll=${kind}] .opt`).forEach(o => o.addEventListener('click', async () => {
  const c = o.dataset.choice;
  if (db) {
    const doc = kind === 'policy' ? { choice: c, reason: '', ts: fs.serverTimestamp() } : { choice: c, ts: fs.serverTimestamp() };
    try { await fs.addDoc(fs.collection(db, `${SLUG}_${kind}`), doc); return; } catch (e) { console.warn(e); }
  }
  local[kind][c] = (local[kind][c] || 0) + 1; renderPoll(kind, local[kind]);
})));

if (db) {
  POLLS.forEach(kind => fs.onSnapshot(fs.collection(db, `${SLUG}_${kind}`), snap => {
    const c = {}, items = [];
    snap.forEach(d => {
      const v = d.data(); c[v.choice] = (c[v.choice] || 0) + 1;
      items.push({ id: d.id, choice: v.choice, reason: (v.reason || '').trim(), t: v.ts?.toMillis?.() ?? Date.now() });
    });
    renderPoll(kind, c);
    if (kind === 'policy') renderWall(items.sort((a, b) => b.t - a.t));
  }, err => console.warn('投票資料讀取失敗，改用本機計數', err)));
}
