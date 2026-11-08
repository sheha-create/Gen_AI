// popup.js — Popup script
'use strict';

let state = null;
let countdownTimer = null;

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  bindEvents();
  startCountdownTimer();
});

// ── Load State ────────────────────────────────────────────────────────────────
async function loadState() {
  state = await sendMessage({ type: 'get-state' });
  if (!state) return;
  renderAll();
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderAll() {
  renderSession();
  renderUsage();
  renderSwitches();
}

function renderSession() {
  if (!state) return;
  const session = state.focusSession;
  const activeEl = document.getElementById('session-active');
  const inactiveEl = document.getElementById('session-inactive');

  if (isSessionActive(session)) {
    activeEl.style.display = 'block';
    inactiveEl.style.display = 'none';
    document.getElementById('session-reason').textContent = session.reason || '—';
    updateCountdown(session);
  } else {
    activeEl.style.display = 'none';
    inactiveEl.style.display = 'flex';
  }
}

function isSessionActive(session) {
  if (!session) return false;
  if (session.endedAt) return false;
  if (!session.expiresAt) return false;
  return Date.now() < session.expiresAt;
}

function updateCountdown(session) {
  const el = document.getElementById('session-countdown');
  if (!el || !session) return;
  const remaining = Math.max(0, session.expiresAt - Date.now());
  el.textContent = formatDuration(Math.floor(remaining / 1000));
  if (remaining <= 0) {
    el.textContent = '0:00';
  }
}

function renderUsage() {
  if (!state) return;
  const el = document.getElementById('usage-time');
  if (el) el.textContent = formatDuration(state.usageToday || 0);
}

function renderSwitches() {
  if (!state || !state.settings) return;
  const s = state.settings;
  document.getElementById('sw-shorts').checked = !!s.hideShorts;
  document.getElementById('sw-recs').checked = !!s.hideRecommendations;
  document.getElementById('sw-comments').checked = !!s.hideComments;
  document.getElementById('sw-gate').checked = !!s.gateEnabled;
}

// ── Events ────────────────────────────────────────────────────────────────────
function bindEvents() {
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('end-session-btn').addEventListener('click', async () => {
    await sendMessage({ type: 'end-session' });
    state.focusSession = null;
    renderSession();
    clearInterval(countdownTimer);
  });

  document.getElementById('start-session-mini-btn').addEventListener('click', () => {
    // Open dashboard to start session with reason
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('open-study-list').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('open-notes-btn').addEventListener('click', async () => {
    // Send message to current YouTube tab to open notes panel
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'toggle-notes' }).catch(() => {});
    } else {
      chrome.runtime.openOptionsPage();
    }
  });

  // Switch toggles
  ['sw-shorts', 'sw-recs', 'sw-comments', 'sw-gate'].forEach(id => {
    document.getElementById(id).addEventListener('change', onSwitchChange);
  });
}

async function onSwitchChange() {
  if (!state || !state.settings) return;
  const settings = {
    ...state.settings,
    hideShorts: document.getElementById('sw-shorts').checked,
    hideRecommendations: document.getElementById('sw-recs').checked,
    hideComments: document.getElementById('sw-comments').checked,
    gateEnabled: document.getElementById('sw-gate').checked
  };
  state.settings = settings;
  await sendMessage({ type: 'save-settings', settings });
}

// ── Countdown Timer ───────────────────────────────────────────────────────────
function startCountdownTimer() {
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (!state) return;
    const session = state.focusSession;
    if (isSessionActive(session)) {
      updateCountdown(session);
    } else if (session && !session.endedAt && session.expiresAt && Date.now() >= session.expiresAt) {
      // Session just expired
      state.focusSession = { ...session, endedAt: Date.now() };
      renderSession();
    }
    // Refresh usage every 10s
    if (Date.now() % 10000 < 1000) {
      sendMessage({ type: 'get-usage-today' }).then(u => {
        if (u && state) {
          state.usageToday = u.seconds;
          renderUsage();
        }
      });
    }
  }, 1000);
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function sendMessage(msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (resp) => {
      if (chrome.runtime.lastError) resolve(null);
      else resolve(resp);
    });
  });
}
