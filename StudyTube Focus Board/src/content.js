// content.js — Content Script for youtube.com
// Handles: distraction hiding, gate overlay, note panel, usage tracking, SPA navigation

(function () {
  'use strict';

  // ── Guard against double injection ─────────────────────────────────────────
  if (window.__studyTubeInjected) return;
  window.__studyTubeInjected = true;

  // ── State ───────────────────────────────────────────────────────────────────
  let settings = null;
  let focusSession = null;
  let currentVideoId = null;
  let gateOverlay = null;
  let notePanel = null;
  let notesPanelOpen = false;
  let currentNotes = [];

  // Usage tracking
  let usageInterval = null;
  let lastTickTime = null;
  let isTracking = false;

  // SPA navigation
  let mutationObserver = null;
  let urlObserverInterval = null;
  let lastUrl = location.href;
  let applyDebounceTimer = null;

  // ── Init ────────────────────────────────────────────────────────────────────
  async function init() {
    const state = await sendMessage({ type: 'get-state' });
    if (!state) return;
    settings = state.settings;
    focusSession = state.focusSession;
    currentVideoId = getVideoId();

    startUsageTracking();
    startSPAWatcher();
    applyAll();

    if (isWatchPage()) {
      maybeShowGate();
      injectNotePanel();
    }

    // Listen for messages from background
    chrome.runtime.onMessage.addListener(onBackgroundMessage);
  }

  // ── SPA Navigation ──────────────────────────────────────────────────────────
  function startSPAWatcher() {
    // Poll URL changes (YouTube uses pushState/replaceState)
    urlObserverInterval = setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        onNavigate();
      }
    }, 500);

    // MutationObserver for DOM changes after navigation
    mutationObserver = new MutationObserver(debounce(onDOMMutation, 400));
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function onNavigate() {
    const newVideoId = getVideoId();
    if (newVideoId !== currentVideoId) {
      currentVideoId = newVideoId;
      if (notePanel) {
        notePanel.remove();
        notePanel = null;
        notesPanelOpen = false;
      }
    }
    clearTimeout(applyDebounceTimer);
    applyDebounceTimer = setTimeout(() => {
      applyAll();
      if (isWatchPage()) {
        maybeShowGate();
        injectNotePanel();
        loadNotesForCurrentVideo();
      } else {
        // remove note panel if not on watch page
        if (notePanel) {
          notePanel.remove();
          notePanel = null;
        }
      }
    }, 600);
  }

  function onDOMMutation() {
    // Re-apply hiding rules after DOM changes
    applyHiding();
    // Ensure note panel is still attached
    if (isWatchPage() && notePanel && !document.body.contains(notePanel)) {
      document.body.appendChild(notePanel);
    }
  }

  // ── URL Helpers ─────────────────────────────────────────────────────────────
  function getVideoId() {
    const params = new URLSearchParams(location.search);
    return params.get('v') || null;
  }

  function isWatchPage() {
    return location.pathname === '/watch' && !!getVideoId();
  }

  function isShortsPage() {
    return location.pathname.startsWith('/shorts');
  }

  // ── Apply All Controls ───────────────────────────────────────────────────────
  function applyAll() {
    if (!settings) return;
    applyHiding();
  }

  function applyHiding() {
    if (!settings) return;
    setStyleRule('hide-shorts', settings.hideShorts, getShortsSelectors());
    setStyleRule('hide-recommendations', settings.hideRecommendations, getRecommendationSelectors());
    setStyleRule('hide-comments', settings.hideComments, getCommentSelectors());
  }

  // ── CSS Injection ───────────────────────────────────────────────────────────
  const injectedStyles = {};

  function setStyleRule(id, active, selectors) {
    const styleId = `studytube-${id}`;
    let el = document.getElementById(styleId);
    if (active) {
      if (!el) {
        el = document.createElement('style');
        el.id = styleId;
        document.head.appendChild(el);
      }
      el.textContent = `${selectors.join(',\n')} { display: none !important; visibility: hidden !important; }`;
    } else {
      if (el) el.remove();
    }
  }

  function getShortsSelectors() {
    return [
      // Shorts shelf on home / search
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-shelf-renderer',
      'ytd-shorts',
      '[is-shorts]',
      // Shorts in sidebar
      'a[href^="/shorts"]',
      'ytd-mini-guide-entry-renderer a[href="/shorts"]',
      'ytd-guide-entry-renderer a[href="/shorts"]',
      // Shorts player page
      'ytd-shorts-player-renderer',
      'ytm-shorts-lockup-view-model-v2',
      'ytd-reel-video-renderer',
      // Shorts chips / filter
      'yt-chip-cloud-chip-renderer[chip-style="STYLE_HOME_FILTER"][aria-label*="Short"]',
    ];
  }

  function getRecommendationSelectors() {
    return [
      // Home feed cards
      'ytd-rich-grid-renderer ytd-rich-item-renderer',
      'ytd-browse[page-subtype="home"] ytd-rich-grid-media',
      // Sidebar recommendations on watch page
      '#secondary #related',
      'ytd-watch-next-secondary-results-renderer',
      // Autoplay / up-next
      '.ytp-autonav-endscreen-upnext-container',
      // End screen cards
      '.ytp-ce-element',
      // End screen overlay
      '.videowall-endscreen',
      // Trending / explore sidebar
      'ytd-browse[page-subtype="trending"]',
    ];
  }

  function getCommentSelectors() {
    return [
      '#comments',
      'ytd-comments',
      'ytd-comment-thread-renderer',
    ];
  }

  // ── Gate Overlay ─────────────────────────────────────────────────────────────
  function maybeShowGate() {
    if (!settings || !settings.gateEnabled) {
      removeGate();
      return;
    }
    if (isSessionActive()) {
      removeGate();
      return;
    }
    showGate();
  }

  function isSessionActive() {
    if (!focusSession) return false;
    if (focusSession.endedAt) return false;
    if (!focusSession.expiresAt) return false;
    return Date.now() < focusSession.expiresAt;
  }

  function getSessionTimeLeft() {
    if (!isSessionActive()) return 0;
    return Math.max(0, focusSession.expiresAt - Date.now());
  }

  function showGate() {
    if (gateOverlay && document.body.contains(gateOverlay)) return;
    removeGate();

    gateOverlay = document.createElement('div');
    gateOverlay.id = 'studytube-gate';
    gateOverlay.innerHTML = `
      <div class="st-gate-card">
        <div class="st-gate-logo">📚 StudyTube</div>
        <h2 class="st-gate-title">Why are you here?</h2>
        <p class="st-gate-subtitle">Tell yourself what you're studying today before accessing YouTube.</p>
        <textarea class="st-gate-reason" placeholder="e.g. Watch lecture on photosynthesis..." maxlength="200" rows="3"></textarea>
        <div class="st-gate-error" id="st-gate-err" style="display:none">Please enter a reason to continue.</div>
        <div class="st-gate-actions">
          <button class="st-btn st-btn-primary" id="st-gate-start">▶ Start 60-minute session</button>
          <button class="st-btn st-btn-ghost" id="st-gate-skip">Not now</button>
        </div>
      </div>
    `;

    // Inject gate styles
    injectGateStyles();
    document.body.appendChild(gateOverlay);

    const reasonEl = gateOverlay.querySelector('.st-gate-reason');
    const errEl = gateOverlay.querySelector('#st-gate-err');

    gateOverlay.querySelector('#st-gate-start').addEventListener('click', async () => {
      const reason = reasonEl.value.trim();
      if (!reason) {
        errEl.style.display = 'block';
        reasonEl.focus();
        return;
      }
      errEl.style.display = 'none';
      await sendMessage({ type: 'start-session', reason });
      const state = await sendMessage({ type: 'get-state' });
      focusSession = state.focusSession;
      removeGate();
    });

    gateOverlay.querySelector('#st-gate-skip').addEventListener('click', () => {
      removeGate();
    });

    // Focus the textarea
    setTimeout(() => reasonEl.focus(), 100);
  }

  function removeGate() {
    if (gateOverlay) {
      gateOverlay.remove();
      gateOverlay = null;
    }
  }

  function injectGateStyles() {
    if (document.getElementById('studytube-gate-styles')) return;
    const style = document.createElement('style');
    style.id = 'studytube-gate-styles';
    style.textContent = `
      #studytube-gate {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'YouTube Noto', Roboto, Arial, sans-serif;
        backdrop-filter: blur(4px);
      }
      .st-gate-card {
        background: #0f0f0f;
        border: 1px solid #272727;
        border-radius: 16px;
        padding: 36px 40px;
        max-width: 460px;
        width: 90vw;
        color: #fff;
        box-shadow: 0 24px 60px rgba(0,0,0,0.6);
      }
      .st-gate-logo {
        font-size: 20px;
        font-weight: 700;
        color: #ff4e45;
        margin-bottom: 20px;
        letter-spacing: -0.3px;
      }
      .st-gate-title {
        font-size: 26px;
        font-weight: 700;
        margin: 0 0 8px;
        color: #fff;
      }
      .st-gate-subtitle {
        color: #aaa;
        font-size: 14px;
        margin: 0 0 20px;
        line-height: 1.5;
      }
      .st-gate-reason {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        padding: 12px;
        resize: none;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s;
        font-family: inherit;
      }
      .st-gate-reason:focus { border-color: #ff4e45; }
      .st-gate-error {
        color: #ff6b6b;
        font-size: 13px;
        margin-top: 6px;
      }
      .st-gate-actions {
        margin-top: 20px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .st-btn {
        padding: 10px 20px;
        border-radius: 20px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
      }
      .st-btn-primary {
        background: #ff4e45;
        color: #fff;
        flex: 1;
      }
      .st-btn-primary:hover { background: #e03d35; }
      .st-btn-ghost {
        background: transparent;
        color: #aaa;
        border: 1px solid #333;
      }
      .st-btn-ghost:hover { border-color: #aaa; color: #fff; }
    `;
    document.head.appendChild(style);
  }

  // ── Note Panel ───────────────────────────────────────────────────────────────
  async function injectNotePanel() {
    if (notePanel && document.body.contains(notePanel)) return;
    if (notePanel) notePanel.remove();

    injectNotePanelStyles();

    // Create the toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'st-notes-toggle';
    toggleBtn.title = 'StudyTube Notes';
    toggleBtn.innerHTML = '📝';
    toggleBtn.addEventListener('click', () => toggleNotePanel());

    // Create the panel
    notePanel = document.createElement('div');
    notePanel.id = 'st-note-panel';
    notePanel.style.display = 'none';
    notePanel.innerHTML = `
      <div class="st-note-header">
        <span class="st-note-title">📝 Notes</span>
        <div class="st-note-header-actions">
          <button class="st-note-save-btn" id="st-save-note-btn" title="Save note at current time">+ Add Note</button>
          <button class="st-note-close-btn" id="st-panel-close">✕</button>
        </div>
      </div>
      <div class="st-note-input-area" id="st-note-input-area">
        <div class="st-note-ts-row">
          <span class="st-note-ts-label">At: </span>
          <span class="st-note-ts-val" id="st-note-ts">0:00</span>
        </div>
        <textarea class="st-note-textarea" id="st-note-text" placeholder="Type your note..." rows="3" maxlength="500"></textarea>
        <div class="st-note-input-actions">
          <button class="st-btn st-btn-primary st-note-submit" id="st-note-submit">Save</button>
          <button class="st-btn st-btn-ghost st-note-cancel" id="st-note-cancel">Cancel</button>
        </div>
      </div>
      <div class="st-notes-list" id="st-notes-list">
        <div class="st-notes-empty">No notes yet. Click "+ Add Note" to capture a moment.</div>
      </div>
      <div class="st-note-footer">
        <button class="st-note-save-video-btn" id="st-save-video-btn">📌 Save to Study List</button>
      </div>
    `;

    document.body.appendChild(toggleBtn);
    document.body.appendChild(notePanel);

    // Wire events
    notePanel.querySelector('#st-panel-close').addEventListener('click', () => closeNotePanel());
    notePanel.querySelector('#st-save-note-btn').addEventListener('click', () => openAddNote());
    notePanel.querySelector('#st-note-submit').addEventListener('click', () => submitNote());
    notePanel.querySelector('#st-note-cancel').addEventListener('click', () => closeAddNote());
    notePanel.querySelector('#st-save-video-btn').addEventListener('click', () => saveCurrentVideo());

    // Hide input by default
    notePanel.querySelector('#st-note-input-area').style.display = 'none';

    await loadNotesForCurrentVideo();
  }

  async function loadNotesForCurrentVideo() {
    const videoId = getVideoId();
    if (!videoId) return;
    const notes = await sendMessage({ type: 'get-notes', videoId });
    currentNotes = notes || [];
    renderNotesList();
  }

  function toggleNotePanel() {
    notesPanelOpen = !notesPanelOpen;
    if (notePanel) {
      notePanel.style.display = notesPanelOpen ? 'flex' : 'none';
      if (notesPanelOpen) loadNotesForCurrentVideo();
    }
  }

  function closeNotePanel() {
    notesPanelOpen = false;
    if (notePanel) notePanel.style.display = 'none';
  }

  function openAddNote() {
    const inputArea = notePanel.querySelector('#st-note-input-area');
    inputArea.style.display = 'block';
    // Update timestamp
    const video = document.querySelector('video');
    const ts = video ? Math.floor(video.currentTime) : 0;
    notePanel.querySelector('#st-note-ts').textContent = formatTime(ts);
    notePanel.querySelector('#st-note-text').value = '';
    notePanel.querySelector('#st-note-text').focus();
  }

  function closeAddNote() {
    const inputArea = notePanel.querySelector('#st-note-input-area');
    inputArea.style.display = 'none';
  }

  async function submitNote() {
    const text = notePanel.querySelector('#st-note-text').value.trim();
    if (!text) return;
    const video = document.querySelector('video');
    const ts = video ? Math.floor(video.currentTime) : 0;
    const videoId = getVideoId();
    if (!videoId) return;

    const note = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      videoId,
      timestampSeconds: ts,
      text,
      createdAt: Date.now()
    };

    await sendMessage({ type: 'save-note', note });
    currentNotes.unshift(note);
    renderNotesList();
    closeAddNote();
  }

  function renderNotesList() {
    const listEl = notePanel.querySelector('#st-notes-list');
    if (!listEl) return;

    if (currentNotes.length === 0) {
      listEl.innerHTML = '<div class="st-notes-empty">No notes yet. Click "+ Add Note" to capture a moment.</div>';
      return;
    }

    const sorted = [...currentNotes].sort((a, b) => a.timestampSeconds - b.timestampSeconds);
    listEl.innerHTML = sorted.map(note => `
      <div class="st-note-item" data-id="${note.id}" data-ts="${note.timestampSeconds}">
        <div class="st-note-item-top">
          <button class="st-note-ts-btn" data-ts="${note.timestampSeconds}" title="Jump to ${formatTime(note.timestampSeconds)}">
            🕐 ${formatTime(note.timestampSeconds)}
          </button>
          <button class="st-note-del-btn" data-id="${note.id}" title="Delete note">✕</button>
        </div>
        <div class="st-note-item-text">${escapeHtml(note.text)}</div>
      </div>
    `).join('');

    // Wire click events
    listEl.querySelectorAll('.st-note-ts-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ts = parseInt(btn.dataset.ts, 10);
        seekToTimestamp(ts);
      });
    });

    listEl.querySelectorAll('.st-note-del-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await sendMessage({ type: 'remove-note', noteId: id });
        currentNotes = currentNotes.filter(n => n.id !== id);
        renderNotesList();
      });
    });
  }

  function seekToTimestamp(seconds) {
    const video = document.querySelector('video');
    if (!video) return;
    const clamped = Math.max(0, Math.min(seconds, video.duration || Infinity));
    video.currentTime = clamped;
    video.play().catch(() => {});
  }

  async function saveCurrentVideo() {
    const videoId = getVideoId();
    if (!videoId) return;
    const title = document.title.replace(' - YouTube', '').trim() || 'Untitled';
    const channelEl = document.querySelector('#channel-name a, ytd-video-owner-renderer #channel-name a, #owner #channel-name a');
    const channel = channelEl ? channelEl.textContent.trim() : '';
    await sendMessage({
      type: 'save-video',
      video: {
        videoId,
        canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        channel
      }
    });

    // Visual feedback
    const btn = notePanel.querySelector('#st-save-video-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✅ Saved!';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
    }
  }

  function injectNotePanelStyles() {
    if (document.getElementById('studytube-note-styles')) return;
    const style = document.createElement('style');
    style.id = 'studytube-note-styles';
    style.textContent = `
      #st-notes-toggle {
        position: fixed;
        bottom: 90px;
        right: 20px;
        z-index: 9000;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #0f0f0f;
        border: 2px solid #333;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s, border-color 0.15s;
      }
      #st-notes-toggle:hover { transform: scale(1.1); border-color: #ff4e45; }

      #st-note-panel {
        position: fixed;
        bottom: 90px;
        right: 76px;
        z-index: 9000;
        width: 320px;
        max-height: 500px;
        background: #0f0f0f;
        border: 1px solid #272727;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        font-family: 'YouTube Noto', Roboto, Arial, sans-serif;
        color: #fff;
        flex-direction: column;
        overflow: hidden;
      }
      .st-note-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-bottom: 1px solid #272727;
        background: #111;
      }
      .st-note-title { font-weight: 700; font-size: 14px; }
      .st-note-header-actions { display: flex; gap: 8px; align-items: center; }
      .st-note-save-btn {
        background: #ff4e45;
        color: #fff;
        border: none;
        border-radius: 14px;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .st-note-save-btn:hover { background: #e03d35; }
      .st-note-close-btn {
        background: transparent;
        border: none;
        color: #aaa;
        cursor: pointer;
        font-size: 14px;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .st-note-close-btn:hover { color: #fff; background: #333; }

      .st-note-input-area {
        padding: 12px 14px;
        border-bottom: 1px solid #272727;
        background: #111;
      }
      .st-note-ts-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12px; }
      .st-note-ts-label { color: #aaa; }
      .st-note-ts-val {
        background: #333;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 12px;
        color: #ff4e45;
        font-family: monospace;
      }
      .st-note-textarea {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-size: 13px;
        padding: 8px 10px;
        resize: none;
        box-sizing: border-box;
        outline: none;
        font-family: inherit;
      }
      .st-note-textarea:focus { border-color: #ff4e45; }
      .st-note-input-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      .st-note-submit, .st-note-cancel {
        font-size: 12px;
        padding: 6px 14px;
      }

      .st-notes-list {
        overflow-y: auto;
        flex: 1;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 280px;
      }
      .st-notes-empty {
        color: #666;
        font-size: 13px;
        text-align: center;
        padding: 20px;
        line-height: 1.6;
      }
      .st-note-item {
        background: #1a1a1a;
        border: 1px solid #272727;
        border-radius: 8px;
        padding: 10px;
      }
      .st-note-item-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .st-note-ts-btn {
        background: transparent;
        border: none;
        color: #ff4e45;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 10px;
        font-family: monospace;
        transition: background 0.15s;
      }
      .st-note-ts-btn:hover { background: rgba(255,78,69,0.15); }
      .st-note-del-btn {
        background: transparent;
        border: none;
        color: #666;
        font-size: 12px;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .st-note-del-btn:hover { color: #ff4e45; background: rgba(255,78,69,0.1); }
      .st-note-item-text {
        font-size: 13px;
        color: #ccc;
        line-height: 1.5;
        word-break: break-word;
      }

      .st-note-footer {
        padding: 10px 14px;
        border-top: 1px solid #272727;
        background: #111;
      }
      .st-note-save-video-btn {
        width: 100%;
        background: transparent;
        border: 1px solid #333;
        color: #ccc;
        border-radius: 8px;
        padding: 8px;
        font-size: 13px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
      }
      .st-note-save-video-btn:hover { border-color: #ff4e45; color: #ff4e45; }
      .st-note-save-video-btn:disabled { opacity: 0.6; cursor: default; }
    `;
    document.head.appendChild(style);
  }

  // ── Usage Tracking ──────────────────────────────────────────────────────────
  function startUsageTracking() {
    // Track time only when YouTube tab is visible and focused
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onWindowFocus);
    window.addEventListener('blur', onWindowBlur);

    if (document.visibilityState === 'visible' && document.hasFocus()) {
      startTicking();
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      startTicking();
    } else {
      stopTicking();
    }
  }

  function onWindowFocus() {
    if (document.visibilityState === 'visible') startTicking();
  }

  function onWindowBlur() {
    stopTicking();
  }

  function startTicking() {
    if (isTracking) return;
    isTracking = true;
    lastTickTime = Date.now();
    usageInterval = setInterval(flushUsage, 10000); // flush every 10s
  }

  function stopTicking() {
    if (!isTracking) return;
    flushUsage();
    isTracking = false;
    clearInterval(usageInterval);
    usageInterval = null;
  }

  function flushUsage() {
    if (!isTracking || !lastTickTime) return;
    const now = Date.now();
    const elapsed = Math.round((now - lastTickTime) / 1000);
    lastTickTime = now;
    if (elapsed > 0 && elapsed < 60) { // sanity: ignore if > 60s (e.g., sleep)
      sendMessage({ type: 'usage-delta', seconds: elapsed }).catch(() => {});
    }
  }

  // ── Background Message Handler ──────────────────────────────────────────────
  function onBackgroundMessage(message) {
    if (!message || !message.type) return;
    switch (message.type) {
      case 'settings-changed':
        settings = message.settings;
        applyAll();
        break;
      case 'session-started':
        focusSession = message.session;
        removeGate();
        break;
      case 'session-ended':
        focusSession = null;
        if (isWatchPage() && settings && settings.gateEnabled) showGate();
        break;
      case 'gate-expired':
        focusSession = null;
        if (isWatchPage() && settings && settings.gateEnabled) showGate();
        break;
    }
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function sendMessage(msg) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (response) => {
          if (chrome.runtime.lastError) {
            resolve(null);
          } else {
            resolve(response);
          }
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  // ── Start ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
