// ---- LoL Flash Tracker (manual) ----
// Five enemy roles, each with a Flash bolt you tap when the enemy flashes.
// Pure timer logic — nothing reads the game.

const ROLES = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'];
const DEFAULT_CD = 300; // Flash base cooldown (seconds)
const WARN_AT = 10; // seconds left when the timer starts pulsing red

// Countdown ring geometry (matches the 40x40 button in markup).
const RING_SIZE = 40;
const RING_CENTER = RING_SIZE / 2;
const RING_R = 17;
const RING_C = 2 * Math.PI * RING_R;

// Official Flash summoner-spell icon (assets/flash.png).
const BOLT_IMG =
  '<img class="bolt" src="assets/flash.png" alt="Flash" draggable="false" />';

let flashCd = clampCd(Number(localStorage.getItem('flashCd')) || DEFAULT_CD);

// role -> { endTime: ms epoch | null, total: seconds }
const state = {};
// role -> { btn, time, progress } DOM refs
const els = {};

function clampCd(v) {
  if (!Number.isFinite(v)) return DEFAULT_CD;
  return Math.min(600, Math.max(1, Math.round(v)));
}

function fmt(ms) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}`;
}

function buildRows() {
  const rows = document.getElementById('rows');
  ROLES.forEach((role) => {
    state[role] = { endTime: null, total: flashCd };

    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <span class="role">${role}</span>
      <button class="flash ready" aria-label="Flash ${role}">
        <svg class="ring" viewBox="0 0 ${RING_SIZE} ${RING_SIZE}">
          <circle class="track" cx="${RING_CENTER}" cy="${RING_CENTER}" r="${RING_R}"></circle>
          <circle class="progress" cx="${RING_CENTER}" cy="${RING_CENTER}" r="${RING_R}"
            stroke-dasharray="${RING_C.toFixed(2)}" stroke-dashoffset="${RING_C.toFixed(2)}"></circle>
        </svg>
        ${BOLT_IMG}
        <span class="time"></span>
      </button>`;

    const btn = row.querySelector('.flash');
    els[role] = {
      btn,
      time: row.querySelector('.time'),
      progress: row.querySelector('.progress')
    };

    // Left-click: start (or restart) the cooldown.
    btn.addEventListener('click', () => startCd(role));
    // Right-click: reset to ready.
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      resetCd(role);
    });

    rows.appendChild(row);
  });
}

function startCd(role) {
  const s = state[role];
  s.total = flashCd;
  s.endTime = Date.now() + flashCd * 1000;
  const { btn } = els[role];
  btn.classList.remove('ready', 'warn');
  btn.classList.add('cooldown');
  render(role);
}

function resetCd(role) {
  const s = state[role];
  s.endTime = null;
  const { btn, time, progress } = els[role];
  btn.classList.remove('cooldown', 'warn');
  btn.classList.add('ready');
  time.textContent = '';
  progress.style.strokeDashoffset = RING_C.toFixed(2);
}

function render(role) {
  const s = state[role];
  if (!s.endTime) return;
  const remaining = s.endTime - Date.now();

  if (remaining <= 0) {
    resetCd(role);
    return;
  }

  const { btn, time, progress } = els[role];
  const frac = remaining / (s.total * 1000); // 1 -> 0
  progress.style.strokeDashoffset = (RING_C * (1 - frac)).toFixed(2);
  time.textContent = fmt(remaining);
  btn.classList.toggle('warn', remaining <= WARN_AT * 1000);
}

// Single timer loop drives every active countdown.
function tick() {
  ROLES.forEach((role) => {
    if (state[role].endTime) render(role);
  });
}
setInterval(tick, 250);

// ---- Settings drawer ----
function wireSettings() {
  const gear = document.getElementById('gear');
  const settings = document.getElementById('settings');
  const cdInput = document.getElementById('cdInput');
  const presets = document.querySelectorAll('.preset');

  cdInput.value = flashCd;
  markActivePreset(presets, flashCd);

  gear.addEventListener('click', () => settings.classList.toggle('hidden'));

  cdInput.addEventListener('change', () => {
    flashCd = clampCd(Number(cdInput.value));
    cdInput.value = flashCd;
    localStorage.setItem('flashCd', String(flashCd));
    markActivePreset(presets, flashCd);
  });

  presets.forEach((p) => {
    p.addEventListener('click', () => {
      flashCd = clampCd(Number(p.dataset.cd));
      cdInput.value = flashCd;
      localStorage.setItem('flashCd', String(flashCd));
      markActivePreset(presets, flashCd);
    });
  });
}

function markActivePreset(presets, cd) {
  presets.forEach((p) => p.classList.toggle('active', Number(p.dataset.cd) === cd));
}

// ---- Window controls ----
function wireWindowControls() {
  document.getElementById('close').addEventListener('click', () => {
    window.overlay.close();
  });
}

// ---- Auto-fit the window to exactly the content size ----
let lastW = 0;
let lastH = 0;
function autoFit() {
  const panel = document.getElementById('panel');
  const m = 4; // panel margin (per side) from styles.css
  const w = panel.offsetWidth + m * 2;
  const h = panel.offsetHeight + m * 2;
  if (Math.abs(w - lastW) <= 1 && Math.abs(h - lastH) <= 1) return;
  lastW = w;
  lastH = h;
  window.overlay.resize(w, h);
}

// ---- Boot ----
buildRows();
wireSettings();
wireWindowControls();

new ResizeObserver(autoFit).observe(document.getElementById('panel'));
autoFit();
