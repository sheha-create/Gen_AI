# TEST_CHECKLIST.md — StudyTube Focus Board

## Test Plan & Evidence

---

### 1. Page Coverage

| Scenario | Expected | Pass |
|---|---|---|
| Home page (youtube.com) | Distraction hiding applies on load | ☐ |
| Search page (/results) | Shorts shelf hidden when toggle ON | ☐ |
| Watch page (/watch?v=…) | Gate appears, note panel visible | ☐ |
| Shorts page (/shorts/…) | Shorts player hidden when toggle ON | ☐ |

---

### 2. Distraction Hiding — Independent Switches

| Scenario | Expected | Pass |
|---|---|---|
| Hide Shorts ON | Shorts shelf, guide entry, Shorts player hidden | ☐ |
| Hide Shorts OFF | Shorts visible | ☐ |
| Hide Recommendations ON | Home feed cards, sidebar suggestions hidden | ☐ |
| Hide Recommendations OFF | Recommendations visible | ☐ |
| Hide Comments ON | #comments section hidden on watch page | ☐ |
| Hide Comments OFF | Comments visible | ☐ |
| Toggle each independently | Toggling one does not affect the others | ☐ |
| Player controls visible | Search bar, player buttons, header never hidden | ☐ |

---

### 3. SPA Navigation (No Reload)

| Scenario | Expected | Pass |
|---|---|---|
| Navigate from home → watch | Hiding rules reapply, gate shows if needed | ☐ |
| Navigate watch → watch (different video) | Note panel resets for new video | ☐ |
| Navigate watch → Shorts | Shorts hiding applies | ☐ |
| 5 consecutive video navigations without reload | Controls work on all 5 | ☐ |
| No duplicate style tags | Only one <style> per rule injected | ☐ |

---

### 4. Study List

| Scenario | Expected | Pass |
|---|---|---|
| Save a video via note panel | Appears in Dashboard → Study List | ☐ |
| Save duplicate video | Only one entry (no duplicates) | ☐ |
| Remove video from study list | Removed from list immediately | ☐ |
| Open video from study list | Opens correct youtube.com/watch?v=… URL | ☐ |
| Search study list | Filters by title / channel | ☐ |
| Data survives Chrome restart | Study list intact after restart | ☐ |

---

### 5. Timestamp Notes

| Scenario | Expected | Pass |
|---|---|---|
| Add note while video playing | Captures current video timestamp | ☐ |
| Add note at timestamp 0 | Saves 0:00, seeks correctly | ☐ |
| Click timestamp in note | Video seeks to that exact second | ☐ |
| Add two notes at different times | Both displayed, sorted by time | ☐ |
| Notes persist across reload | Notes present after page reload | ☐ |
| Delete a note | Removed from panel and storage | ☐ |
| Notes grouped by video in dashboard | Notes visible in Dashboard → Notes | ☐ |
| Open note from dashboard | Opens video at correct timestamp (t= param) | ☐ |

---

### 6. Active-Time Tracking

| Scenario | Expected | Pass |
|---|---|---|
| Active tab, visible, focused | Usage time increments every ~10s | ☐ |
| Switch to another tab | Usage stops incrementing | ☐ |
| Minimize Chrome window | Usage stops incrementing | ☐ |
| Return to YouTube tab | Usage resumes | ☐ |
| Background YouTube tab | Usage not counted | ☐ |
| Compare with stopwatch (60s test) | Within ±15s of real elapsed time | ☐ |
| Data survives Chrome restart | Today's usage retained | ☐ |
| Midnight rollover | New day starts at 0:00 | ☐ |

---

### 7. Focus Gate (60-Minute Session)

| Scenario | Expected | Pass |
|---|---|---|
| Gate enabled, no session | Gate overlay shown on watch page | ☐ |
| Submit blank reason | Error message shown, session not started | ☐ |
| Enter reason + Start session | Gate dismissed, countdown starts | ☐ |
| Navigate to other video during session | Gate does NOT reappear | ☐ |
| End session early via popup | Gate reappears on next watch page visit | ☐ |
| Session expires (after 60 min) | Gate reappears | ☐ |
| Chrome restarted during active session | Session expires correctly on reopen | ☐ |
| "Not now" button | Gate dismissed without starting session | ☐ |
| Gate disabled in settings | Gate never shows | ☐ |
| Countdown in popup | Shows remaining time, counts down | ☐ |

---

### 8. Data Persistence (Chrome Restart)

| Scenario | Expected | Pass |
|---|---|---|
| Set all 4 toggles, restart Chrome | Settings preserved | ☐ |
| Add study list entry, restart | Entry preserved | ☐ |
| Add note, restart | Note preserved | ☐ |
| Usage time, restart | Today's seconds preserved | ☐ |

---

### 9. Multiple Tabs

| Scenario | Expected | Pass |
|---|---|---|
| Two YouTube tabs open | Settings change in popup applies to both | ☐ |
| Start session in one tab | Gate disappears in both tabs | ☐ |
| Usage tracked from active tab only | Background tab does not double-count | ☐ |

---

### 10. Edge Cases

| Scenario | Expected | Pass |
|---|---|---|
| Video with no title in DOM | Falls back to "Untitled" | ☐ |
| Ad playing | Hiding rules do not break ad playback | ☐ |
| Storage unavailable | Extension degrades gracefully, no JS errors | ☐ |
| Very long note text (500 chars) | Saved and displayed correctly | ☐ |
| Feature toggled mid-session | Takes effect immediately | ☐ |

---

### 11. Installation (Clean Profile)

| Scenario | Expected | Pass |
|---|---|---|
| Follow README on fresh Chrome profile | Extension loads without errors | ☐ |
| All features work without prior setup | No manual config required | ☐ |
| Permissions match README explanation | No extra permissions requested | ☐ |

---

## Evidence

_Fill in this section while testing:_

- **Date tested:**
- **Chrome version:**
- **OS:**
- **Tester:**

| Test Area | Notes |
|---|---|
| Distraction hiding | |
| SPA navigation | |
| Study list | |
| Timestamp notes | |
| Usage tracking | |
| Focus gate | |
| Data persistence | |
| Multiple tabs | |
| Clean install | |
