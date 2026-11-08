// background.js — Service Worker (Manifest V3)
// Handles: lifecycle, storage, alarms, active-time tracking, gate expiry

const ALARM_TICK = 'usage-tick';
const ALARM_GATE = 'gate-expiry';
const TICK_INTERVAL_SECONDS = 15; // track in 15s intervals

// ── Schema defaults ──────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  hideShorts: true,
  hideRecommendations: true,
  hideComments: false,
  gateEnabled: true,
  schemaVersion: 1
};

// ── Initialization ───────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['settings']);
  if (!data.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  } else {
    // Migrate schema if needed
    const merged = { ...DEFAULT_SETTINGS, ...data.settings };
    await chrome.storage.local.set({ settings: merged });
  }
  startTickAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  startTickAlarm();
});

// ── Alarms ───────────────────────────────────────────────────────────────────
function startTickAlarm() {
  chrome.alarms.get(ALARM_TICK, (existing) => {
    if (!existing) {
      chrome.alarms.create(ALARM_TICK, {
        periodInMinutes: TICK_INTERVAL_SECONDS / 60
      });
    }
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_TICK) {
    await handleUsageTick();
  } else if (alarm.name === ALARM_GATE) {
    await handleGateExpiry();
  }
});

// ── Usage Tick ───────────────────────────────────────────────────────────────
// Called by the service worker alarm, but actual tracking is content-script driven.
// The content script sends 'usage-ping' messages; this just handles the alarm housekeeping.
async function handleUsageTick() {
  // Housekeeping: clean up old daily usage entries (keep 30 days)
  const data = await chrome.storage.local.get(['dailyUsage']);
  const usage = data.dailyUsage || {};
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = localDateString(cutoff);
  for (const date of Object.keys(usage)) {
    if (date < cutoffStr) delete usage[date];
  }
  await chrome.storage.local.set({ dailyUsage: usage });
}

// ── Gate Expiry ───────────────────────────────────────────────────────────────
async function handleGateExpiry() {
  const data = await chrome.storage.local.get(['focusSession']);
  const session = data.focusSession;
  if (session && !session.endedAt) {
    const now = Date.now();
    if (session.expiresAt && now >= session.expiresAt) {
      // Mark session as expired
      session.endedAt = now;
      await chrome.storage.local.set({ focusSession: session });
      // Notify all YouTube tabs
      notifyYouTubeTabs({ type: 'gate-expired' });
    }
  }
  chrome.alarms.clear(ALARM_GATE);
}

// ── Message Handling ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // keep channel open for async
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'get-state':
        sendResponse(await getFullState());
        break;

      case 'save-settings':
        await chrome.storage.local.set({ settings: message.settings });
        notifyYouTubeTabs({ type: 'settings-changed', settings: message.settings });
        sendResponse({ ok: true });
        break;

      case 'start-session':
        await startSession(message.reason);
        const state = await getFullState();
        notifyYouTubeTabs({ type: 'session-started', session: state.focusSession });
        sendResponse({ ok: true, state });
        break;

      case 'end-session':
        await endSession();
        notifyYouTubeTabs({ type: 'session-ended' });
        sendResponse({ ok: true });
        break;

      case 'usage-delta':
        // Content script sends elapsed seconds
        await addUsageDelta(message.seconds);
        sendResponse({ ok: true });
        break;

      case 'save-video':
        await saveVideo(message.video);
        sendResponse({ ok: true });
        break;

      case 'remove-video':
        await removeVideo(message.videoId);
        sendResponse({ ok: true });
        break;

      case 'save-note':
        await saveNote(message.note);
        sendResponse({ ok: true });
        break;

      case 'remove-note':
        await removeNote(message.noteId);
        sendResponse({ ok: true });
        break;

      case 'get-notes':
        sendResponse(await getNotes(message.videoId));
        break;

      case 'get-study-list':
        sendResponse(await getStudyList());
        break;

      case 'get-usage-today':
        sendResponse(await getUsageToday());
        break;

      case 'open-dashboard':
        chrome.runtime.openOptionsPage();
        sendResponse({ ok: true });
        break;

      default:
        sendResponse({ error: 'unknown message type' });
    }
  } catch (err) {
    console.error('[StudyTube BG] Error:', err);
    sendResponse({ error: err.message });
  }
}

// ── Session Management ────────────────────────────────────────────────────────
async function startSession(reason) {
  const now = Date.now();
  const expiresAt = now + 60 * 60 * 1000; // 60 minutes
  const session = {
    id: now.toString(),
    reason: reason || '',
    startedAt: now,
    expiresAt,
    endedAt: null
  };
  await chrome.storage.local.set({ focusSession: session });

  // Set alarm for expiry
  const minutesUntilExpiry = 60;
  chrome.alarms.create(ALARM_GATE, { delayInMinutes: minutesUntilExpiry });
}

async function endSession() {
  const data = await chrome.storage.local.get(['focusSession']);
  if (data.focusSession) {
    data.focusSession.endedAt = Date.now();
    await chrome.storage.local.set({ focusSession: data.focusSession });
  }
  chrome.alarms.clear(ALARM_GATE);
}

// ── Usage Tracking ────────────────────────────────────────────────────────────
function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function addUsageDelta(seconds) {
  if (!seconds || seconds <= 0) return;
  const today = localDateString();
  const data = await chrome.storage.local.get(['dailyUsage']);
  const usage = data.dailyUsage || {};
  usage[today] = (usage[today] || 0) + seconds;
  await chrome.storage.local.set({ dailyUsage: usage });
}

async function getUsageToday() {
  const today = localDateString();
  const data = await chrome.storage.local.get(['dailyUsage']);
  const usage = data.dailyUsage || {};
  return { seconds: usage[today] || 0, date: today };
}

// ── Study List ────────────────────────────────────────────────────────────────
async function saveVideo(video) {
  const data = await chrome.storage.local.get(['studyList']);
  const list = data.studyList || [];
  // avoid duplicates by videoId
  const idx = list.findIndex(v => v.videoId === video.videoId);
  if (idx === -1) {
    list.unshift({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      videoId: video.videoId,
      canonicalUrl: video.canonicalUrl,
      title: video.title || 'Untitled',
      channel: video.channel || '',
      addedAt: Date.now()
    });
  }
  await chrome.storage.local.set({ studyList: list });
}

async function removeVideo(videoId) {
  const data = await chrome.storage.local.get(['studyList']);
  const list = (data.studyList || []).filter(v => v.videoId !== videoId);
  await chrome.storage.local.set({ studyList: list });
}

async function getStudyList() {
  const data = await chrome.storage.local.get(['studyList']);
  return data.studyList || [];
}

// ── Notes ─────────────────────────────────────────────────────────────────────
async function saveNote(note) {
  const data = await chrome.storage.local.get(['notes']);
  const notes = data.notes || [];
  const idx = notes.findIndex(n => n.id === note.id);
  if (idx === -1) {
    notes.unshift({
      id: note.id || (Date.now().toString() + Math.random().toString(36).slice(2)),
      videoId: note.videoId,
      timestampSeconds: note.timestampSeconds,
      text: note.text,
      createdAt: note.createdAt || Date.now(),
      updatedAt: Date.now()
    });
  } else {
    notes[idx] = { ...notes[idx], ...note, updatedAt: Date.now() };
  }
  await chrome.storage.local.set({ notes });
}

async function removeNote(noteId) {
  const data = await chrome.storage.local.get(['notes']);
  const notes = (data.notes || []).filter(n => n.id !== noteId);
  await chrome.storage.local.set({ notes });
}

async function getNotes(videoId) {
  const data = await chrome.storage.local.get(['notes']);
  const notes = data.notes || [];
  if (videoId) {
    return notes.filter(n => n.videoId === videoId);
  }
  return notes;
}

// ── Full State ────────────────────────────────────────────────────────────────
async function getFullState() {
  const data = await chrome.storage.local.get([
    'settings', 'focusSession', 'studyList', 'notes', 'dailyUsage'
  ]);
  const today = localDateString();
  return {
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
    focusSession: data.focusSession || null,
    studyList: data.studyList || [],
    notes: data.notes || [],
    usageToday: (data.dailyUsage || {})[today] || 0
  };
}

// ── Utilities ─────────────────────────────────────────────────────────────────
async function notifyYouTubeTabs(message) {
  try {
    const tabs = await chrome.tabs.query({ url: '*://www.youtube.com/*' });
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {});
    }
  } catch (e) {}
}
