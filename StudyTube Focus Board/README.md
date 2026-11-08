# StudyTube Focus Board — Chrome Extension

A **study-first YouTube Chrome Extension** that reduces distractions, tracks your usage, and keeps your study materials organized.

---

## Features

| Feature | Description |
|---|---|
| 🚫 Hide Shorts | Hides YouTube Shorts from home, search, and sidebar |
| 🚫 Hide Recommendations | Hides home feed cards and sidebar video suggestions |
| 💬 Hide Comments | Hides the comment section on video pages |
| 🔒 Focus Gate | "Why are you here?" overlay — enter a reason, unlock 60 minutes |
| 📋 Study List | Save and reopen lecture videos |
| 📝 Timestamp Notes | Add notes tied to exact video moments; click to jump there |
| ⏱ Usage Tracker | Counts active YouTube time (tab visible + focused only) |
| 💾 Persistent Storage | All data survives Chrome restart; nothing is ever sent to a server |

---

## Installation

1. **Download or clone** this repository to your computer.
2. Open **Google Chrome** and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **"Load unpacked"**.
5. Select the **folder** that contains this `README.md` (the project root).
6. The **StudyTube Focus Board** extension will appear in your Chrome toolbar.

> If you don't see the icon, click the puzzle-piece 🧩 icon in the toolbar and pin StudyTube.

---

## Permissions Explained

| Permission | Why it's needed |
|---|---|
| `storage` | Save settings, notes, study list and usage data locally |
| `alarms` | Schedule the 60-minute gate expiry check |
| `tabs` | Notify YouTube tabs when settings change |
| `*://www.youtube.com/*` | Inject content script on YouTube only |

No other sites are accessed. No data is transmitted anywhere.

---

## How to Use

### Focus Gate
- When enabled, visiting any YouTube watch page shows the "Why are you here?" overlay.
- Type your study reason and click **▶ Start 60-minute session**.
- The session persists across page navigations for 60 minutes.
- When the session expires, the gate reappears.
- Click **End Session** in the popup or dashboard to close the session early.

### Distraction Controls
- Open the popup by clicking the 📚 icon.
- Toggle **Hide Shorts**, **Hide Recommendations**, and **Hide Comments** independently.
- Changes take effect instantly on all open YouTube tabs.

### Study List
- On a YouTube watch page, click the floating **📝** button (bottom-right).
- Click **📌 Save to Study List** in the note panel.
- View and reopen saved videos from the **Dashboard → Study List** tab.

### Timestamp Notes
- While a video is playing, click the **📝** button (bottom-right of the page).
- Click **+ Add Note** — the current video timestamp is captured automatically.
- Type your note and click **Save**.
- Click the timestamp (e.g., `🕐 3:42`) in the saved note to jump to that moment.
- All notes for all videos are viewable in **Dashboard → Notes**.

### Dashboard
- Click **⚙ Dashboard** in the popup, or right-click the extension icon → Options.
- Tabs: **Overview** (session + usage), **Study List**, **Notes**, **Settings**.

---

## Development

### Project Structure
```
week_2 project 5/
├── manifest.json          # Manifest V3 config
├── popup.html / .css / .js  # Extension popup
├── dashboard.html / .css / .js  # Options/Dashboard page
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── background.js      # Service worker (storage, alarms, sessions)
│   └── content.js         # YouTube page controls, gate, notes, usage
├── README.md
├── prompts.md
└── TEST_CHECKLIST.md
```

### Architecture (Manifest V3)
- **Service Worker** (`src/background.js`): Manages chrome.storage, chrome.alarms, session lifecycle, usage aggregation, and cross-tab messaging.
- **Content Script** (`src/content.js`): Injected into every `youtube.com` page. Handles CSS hiding via `<style>` tags, gate overlay, note panel, usage ticks, SPA navigation detection (URL polling + MutationObserver), and chrome.runtime message passing.
- **Popup** (`popup.html`): Quick controls — session status, countdown, distraction toggles, quick links.
- **Dashboard** (`dashboard.html`): Full study board — session management, usage display, study list, notes viewer, settings.

### SPA Navigation
YouTube is a single-page application. The content script polls `location.href` every 500ms and runs a debounced `MutationObserver` to reapply hiding rules after DOM updates — without full page reloads.

---

## Privacy

- **All data stays in Chrome's local storage** (`chrome.storage.local`).
- No analytics, no server calls, no account required.
- Usage time is counted only when the YouTube tab is **visible and focused**.
- You can clear all data at any time via **Dashboard → Settings → Clear All Data**.
