/* 互動 A–D：學制切換、升學路徑、原件放大、證據分類、政策取捨 */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- B1 第 7 頁：學制前後切換 ---------- */
const SYS = {
  pre: {
    nodes: [['小', '國民學校', '6 年', 0, 40], ['jh', '初級中學', '3 年', 34, 4], ['jv', '初級職業學校', '3 年', 34, 40, 'gone'], ['v5', '五年制高職', '收國小畢業生', 34, 76, 'gone'],
      ['hs', '高級中學', '', 70, 0], ['v3', '高級職業學校', '三年制', 70, 33], ['j5', '五年制專科', '', 70, 66]],
    edges: [['小', 'jh'], ['小', 'jv'], ['小', 'v5'], ['jh', 'hs'], ['jh', 'v3'], ['jh', 'j5']],
    note: '舊制：國小畢業就分流。初級職校與五年制高職直接收國小畢業生。刪除線標示 1968 年後停辦的學制。'
  },
  post: {
    nodes: [['小', '國民小學', '6 年', 0, 40], ['jh', '國民中學', '九年國教 3 年', 34, 40, 'new'],
      ['hs', '普通高中', '', 70, 0], ['v3', '三年制高職', '改收國中畢業生', 70, 25, 'new'], ['j5', '五年制專科', '', 70, 50], ['job', '就業', '', 70, 75]],
    edges: [['小', 'jh'], ['jh', 'hs'], ['jh', 'v3'], ['jh', 'j5'], ['jh', 'job']],
    note: '1968 年後：分流延到國中畢業。初級職校、五年制高職停辦；注意「五年制高職」≠「五年制專科」，五專沒有停辦。'
  }
};
function drawSys(k) {
  const m = $('#sysmap'), d = SYS[k]; if (!m) return;
  const W = m.clientWidth || 700, H = 330, bw = 0.28, bh = 62;
  const pos = {}; d.nodes.forEach(n => pos[n[0]] = { x: n[3] / 100 * W, y: n[4] / 100 * (H - bh) });
  let svg = `<svg viewBox="0 0 ${W} ${H}">` + d.edges.map(([a, b]) => {
    const A = pos[a], B = pos[b], x1 = A.x + bw * W, y1 = A.y + bh / 2, x2 = B.x, y2 = B.y + bh / 2, mx = (x1 + x2) / 2;
    return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="#176D66" stroke-width="2.5"/>`;
  }).join('') + '</svg>';
  m.innerHTML = svg + d.nodes.map(n => `<div class="sb ${n[5] || ''} ${n[0] === '小' || n[0] === 'jh' ? 'mint' : 'sand'}" style="left:${n[3]}%;top:${pos[n[0]].y}px;width:${bw * 100}%;height:${bh}px">${n[1]}${n[2] ? `<small>${n[2]}</small>` : ''}</div>`).join('');
  $('#sysnote').textContent = d.note;
  $$('.tab.sys').forEach(t => t.classList.toggle('on', t.dataset.sys === k));
}
$$('.tab.sys').forEach(t => t.addEventListener('click', () => drawSys(t.dataset.sys)));

/* ---------- B2 第 16 頁：升學路徑 ---------- */
const PN = {
  jh: ['國中', '九年國教後', 0, 40], v3: ['高職', '三年制', 30, 8], j5: ['五專', '五年制專科', 30, 72],
  job: ['就業', '', 64, 0], j2: ['二專', '二年制專科', 64, 36], it: ['技術學院二年制', '1974 臺灣工業技術學院', 64, 72]
};
const PE = [['jh', 'v3'], ['jh', 'j5'], ['v3', 'job'], ['v3', 'j2'], ['j5', 'job'], ['j5', 'it'], ['j2', 'it'], ['j2', 'job']];
const PNOTE = {
  jh: '國中畢業後進入高職或五專（也可讀普通高中），技職體系從這裡開始分支。',
  v3: '高職畢業可直接就業，或報考二專。1971 年第三期人力計畫主張以二年制專科為主（劉曉芬，2007，註 16）。',
  j5: '五專畢業取得專科學歷；1974 年臺灣工業技術學院成立，專科畢業生可經二年制取得學士。',
  j2: '二專畢業同樣是專科學歷，可以就業，或報考技術學院二年制。',
  job: '就業之後仍可能進修；本頁只畫學制上的銜接。', it: '技術學院二年制收專科畢業生，是技職體系往上的一條路。'
};
function drawPaths(sel) {
  const m = $('#pathmap'); if (!m) return;
  const W = m.clientWidth || 1150, H = 380, bw = 190, bh = 64;
  const P = {}; Object.entries(PN).forEach(([k, v]) => P[k] = { x: v[2] / 100 * W, y: v[3] / 100 * (H - bh) });
  const reach = new Set();
  if (sel) { const walk = k => { reach.add(k); PE.filter(e => e[0] === k).forEach(e => walk(e[1])); }; walk(sel); }
  $('.pm-lines', m).setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('.pm-lines', m).innerHTML = PE.map(([a, b]) => {
    const on = sel && reach.has(a) && reach.has(b), A = P[a], B = P[b], x1 = A.x + bw, y1 = A.y + bh / 2, x2 = B.x, y2 = B.y + bh / 2, mx = (x1 + x2) / 2;
    return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="${on ? '#A34F30' : '#C9C1AF'}" stroke-width="${on ? 4 : 2}"/>`;
  }).join('');
  $$('.pn', m).forEach(e => e.remove());
  Object.entries(PN).forEach(([k, v]) => {
    const b = document.createElement('button');
    b.className = `pn ${['jh', 'j2'].includes(k) ? 'mint' : 'sand'} ${sel === k ? 'on' : ''} ${sel && !reach.has(k) ? 'dim' : ''}`;
    b.style.left = P[k].x + 'px'; b.style.top = P[k].y + 'px';
    b.innerHTML = v[0] + (v[1] ? `<small>${v[1]}</small>` : '');
    b.addEventListener('click', () => drawPaths(k)); m.appendChild(b);
  });
  if (sel) $('#pathnote').textContent = PNOTE[sel] + ' 有管道不等於人人可及：名額、報考資格與學費都會限制實際機會。';
}

/* ---------- A 第 19 頁：原件放大 ---------- */
const DOC = {
  enrol: { r: [[72.6, 14, 5.4, 58], [9.5, 18, 13.5, 50]], f: [[72.6, 14, 5.4, 58]],
    t: '二、招生人數：二〇〇名（男生一〇〇名、女生一〇〇名）。<br>九、招生：男女生兼收，以退除役及現役軍人子女為主，不足時以一般身份者補足；年齡十八歲以下國中畢業生；考試分筆試、口試及體檢。' },
  course: { r: [[58.2, 18, 4.6, 50], [21.5, 20, 3, 26]], f: [[56, 14, 8, 56]],
    t: '五、修業課程：（一）依現行教育部訂頒高級工業職業學校教育課程規定實施之。<br>八、授課在高雄工職。' },
  factory: { r: [[55.4, 20, 3, 44], [24.6, 20, 5, 62], [32.4, 18, 3, 30]], f: [[23, 14, 37, 70]],
    t: '五（二）：實習及技能訓練，由合作單位負責擬定。<br>八、每月輪調一次，實習在高雄市楠梓區加昌路的輔導會塑膠工廠。<br>七（四）：技能訓練由工廠紀錄考核之。' },
  grad: { r: [[62.4, 18, 8.8, 32]], f: [[60, 12, 14, 40]],
    t: '四、畢業：修業期滿成績及格，並經技能檢定合格後，由學校發給畢業證書，並轉發技能檢定合格證書。<br>文件寫的是條件；實際有多少人拿到證書，契約回答不了。' }
};
function zoomDoc(k) {
  const v = $('#docview'), inner = $('#docinner'), img = $('img', inner); if (!v || !img.naturalWidth) return;
  $$('.dk').forEach(b => b.classList.toggle('on', b.dataset.k === k));
  const W = v.clientWidth, Hv = v.clientHeight, iw = W, ih = W * img.naturalHeight / img.naturalWidth;
  if (k === 'all' || !DOC[k]) {
    const s = Math.min(1, Hv / ih); inner.style.transform = `translate(${(W - iw * s) / 2}px,${(Hv - ih * s) / 2}px) scale(${s})`;
    $('#dochl').innerHTML = ''; $('#doctext').innerHTML = '點右側按鈕放大原件段落。直書，由右往左讀。'; return;
  }
  const d = DOC[k], [fx, fy, fw, fh] = d.f[0];
  const rx = fx / 100 * iw, ry = fy / 100 * ih, rw = fw / 100 * iw, rh = fh / 100 * ih;
  const s = Math.min(W / rw, Hv / rh, 3.2) * 0.92;
  inner.style.transform = `translate(${W / 2 - (rx + rw / 2) * s}px,${Hv / 2 - (ry + rh / 2) * s}px) scale(${s})`;
  $('#dochl').innerHTML = d.r.map(([x, y, w, h]) => `<div style="left:${x}%;top:${y / 100 * ih}px;width:${w}%;height:${h / 100 * ih}px"></div>`).join('');
  $('#doctext').innerHTML = d.t;
}
$$('.dk').forEach(b => b.addEventListener('click', () => zoomDoc(b.dataset.k)));

/* ---------- D 第 21 頁：證據分類 ---------- */
const CARDS = [
  ['招生 200 人（男女各 100）', 'doc', '第二條明定'], ['每月輪調一次', 'doc', '第八條明定'], ['實習地點：輔導會塑膠工廠', 'doc', '第八條明定'],
  ['課程依教育部課程標準', 'doc', '第五條明定'], ['結業：成績及格＋技能檢定合格', 'doc', '第四條明定'],
  ['實際到班人數', 'track', '計畫名額不等於實際招生'], ['實際工時與工作內容', 'track', '要看工廠紀錄或訪談'],
  ['工廠安全與勞動條件', 'track', '契約沒有寫'], ['學到的技能能否跨公司使用', 'track', '要看課程內容與後續就業'], ['畢業去向', 'track', '要追蹤畢業生']
];
let picked = null;
function setupSort() {
  const pool = $('#sortpool'); if (!pool) return;
  pool.innerHTML = ''; $$('.sortcol .chip').forEach(c => c.remove()); picked = null;
  [...CARDS].sort((a, b) => a[0].length % 3 - b[0].length % 3).forEach(([t, ans, why], i) => {
    const c = document.createElement('div'); c.className = 'chip'; c.textContent = t; c.draggable = true;
    Object.assign(c.dataset, { ans, why, id: i });
    c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', i); picked = c; });
    c.addEventListener('click', e => { e.stopPropagation(); $$('.chip').forEach(x => x.classList.remove('sel')); picked = c; c.classList.add('sel'); });
    pool.appendChild(c);
  });
  $('#sortmsg').textContent = '拖曳卡片到下方欄位（或先點卡片、再點欄位）。';
}
function place(col) {
  if (!picked) return; const c = picked; picked = null; c.classList.remove('sel');
  col.appendChild(c); const ok = c.dataset.ans === col.dataset.col;
  c.classList.toggle('ok', ok); c.classList.toggle('bad', !ok);
  $('#sortmsg').textContent = (ok ? '✓ ' : '再想想：') + c.textContent + '｜' + c.dataset.why;
  const left = $$('#sortpool .chip').length, bad = $$('.sortcol .chip.bad').length;
  if (!left) $('#sortmsg').textContent = bad ? `還有 ${bad} 張放錯，點它再拖到另一欄。` : '全部分對了：契約能證明「規定」，證明不了「實際學到什麼」。';
}
$$('.sortcol').forEach(col => {
  col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
  col.addEventListener('dragleave', () => col.classList.remove('over'));
  col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('over'); place(col); });
  col.addEventListener('click', () => place(col));
});
$('#sortreset')?.addEventListener('click', setupSort);

/* ---------- C 第 31 頁：政策取捨 ---------- */
const D_ = '<span class="tagd">證據</span>', I_ = '<span class="tagi">推論</span>';
const POL = {
  A: { 政府: [`回應 1986 年人力計畫「酌增高中」建議 ${D_}`, `偏離 3：7 規劃目標 ${D_}`],
       企業: [`基層技術人力來源可能變少 ${I_}`, `需要自己補訓練 ${I_}`],
       學校: [`公立高中擴班 ${I_}`, `私立高職招生壓力增加 ${I_}`],
       家庭: [`多一個升大學的選項 ${I_}`, `高職仍占 68.6%，名額要增加多少才夠？ ${D_}`] },
  B: { 政府: [`延續 1973 年起的技術教育一貫體系 ${D_}`, `專科、學院擴充要經費 ${I_}`],
       企業: [`取得較高層的技術人力 ${I_}`, `基層人力可能往上流走 ${I_}`],
       學校: [`1974 年已有臺灣工業技術學院 ${D_}`, `名額與報考資格成為瓶頸 ${I_}`],
       家庭: [`高職生多一條向上的路 ${I_}`, `一年級口徑 72.5% 讀技職，競爭仍激烈 ${D_}`] },
  C: { 政府: [`設備、師資要加碼投入 ${I_}`, `效果比擴名額更難量化 ${I_}`],
       企業: [`建教合作分擔訓練 ${D_}`, `要付出師傅時間與設備 ${I_}`],
       學校: [`建教契約可規範課程與輪調 ${D_}`, `實際學到什麼仍需追蹤 ${I_}`],
       家庭: [`61.2% 讀私立高職，品質改善影響最大 ${D_}`, `學費可能隨品質提高 ${I_}`] }
};
function showPol(p) {
  $$('.tab.pol').forEach(t => t.classList.toggle('on', t.dataset.p === p));
  const g = $('#tgrid'); g.innerHTML = Object.entries(POL[p]).map(([who, [gain, cost]]) =>
    `<div class="tcell"><b>${who}</b><div class="g">＋ ${gain}</div><br><div class="c">－ ${cost}</div></div>`).join('');
  $$('.tcell', g).forEach((c, i) => setTimeout(() => c.classList.add('show'), 120 * i));
}
$$('.tab.pol').forEach(t => t.addEventListener('click', () => showPol(t.dataset.p)));

/* ---------- 切頁時初始化（需要量版面寬度的元件） ---------- */
function initFor(id) {
  if (id === 'slide-system') drawSys($('.tab.sys.on')?.dataset.sys || 'pre');
  if (id === 'slide-paths') drawPaths(null);
  if (id === 'slide-doc') zoomDoc('all');
  if (id === 'slide-sort' && !$('#sortpool').children.length && !$$('.sortcol .chip').length) setupSort();
  if (id === 'slide-tradeoff' && !$('#tgrid').children.length) showPol('A');
}
Reveal.on('slidechanged', e => initFor(e.currentSlide.id));
Reveal.on('ready', e => initFor(e.currentSlide.id));
$('#docinner img')?.addEventListener('load', () => { if (Reveal.getCurrentSlide()?.id === 'slide-doc') zoomDoc('all'); });

/* 輸出 PDF（?print-pdf）時，所有互動頁一次畫好，避免空白 */
if (/print-pdf/.test(location.search)) {
  const drawAll = () => ['slide-system', 'slide-paths', 'slide-doc', 'slide-sort'].forEach(id => { try { initFor(id); } catch (e) { console.warn(id, e); } });
  Reveal.on('ready', drawAll); Reveal.on('pdf-ready', drawAll); setTimeout(drawAll, 1500);
}
