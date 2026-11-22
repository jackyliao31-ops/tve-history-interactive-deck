/* 離線也能運作的互動：時間軸、圖表、分母切換、計時器、QR code */
Reveal.initialize({
  width: 1280, height: 720, margin: 0.02, hash: true, slideNumber: 'c/t',
  transition: 'fade', transitionSpeed: 'fast', center: false, plugins: [RevealNotes]
});

const C = { teal: '#176D66', rust: '#A34F30', pale: '#8FB3AE', grey: '#40565A', line: '#DDD6C6', ink: '#173237' };

/* ---------- 第 3 頁：事件 → 中介 → 教育 ---------- */
const EV = {
  '1965': { ev: '1965 美國對臺經濟援助終止', mid: '美援留下的設備、師資、技術協助；經建部門引進人力資本理論，改以世銀貸款續推人力計畫', edu: '1966 起人力發展計畫、增加高職招生', l1: 'solid', l2: 'dash',
    v: '美援對職業教育的支持與人力規劃可溯（S16；劉曉芬頁 105）。不能把援助終止單獨視為高職擴張的原因。' },
  '1971a': { ev: '1971 聯大第 2758 號決議；1972 上海公報、日中建交', mid: '外交關係與交流機制改變（臺日以民間名義設交流機構）', edu: '尚無文件連到「三比七」或特定學制', l1: 'solid', l2: 'dash',
    v: '文件能證明外交關係改變，尚無直接證據可把這些事件連到三比七或特定學制（S17）。' },
  '1971b': { ev: '1972 西德與中共建交', mid: '西德停止對台職業教育實驗的後續援助與師資訓練（Wissing、Fleckenstein 階梯式教學）', edu: '階梯式教學中止；輪調式建教合作的西德源頭斷線，課程改走美制群集路線', l1: 'solid', l2: 'solid',
    v: '目前唯一有書面中介證據的連結：劉曉芬（2007）頁 111，引方俊育（2000）。' },
  '1973': { ev: '1973 第一次石油危機', mid: '既有重化工業、十大建設與六年經建計畫調整', edu: '營建、設備操作與維修的技能需求', l1: 'solid', l2: 'dash',
    v: '檔案支持危機與經建計畫調整的脈絡；科別或名額的改變仍需招生紀錄（S10、S18）。' },
  '1976': { ev: '1976 工研院與 RCA 技轉契約', mid: '首批 19 人赴美受訓，企業契約取得技術', edu: '產業研發與培訓，不是高職招生政策', l1: 'solid', l2: 'dash',
    v: 'RCA 合約在《臺灣關係法》之前；它證明技術取得的管道，不能推論高職招生（S20）。' },
  '1979': { ev: '1979 美中建交、《臺灣關係法》', mid: '以法律維持商業、文化與其他往來', edu: '不串成單一因果', l1: 'solid', l2: 'dash',
    v: '兩者分別證明制度框架與技轉個案，不串成一因果鏈（S19）。' }
};
document.querySelectorAll('.ev').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.ev').forEach(x => x.classList.remove('on')); b.classList.add('on');
  const d = EV[b.dataset.ev], ch = document.getElementById('chain');
  ch.querySelector('[data-f=ev]').textContent = d.ev;
  ch.querySelector('[data-f=mid]').textContent = d.mid;
  ch.querySelector('[data-f=edu]').textContent = d.edu;
  ch.querySelector('[data-l="1"]').className = 'link ' + d.l1;
  ch.querySelector('[data-l="2"]').className = 'link ' + d.l2;
  document.querySelector('[data-f=verdict]').textContent = d.v;
}));

/* ---------- SVG 折線圖 ---------- */
function lineChart(el, cats, series, opt) {
  const W = 1100, H = opt.h || 400, L = 60, R = 30, T = 20, B = 50, max = opt.max;
  const x = i => L + i * (W - L - R) / (cats.length - 1), y = v => T + (H - T - B) * (1 - v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}">`;
  for (let g = 0; g <= max; g += opt.step) s += `<line x1="${L}" x2="${W - R}" y1="${y(g)}" y2="${y(g)}" stroke="${C.line}"/><text x="${L - 10}" y="${y(g) + 5}" text-anchor="end" font-size="15" fill="${C.grey}">${opt.fmt ? opt.fmt(g) : g}</text>`;
  cats.forEach((c, i) => { if (!opt.every || i % opt.every === 0 || i === cats.length - 1) s += `<text x="${x(i)}" y="${H - 20}" text-anchor="middle" font-size="15" fill="${C.grey}">${c}</text>`; });
  series.forEach((se, k) => {
    const pts = se.data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    s += `<polyline class="ln" data-k="${k}" points="${pts}" fill="none" stroke="${se.color}" stroke-width="${se.w || 3}" stroke-linejoin="round" pathLength="1"/>`;
    s += `<text class="lnl" data-k="${k}" x="${x(cats.length - 1) - 4}" y="${y(se.data.at(-1)) + (se.dy ?? -10)}" text-anchor="end" font-size="16" font-weight="700" fill="${se.color}">${se.name}</text>`;
  });
  s += `<g id="${el.id}-cur"></g></svg>`;
  el.innerHTML = s;
  return { x, y };
}
function animateLines(el) {
  el.querySelectorAll('.ln').forEach(p => {
    p.style.transition = 'none'; p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1;
    requestAnimationFrame(() => requestAnimationFrame(() => { p.style.transition = 'stroke-dashoffset 1.6s ease'; p.style.strokeDashoffset = 0; }));
  });
}

/* 第 9 頁：在學人數 */
const enrolEl = document.getElementById('enrolChart');
lineChart(enrolEl, ['1966', '1971', '1976', '1981', '1986', '1987'], [
  { name: '高中', data: [12.749, 19.0798, 18.1933, 18.2391, 20.0599, 20.6019], color: C.rust },
  { name: '高職', data: [8.3102, 19.8969, 29.6493, 37.4206, 43.7924, 44.7328], color: C.teal, w: 4 }
], { max: 50, step: 10, h: 360 });

/* 第 12 頁：高中職校數 */
const YRS = Array.from({ length: 20 }, (_, i) => 1968 + i);
const HS = [177, 177, 185, 199, 203, 202, 201, 195, 195, 189, 187, 186, 184, 180, 175, 176, 176, 176, 175, 171];
const VPUB = [79, 78, 76, 76, 74, 75, 76, 76, 76, 76, 78, 78, 81, 85, 87, 87, 87, 88, 89, 94];
const VPRI = [55, 63, 70, 92, 97, 96, 97, 101, 102, 107, 106, 106, 110, 111, 115, 115, 114, 113, 115, 115];
const schoolEl = document.getElementById('schoolChart');
const sc = lineChart(schoolEl, YRS, [
  { name: '高中', data: HS, color: C.rust }, { name: '高職公立', data: VPUB, color: C.pale, dy: 24 }, { name: '高職私立', data: VPRI, color: C.teal, w: 4.5 }
], { max: 250, step: 50, h: 430, every: 4 });
function setYear(y) {
  const i = y - 1968, X = sc.x(i);
  document.getElementById('schoolChart-cur').innerHTML =
    `<line x1="${X}" x2="${X}" y1="20" y2="380" stroke="${C.ink}" stroke-dasharray="4 4"/>` +
    [HS, VPUB, VPRI].map((d, k) => `<circle cx="${X}" cy="${sc.y(d[i])}" r="7" fill="${[C.rust, C.pale, C.teal][k]}"/>`).join('');
  document.getElementById('ryr').textContent = y;
  const tot = VPUB[i] + VPRI[i];
  document.getElementById('rvals').innerHTML = `高中 ${HS[i]} 校<br>高職 ${tot} 校（公立 ${VPUB[i]}、<b style="font-size:inherit;color:${C.teal}">私立 ${VPRI[i]}</b>）` +
    (tot > HS[i] ? `<br><span class="rust">高職校數已超過高中</span>` : '') + (VPRI[i] > VPUB[i] ? `<br>私立高職多於公立` : '');
}
const yr = document.getElementById('yr');
yr.addEventListener('input', () => setYear(+yr.value)); setYear(1968);
document.querySelectorAll('.toggles input').forEach(cb => cb.addEventListener('change', () => {
  schoolEl.querySelectorAll(`[data-k="${cb.dataset.s}"]`).forEach(e => e.style.opacity = cb.checked ? 1 : 0);
}));

/* 第 10 頁：分母切換 */
const DEN = {
  a: { big: '68.6%', parts: [['高職 437,924', 437924, C.teal, '#fff'], ['高中 200,599', 200599, '#EFE3D2', C.ink]],
    txt: '高職全體 437,924 人 ÷ 高中、高職全體 638,523 人。分母含各年級，不含五專。' },
  b: { big: '72.5%', parts: [['高職一年級 163,898', 163898, C.teal, '#fff'], ['五專一年級 34,672', 34672, '#4E9C94', '#fff'], ['高中一年級 75,340', 75340, '#EFE3D2', C.ink]],
    txt: '高職及五專一年級 198,570 人 ÷ 高中、高職及五專一年級 273,910 人。較接近入學結構，但不等於招生名額。' }
};
function setDen(k) {
  const d = DEN[k];
  document.getElementById('denomBig').textContent = d.big;
  document.getElementById('denomBar').innerHTML = d.parts.map(p => `<div style="flex:0 0 ${p[1] / d.parts.reduce((a, q) => a + q[1], 0) * 100}%;background:${p[2]};color:${p[3]}">${p[0]}</div>`).join('');
  document.getElementById('denomTxt').textContent = d.txt;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.d === k));
}
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setDen(t.dataset.d))); setDen('a');

/* 第 8 頁：比例條動畫 */
function resetRatio(sec) { sec.querySelectorAll('.rbar i').forEach(i => { i.style.flexBasis = '50%'; }); }
Reveal.on('fragmentshown', e => { e.fragment.querySelectorAll?.('.rbar i').forEach(i => i.style.flexBasis = ''); });

/* 計時器 */
document.querySelectorAll('.timer').forEach(t => {
  const b = t.querySelector('b'), btn = t.querySelector('button'); let left = +t.dataset.min * 60, id = null;
  const show = () => b.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  btn.addEventListener('click', () => {
    if (id) { clearInterval(id); id = null; btn.textContent = '繼續'; return; }
    if (left <= 0) { left = +t.dataset.min * 60; }
    btn.textContent = '暫停';
    id = setInterval(() => { left--; show(); if (left <= 0) { clearInterval(id); id = null; btn.textContent = '重新開始'; b.style.color = '#e07a5f'; } }, 1000);
  });
});

/* QR code：指向同目錄的 vote.html（需部署到網址才有用） */
const voteURL = new URL('vote.html', location.href).href;
if (location.protocol.startsWith('http') && window.QRCode) {
  document.querySelectorAll('[data-qr]').forEach(el => new QRCode(el, { text: voteURL + (el.dataset.qr ? '#' + el.dataset.qr : ''), width: 128, height: 128, colorDark: '#173237', colorLight: '#ffffff' }));
}

Reveal.on('slidechanged', e => {
  if (e.currentSlide.id === 'slide-enrol') animateLines(enrolEl);
  if (e.currentSlide.id === 'slide-schools') animateLines(schoolEl);
  if (e.currentSlide.id === 'slide-ratio') resetRatio(e.currentSlide);
});
Reveal.on('ready', e => { if (e.currentSlide.id === 'slide-ratio') resetRatio(e.currentSlide); });

/* 第 8、12、14 頁：播放靜音動畫片段（全螢幕覆蓋） */
const ov = document.getElementById('animOverlay'), av = document.getElementById('animVid');
document.querySelectorAll('.playanim').forEach(b => b.addEventListener('click', () => {
  av.src = `media/${b.dataset.clip}.mp4`; av.poster = `media/${b.dataset.clip}.png`; ov.hidden = false; av.currentTime = 0; av.play();
}));
function closeAnim() { av.pause(); ov.hidden = true; }
document.getElementById('animClose').addEventListener('click', closeAnim);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.hidden) { e.stopPropagation(); closeAnim(); } }, true);
Reveal.on('slidechanged', () => { closeAnim(); document.querySelectorAll('.fullvid').forEach(v => v.pause()); });
