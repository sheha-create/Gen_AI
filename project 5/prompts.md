# prompts.md — Build Order & Development Prompts

This file documents the prompts used to build **StudyTube Focus Board** in milestone order, as required by the PRD.

---

## Milestone 1 — Manifest V3 Skeleton & Install Guide

```
Create a Chrome Extension using Manifest V3 called "StudyTube Focus Board".
- manifest.json with: name, version, description, icons, action (popup), background service worker, content_scripts for youtube.com, options_ui (dashboard), permissions: storage, alarms, tabs, host_permissions: youtube.com only.
- Placeholder popup.html, background.js, content.js, dashboard.html.
- icons/ folder with 16x16, 48x48, 128x128 PNG placeholders.
- README.md with step-by-step installation (chrome://extensions → Developer mode → Load unpacked).
```

---

## Milestone 2 — Popup/Settings & Persistent Hide Switches

```
Build the popup UI (popup.html, popup.css, popup.js) for StudyTube:
- Display session status (active/inactive), reason, countdown timer.
- Today's YouTube usage time.
- Four toggle switches: Hide Shorts, Hide Recommendations, Hide Comments, Focus Gate.
- Footer links to Dashboard and Notes.
- Persist all settings via chrome.storage.local.
- On toggle change: save settings and notify all youtube.com tabs via chrome.tabs.query + sendMessage.
Style: dark theme (#0f0f0f background), red accent (#ff4e45), Segoe UI font.
```

---

## Milestone 3 — Hide Shorts, Recommendations & Comments

```
In content.js, implement CSS-based hiding for YouTube distractions:
- Inject a <style> element per rule (shorts, recommendations, comments) — add/remove based on settings.
- Shorts selectors: ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts], a[href^="/shorts"], guide entries, Shorts player page elements.
- Recommendation selectors: ytd-rich-grid-renderer items on home, #secondary #related on watch page, end-screen elements.
- Comment selectors: #comments, ytd-comments.
- Never hide: search bar, player controls, navigation header.
- Load settings via chrome.runtime.sendMessage({type:'get-state'}) on init.
- Listen for 'settings-changed' messages to reapply immediately.
```

---

## Milestone 4 — SPA Navigation & Mutation Handling

```
In content.js, add robust SPA navigation support for YouTube:
- Poll location.href every 500ms; on change call onNavigate().
- MutationObserver on document.body (childList + subtree) with 400ms debounce to reapply CSS hiding after DOM mutations.
- Guard against double injection (window.__studyTubeInjected flag).
- On video navigation: update currentVideoId, re-inject note panel if on watch page.
- Prevent duplicate observers and style elements.
- Debounce applyAll() calls after navigation with 600ms delay.
```

---

## Milestone 5 — Study List & Timestamp Notes

```
Implement the Study List and Notes system:

Background (background.js):
- saveVideo(video): store {id, videoId, canonicalUrl, title, channel, addedAt} in chrome.storage.local studyList array; skip duplicates by videoId.
- removeVideo(videoId): filter from list.
- saveNote(note): store {id, videoId, timestampSeconds, text, createdAt, updatedAt} in notes array.
- removeNote(noteId): filter from notes array.
- getNotes(videoId): return notes filtered by videoId.

Content Script (content.js):
- Inject a floating 📝 toggle button (fixed, bottom-right).
- Note panel: shows "+ Add Note" button, timestamp display, textarea, Save/Cancel.
- On "+ Add Note": capture video.currentTime from document.querySelector('video').
- On Save: sendMessage({type:'save-note', note}).
- Render saved notes sorted by timestamp; click timestamp seeks video.
- "📌 Save to Study List" button captures title from document.title and channel from DOM.

Dashboard (dashboard.html + dashboard.js):
- Study List tab: render saved videos with Open link and Remove button; search filter.
- Notes tab: group by video, show timestamp and text, Open link (youtube.com/watch?v=X&t=Y), Delete button.
```

---

## Milestone 6 — Active-Time Tracking

```
Implement YouTube active-time tracking:

Content Script (content.js):
- Listen to document visibilitychange and window focus/blur events.
- Track time only when both visible (document.visibilityState === 'visible') AND focused (hasFocus()).
- Every 10 seconds (setInterval), compute elapsed seconds since lastTickTime and send {type:'usage-delta', seconds} to background.
- Sanity check: skip if elapsed > 60s (handles sleep/resume).
- On navigation between videos, flush accumulated time before resetting.

Background (background.js):
- addUsageDelta(seconds): read dailyUsage[localDate] from storage, add seconds, write back.
- localDateString(): returns YYYY-MM-DD in local calendar time for midnight-rollover correctness.
- getUsageToday(): return {seconds, date} for today's key.
- chrome.alarms tick every 15s to prune dailyUsage entries older than 30 days.

Popup / Dashboard:
- Display usageToday formatted as H:MM:SS or M:SS.
- Refresh every second in popup, every 30s in dashboard.
```

---

## Milestone 7 — 60-Minute Focus Gate

```
Implement the "Why are you here?" focus gate:

Background (background.js):
- startSession(reason): store {id, reason, startedAt, expiresAt: now+3600000, endedAt:null}.
- Set chrome.alarms.create('gate-expiry', {delayInMinutes:60}).
- endSession(): set endedAt, clear alarm.
- On alarm fire: set session.endedAt, notify all YouTube tabs with {type:'gate-expired'}.

Content Script (content.js):
- maybeShowGate(): show gate if gateEnabled AND session not active.
- isSessionActive(): check focusSession exists, endedAt is null, expiresAt > Date.now().
- Gate overlay: fixed full-screen, dark backdrop, card with reason textarea, "▶ Start 60-minute session" button, "Not now" button.
- On "Start": sendMessage({type:'start-session', reason}), remove overlay.
- On "Not now": remove overlay without starting session.
- On 'gate-expired' message: re-show gate if on watch page and gateEnabled.
- Session persists across SPA navigation — same tab retains gate state.
- Allow early session end via popup/dashboard button.
```

---

## Milestone 8 — Privacy, Restart, Clean-Profile & Regression Tests

```
Final hardening and testing:

1. Verify all data stored exclusively in chrome.storage.local — no fetch/XHR to external URLs.
2. Test Chrome restart: install extension, set toggles, add notes, close Chrome, reopen — confirm all data restored.
3. Test clean-profile install: use README instructions on a fresh Chrome profile.
4. Regression test SPA navigation: navigate through 5+ videos without page reload — confirm hiding rules reapply.
5. Test multiple tabs: open two YouTube tabs — confirm settings changes apply to both.
6. Test midnight rollover: usage stored under localDateString() YYYY-MM-DD key; new day starts fresh bucket.
7. Test storage failure: if chrome.storage is unavailable, extension degrades gracefully (no crash).
8. Test gate expiry: start session, mock or wait for expiry, confirm gate reappears.
9. All features have independent on/off controls; disabling one does not affect others.
10. README and prompts.md exist; TEST_CHECKLIST.md documents all test scenarios.
```
