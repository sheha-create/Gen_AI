// dashboard.js — Dashboard/Options page
'use strict';

let state = null;
let countdownTimer = null;
let currentTab = 'overview';

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  bindTabNav();
  bindOverview();
  bindSettings();
  bindStudyList();
  bindNotes();
  startCountdownTimer();
});

// ── State ─────────────────────────────────────────────────────────────────────
async function loadState() {
  state = await sendMessage({ type: 'get-state' });
  if (!state) return;
  renderAll();
}

function renderAll() {
  renderOverview();
  renderStudyList();
  renderNotes();
  renderSettings();
}

// ── Tab Navigation ────────────────────────────────────────────────────────────
function bindTabNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
  // Check URL hash for direct tab links
  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById('tab-' + hash)) {
    switchTab(hash);
  }
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
  const btn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function bindOverview() {
  document.getElementById('start-session-dash-btn').addEventListener('click', async () => {
    const reason = document.getElementById('session-reason-input').value.trim();
    const errEl = document.getElementById('session-start-err');
    if (!reason) {
      errEl.style.display = 'block';
      document.getElementById('session-reason-input').focus();
      return;
    }
    errEl.style.display = 'none';
    await sendMessage({ type: 'start-session', reason });
    state = await sendMessage({ type: 'get-state' });
    renderOverview();
  });

  document.getElementById('end-session-dash-btn').addEventListener('click', async () => {
    await sendMessage({ type: 'end-session' });
    state = await sendMessage({ type: 'get-state' });
    renderOverview();
  });
}

function renderOverview() {
  if (!state) return;
  const session = state.focusSession;
  const activeEl = document.getElementById('session-dash-active');
  const inactiveEl = document.getElementById('session-dash-inactive');

  if (isSessionActive(session)) {
    activeEl.style.display = 'flex';
    inactiveEl.style.display = 'none';
    document.getElementById('session-dash-reason').textContent = session.reason || '—';
    updateCountdown(session);
  } else {
    activeEl.style.display = 'none';
    inactiveEl.style.display = 'block';
  }

  // Usage
  document.getElementById('dash-usage-time').textContent = formatDuration(state.usageToday || 0);

  // Stats
  document.getElementById('stat-videos').textContent = (state.studyList || []).length;
  document.getElementById('stat-notes').textContent = (state.notes || []).length;
}

// ── Study List Tab ────────────────────────────────────────────────────────────
function bindStudyList() {
  document.getElementById('studylist-search').addEventListener('input', () => {
    renderStudyList();
  });
}

function renderStudyList(filter) {
  if (!state) return;
  const container = document.getElementById('studylist-container');
  const query = (filter || document.getElementById('studylist-search').value || '').toLowerCase().trim();
  let list = state.studyList || [];
  if (query) {
    list = list.filter(v => v.title.toLowerCase().includes(query) || v.channel.toLowerCase().includes(query));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">${query ? 'No results' : 'No videos saved yet'}</div>
        <div class="empty-hint">${query ? 'Try a different search.' : 'On a YouTube watch page, click "📌 Save to Study List" in the notes panel.'}</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(video => `
    <div class="study-item" data-id="${video.videoId}">
      <div class="study-item-info">
        <div class="study-item-title" title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</div>
        <div class="study-item-channel">${escapeHtml(video.channel || '')}</div>
        <div class="study-item-date">Saved ${formatRelativeDate(video.addedAt)}</div>
      </div>
      <div class="study-item-actions">
        <a class="study-open-btn" href="${escapeHtml(video.canonicalUrl)}" target="_blank">▶ Open</a>
        <button class="study-remove-btn" data-videoid="${video.videoId}">Remove</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.study-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const videoId = btn.dataset.videoid;
      await sendMessage({ type: 'remove-video', videoId });
      state.studyList = (state.studyList || []).filter(v => v.videoId !== videoId);
      document.getElementById('stat-videos').textContent = state.studyList.length;
      renderStudyList();
    });
  });
}

// ── Notes Tab ─────────────────────────────────────────────────────────────────
function bindNotes() {
  document.getElementById('notes-search').addEventListener('input', () => {
    renderNotes();
  });
}

function renderNotes(filter) {
  if (!state) return;
  const container = document.getElementById('notes-container');
  const query = (filter || document.getElementById('notes-search').value || '').toLowerCase().trim();
  let notes = state.notes || [];
  const studyList = state.studyList || [];

  if (query) {
    notes = notes.filter(n => n.text.toLowerCase().includes(query));
  }

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-title">${query ? 'No results' : 'No notes yet'}</div>
        <div class="empty-hint">${query ? 'Try a different search.' : 'While watching a video, click the 📝 button to add timestamped notes.'}</div>
      </div>
    `;
    return;
  }

  // Group by video
  const byVideo = {};
  notes.forEach(note => {
    if (!byVideo[note.videoId]) byVideo[note.videoId] = [];
    byVideo[note.videoId].push(note);
  });

  // Build lookup for video titles
  const videoTitles = {};
  studyList.forEach(v => { videoTitles[v.videoId] = v.title; });

  let html = '';
  for (const videoId of Object.keys(byVideo)) {
    const videoNotes = byVideo[videoId].sort((a, b) => a.timestampSeconds - b.timestampSeconds);
    const title = videoTitles[videoId] || `Video ${videoId}`;
    html += `<div class="note-group-title">${escapeHtml(title)}</div>`;
    html += videoNotes.map(note => `
      <div class="note-dash-item" data-noteid="${note.id}">
        <div class="note-dash-ts">${formatTime(note.timestampSeconds)}</div>
        <div class="note-dash-body">
          <div class="note-dash-text">${escapeHtml(note.text)}</div>
        </div>
        <div class="note-dash-actions">
          <a class="note-dash-open-btn" href="https://www.youtube.com/watch?v=${videoId}&t=${note.timestampSeconds}" target="_blank">▶ Open</a>
          <button class="note-dash-del-btn" data-noteid="${note.id}" title="Delete note">✕</button>
        </div>
      </div>
    `).join('');
  }
  container.innerHTML = html;

  container.querySelectorAll('.note-dash-del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const noteId = btn.dataset.noteid;
      await sendMessage({ type: 'remove-note', noteId });
      state.notes = (state.notes || []).filter(n => n.id !== noteId);
      document.getElementById('stat-notes').textContent = state.notes.length;
      renderNotes();
    });
  });
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function bindSettings() {
  ['set-shorts', 'set-recs', 'set-comments', 'set-gate'].forEach(id => {
    document.getElementById(id).addEventListener('change', onSettingChange);
  });

  document.getElementById('clear-data-btn').addEventListener('click', () => {
    document.getElementById('clear-confirm').style.display = 'block';
  });
  document.getElementById('clear-confirm-no').addEventListener('click', () => {
    document.getElementById('clear-confirm').style.display = 'none';
  });
  document.getElementById('clear-confirm-yes').addEventListener('click', async () => {
    await chrome.storage.local.clear();
    document.getElementById('clear-confirm').style.display = 'none';
    // Reload page
    location.reload();
  });
}

function renderSettings() {
  if (!state || !state.settings) return;
  const s = state.settings;
  document.getElementById('set-shorts').checked = !!s.hideShorts;
  document.getElementById('set-recs').checked = !!s.hideRecommendations;
  document.getElementById('set-comments').checked = !!s.hideComments;
  document.getElementById('set-gate').checked = !!s.gateEnabled;
}

async function onSettingChange() {
  if (!state || !state.settings) return;
  const settings = {
    ...state.settings,
    hideShorts: document.getElementById('set-shorts').checked,
    hideRecommendations: document.getElementById('set-recs').checked,
    hideComments: document.getElementById('set-comments').checked,
    gateEnabled: document.getElementById('set-gate').checked
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
    }
    // Refresh usage every 30s
    sendMessage({ type: 'get-usage-today' }).then(u => {
      if (u && state) {
        state.usageToday = u.seconds;
        const el = document.getElementById('dash-usage-time');
        if (el) el.textContent = formatDuration(state.usageToday);
      }
    });
  }, 1000);
}

function updateCountdown(session) {
  const el = document.getElementById('session-dash-countdown');
  if (!el || !session) return;
  const remaining = Math.max(0, session.expiresAt - Date.now());
  el.textContent = formatDuration(Math.floor(remaining / 1000));
  if (remaining <= 0 && currentTab === 'overview') {
    state.focusSession = { ...session, endedAt: Date.now() };
    renderOverview();
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function isSessionActive(session) {
  if (!session) return false;
  if (session.endedAt) return false;
  if (!session.expiresAt) return false;
  return Date.now() < session.expiresAt;
}

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function formatRelativeDate(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendMessage(msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (resp) => {
      if (chrome.runtime.lastError) resolve(null);
      else resolve(resp);
    });
  });
}
