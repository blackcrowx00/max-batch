(() => {
const C = window.CONFIG, PARS = C.pars, N = PARS.length, T = C.teams;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const live = !!(C.firebase && C.firebase.databaseURL && window.firebase);
const store = {
  get: k => { try { return JSON.parse(localStorage.getItem('scr:' + k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem('scr:' + k, JSON.stringify(v)); } catch {} }
};
let scores = live ? {} : (store.get('scores') || {});
let team = Math.min(store.get('team') || 0, T.length - 1), hole = 0, strokes = PARS[0], ready = !live, db;

const get = (t, h) => (scores['t' + t] || {})['h' + (h + 1)];
const fmt = n => n === 0 ? 'E' : n > 0 ? '+' + n : '−' + Math.abs(n);
const label = (s, p) => s === 1 ? 'Hole in one!' : ({'-3':'Albatross','-2':'Eagle','-1':'Birdie','0':'Par','1':'Bogey','2':'Double bogey'}[s - p] || (s - p < 0 ? 'Albatross' : '+' + (s - p)));
const cls = d => d <= -2 ? 'eagle' : d === -1 ? 'birdie' : d === 1 ? 'bogey' : d >= 2 ? 'dbl' : '';
const nextOpen = t => { const i = PARS.findIndex((_, h) => !get(t, h)); return i < 0 ? N - 1 : i; };

function stats(t) {
  let thru = 0, str = 0, par = 0;
  for (let h = 0; h < N; h++) { const s = get(t, h); if (s) { thru++; str += s; par += PARS[h]; } }
  return { t, thru, str, toPar: str - par };
}

function renderBoard() {
  const rows = T.map((_, t) => stats(t)).sort((a, b) => a.toPar - b.toPar || b.thru - a.thru || a.t - b.t);
  const same = (a, b) => a.toPar === b.toPar && (a.thru > 0) === (b.thru > 0);
  $('#board').innerHTML = rows.map(r => {
    const pos = rows.findIndex(x => same(x, r)) + 1, tie = rows.filter(x => same(x, r)).length > 1;
    const started = r.thru > 0;
    return `<li><span class="pos">${started ? (tie ? 'T' : '') + pos : '–'}</span><span class="name">${esc(T[r.t])}</span>
      <span class="topar ${r.toPar < 0 ? 'u' : r.toPar > 0 ? 'o' : ''}">${started ? fmt(r.toPar) : '–'}</span>
      <span class="sub">${started ? (r.thru === N ? 'Final' : 'Thru ' + r.thru) + ' · ' + r.str + ' strokes' : 'Not started'}</span></li>`;
  }).join('');
}

function table(el, from, to, name) {
  const hs = Array.from({ length: to - from }, (_, i) => from + i);
  const sum = a => a.reduce((x, y) => x + y, 0);
  let h = `<thead><tr><th>${name}</th>${hs.map(i => `<th>${i + 1}</th>`).join('')}<th>Tot</th></tr></thead><tbody>`;
  h += `<tr class="par"><th>Par</th>${hs.map(i => `<td>${PARS[i]}</td>`).join('')}<td>${sum(hs.map(i => PARS[i]))}</td></tr>`;
  T.forEach((n, t) => {
    const ss = hs.map(i => get(t, i));
    h += `<tr><th>${esc(n)}</th>${ss.map((s, k) => `<td>${s ? `<span class="m ${cls(s - PARS[hs[k]])}">${s}</span>` : ''}</td>`).join('')}<td><b>${sum(ss.filter(Boolean)) || '–'}</b></td></tr>`;
  });
  el.innerHTML = h + '</tbody>';
}

function renderEnter() {
  $('#teams').innerHTML = T.map((n, t) => `<button data-t="${t}" class="${t === team ? 'on' : ''}">${esc(n)}</button>`).join('');
  $('#chips').innerHTML = PARS.map((_, h) => `<button class="chip ${get(team, h) ? 'done' : ''} ${h === hole ? 'on' : ''}" data-h="${h}">${h + 1}</button>`).join('');
  $('#holeinfo').textContent = `Hole ${hole + 1} · Par ${PARS[hole]}`;
  $('#strokes').textContent = strokes;
  $('#verdict').textContent = label(strokes, PARS[hole]);
  $('#clear').hidden = !get(team, hole);
}

const render = () => { renderBoard(); table($('#front'), 0, 9, 'Out'); table($('#back'), 9, N, 'In'); renderEnter(); };
function pick(h) { hole = h; strokes = get(team, h) || PARS[h]; renderEnter(); }

// ---- data ----
function setScore(t, h, v) {
  if (live) return db.ref(`scores/t${t}/h${h + 1}`).set(v);
  scores['t' + t] = scores['t' + t] || {};
  if (v == null) delete scores['t' + t]['h' + (h + 1)]; else scores['t' + t]['h' + (h + 1)] = v;
  store.set('scores', scores); render();
}

function announce(ev) {
  if (live) db.ref('events').push({ ...ev, ts: firebase.database.ServerValue.TIMESTAMP }); else onEvent(ev);
  if (C.ntfyTopic) fetch('https://ntfy.sh/' + encodeURIComponent(C.ntfyTopic), {
    method: 'POST', headers: { Title: 'Scramble alert' },
    body: `${ev.label}! ${ev.team}: ${ev.strokes} on hole ${ev.hole} (par ${ev.par})`
  }).catch(() => {});
}

// ---- alerts ----
function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * .15;
      o.frequency.value = f; o.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.start(t); o.stop(t + .3);
    });
  } catch {}
}
function onEvent(ev) {
  const msg = `${ev.label}! ${ev.team} made ${ev.strokes} on hole ${ev.hole} (par ${ev.par})`;
  const d = document.createElement('div');
  d.className = 'toast' + (ev.strokes - ev.par <= -2 ? ' eagle' : '');
  d.textContent = (ev.strokes - ev.par <= -2 ? '🦅 ' : '🐦 ') + msg;
  $('#toasts').append(d); setTimeout(() => d.remove(), 8000);
  beep(); navigator.vibrate && navigator.vibrate(200);
  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    new Notification('⛳ ' + ev.label, { body: msg, icon: 'icon-192.png' });
  }
}
const alertsBtn = $('#alerts');
if ('Notification' in window && Notification.permission === 'default') {
  alertsBtn.hidden = false;
  alertsBtn.onclick = () => Notification.requestPermission().then(() => { alertsBtn.hidden = true; });
}

// ---- events ----
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tab) {
    ['board', 'card', 'enter'].forEach(t => $('#tab-' + t).hidden = t !== b.dataset.tab);
    document.querySelectorAll('nav button').forEach(x => x.classList.toggle('on', x === b));
    if (b.dataset.tab === 'enter') pick(nextOpen(team));
  } else if (b.dataset.t) { team = +b.dataset.t; store.set('team', team); pick(nextOpen(team)); }
  else if (b.dataset.h) pick(+b.dataset.h);
  else if (b.id === 'minus') { strokes = Math.max(1, strokes - 1); renderEnter(); }
  else if (b.id === 'plus') { strokes = Math.min(15, strokes + 1); renderEnter(); }
  else if (b.id === 'save') {
    const prev = get(team, hole), par = PARS[hole];
    setScore(team, hole, strokes);
    if (strokes < par && strokes !== prev) announce({ team: T[team], hole: hole + 1, strokes, par, label: label(strokes, par) });
    pick(hole < N - 1 && !get(team, hole + 1) ? hole + 1 : nextOpen(team));
  } else if (b.id === 'clear') { setScore(team, hole, null); pick(hole); }
});

$('#title').textContent = C.title;
document.title = C.title;
$('#mode').hidden = live;
if (live) {
  firebase.initializeApp(C.firebase); db = firebase.database();
  db.ref('scores').on('value', s => { scores = s.val() || {}; render(); });
  const q = db.ref('events').limitToLast(30);
  q.on('child_added', s => { if (ready) onEvent(s.val()); });
  q.once('value', () => { ready = true; });
}
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
