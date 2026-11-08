# CareerTrack Job Clipper 📌

> **One-Click Job Saving & Application Tracking Chrome Extension**  
> *BSERC GenAI Internship | Week 2 | Project 10 | Section C: Chrome Extensions | Medium*

CareerTrack Job Clipper is a lightweight, privacy-first Manifest V3 Chrome Extension that captures job and internship opportunities with a single click from supported job sites and organises them on a local four-column Kanban application board.

---

## 🌟 Key Features

1. **One-Click Smart Capture**  
   Automatically detects and captures **Role Title**, **Company Name**, **Job URL**, **Deadline**, **Location**, and **Employment Type** using structured JSON-LD (`JobPosting`) metadata and site-specific fallback selectors.
2. **Three Documented Job Sites + Generic Fallback**  
   Built-in extractors for **LinkedIn**, **Indeed**, and **Internshala**, with seamless manual entry whenever auto-detection is partial or when browsing unsupported sites.
3. **Four-Column Kanban Board**  
   Organise applications into **📌 Saved**, **📤 Applied**, **🎙 Interview**, and **🏁 Result** stages.
4. **Drag-and-Drop & Accessible Controls**  
   Move cards effortlessly with mouse drag-and-drop or use the built-in keyboard/tap **"Move to…"** dropdown on each card for full accessibility.
5. **Result Stage Tracking**  
   Record final outcomes (**🎉 Offer**, **Rejected**, **Withdrawn**, **Other**) directly on result cards.
6. **Real Deadline Reminders**  
   Schedules browser notifications using `chrome.alarms` and `chrome.notifications` with configurable lead time (default: 24 hours). If Chrome is closed when a reminder is due, overdue notices appear upon the next startup.
7. **Fast Search & Multi-Filter**  
   Instant real-time search across role and company, plus filters for status and deadline urgency (Overdue, Due Today, Due This Week, Due This Month).
8. **RFC 4180 CSV Export**  
   Export all tracked applications to a standard CSV file with **UTF-8 BOM (`\uFEFF`)**, ensuring flawless opening in Microsoft Excel, Google Sheets, and LibreOffice Calc without character corruption or broken columns.
9. **100% Local & Private**  
   All records are stored strictly in `chrome.storage.local`. Zero external servers, zero background tracking, and no credential access.

---

## 📁 Repository Structure

```
├── manifest.json         # Chrome Extension Manifest V3 configuration
├── background.js        # Service worker: alarms, notifications, storage & CSV export
├── content.js           # Content script: JSON-LD + LinkedIn, Indeed, Internshala parsers
├── popup.html           # Extension action popup markup
├── popup.js             # Popup logic: detection preview, manual entry, save handler
├── popup.css            # Popup stylesheet
├── board.html           # Full application tracking Kanban board page
├── board.js             # Board controller: drag & drop, search, filters, modals
├── board.css            # Kanban board styling (Color palette: #16324F & #147D92)
├── icons/               # Extension icons (16x16, 48x48, 128x128 PNG)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── sample.csv           # Sample exported CSV with RFC 4180 escaping and UTF-8 BOM
├── test-checklist.md    # Acceptance criteria verification checklist & test plan
├── prompts.md           # Chronological prompts mapped to Milestones 1–8
└── README.md            # Comprehensive project documentation
```

---

## 🚀 Installation Guide

### Prerequisites
- Google Chrome (or any Chromium browser such as Brave, Edge, or Arc).

### Step-by-Step Setup
1. Clone or download this project folder to your local computer (e.g. `c:\Users\Home\week_2 project 6`).
2. Open Chrome and navigate to the extensions management page:
   ```text
   chrome://extensions/
   ```
3. Enable **Developer mode** using the toggle in the upper-right corner.
4. Click the **Load unpacked** button in the top-left toolbar.
5. Select the project directory (`c:\Users\Home\week_2 project 6`).
6. The **CareerTrack Job Clipper** card will appear in your extensions list.
7. Click the **Extensions puzzle icon** in Chrome's toolbar and pin **CareerTrack Job Clipper** for easy access.

---

## 🌐 Supported Job Sites & Testing URLs

The extension is configured with scoped host permissions for three major job portals:

| Portal | Target URL Pattern | Key Selector / Metadata Strategy |
|---|---|---|
| **LinkedIn** | `https://*.linkedin.com/jobs/*` | JSON-LD `JobPosting`, `.top-card-layout__title`, `.topcard__org-name-link`, criteria list |
| **Indeed** | `https://*.indeed.com/viewjob*` | JSON-LD, `[data-testid="jobsearch-JobInfoHeader-title"]`, `[data-testid="inlineHeader-companyName"]` |
| **Internshala** | `https://internshala.com/*` | JSON-LD, `.profile_on_detail_page`, `.company_name`, `.internship_other_details_container` ("Apply by") |

### How to Test Each Site:
1. Open any public job listing on LinkedIn, Indeed, or Internshala.
2. Click the **CareerTrack** extension icon in your browser toolbar.
3. The popup automatically identifies the portal, extracts the details, and displays an editable preview card:
   - Site badge (`LINKEDIN`, `INDEED`, `INTERNSHALA`).
   - Role Title & Company Name.
   - Location & Employment Type.
   - Deadline Date (prefilled if detectable, along with raw source text).
4. Edit any field directly in the popup if desired.
5. Click **📌 Save This Job**.
6. Click **Open Board** to view the newly saved card in the **Saved** column.

### Manual Entry Fallback:
If you are on an unsupported site or detection finds incomplete fields:
1. Click the extension icon.
2. If no job is detected, click **✍ Enter Job Manually**.
3. The popup opens with the current page URL pre-filled.
4. Enter the role and company name, pick a deadline, and click **📌 Save This Job**.
5. Alternatively, open the Board and click **+ Add Job** to create or edit records at any time.

---

## ⏰ How Deadline Reminders Work

1. **Scheduling**:
   - When a job with a deadline is saved and has `"Enable reminder"` checked, the extension calculates the reminder timestamp based on your configured lead time:
     $$\text{Reminder Time} = \text{Deadline Date at 23:59:00} - \text{Lead Time (hours)}$$
   - It registers a lightweight background alarm with `chrome.alarms.create(job.id, { when: reminderTime })`.
2. **Notification**:
   - When the alarm triggers, `background.js` creates a Chrome desktop notification with the role title, company name, and days remaining.
   - Clicking the notification immediately opens the **CareerTrack Board**.
3. **Overdue Handling on Startup**:
   - If Chrome is closed when a reminder is scheduled, the `chrome.runtime.onStartup` listener checks all stored jobs.
   - Any active job whose deadline passed while Chrome was closed triggers an overdue notice and updates the overdue counter badge on the board.
4. **Configurable Lead Time**:
   - Click the ⚙ (Settings) icon on the board to adjust lead time (default: `24` hours; range: 1 to 720 hours).

---

## 🔒 Privacy, Security & Data Boundaries

- **Zero Cloud Storage**: All records live in Chrome's sandboxed `chrome.storage.local`.
- **Zero External Telemetry**: No third-party analytics, tracking pixels, or remote APIs.
- **No Login / Credential Access**: The extension does not inspect passwords, authentication tokens, cookies, or private account pages.
- **Minimum Scoped Permissions**:
  - `storage`: saves jobs and settings locally.
  - `alarms`: schedules reminder wakeups.
  - `notifications`: displays local reminder alerts.
  - `host_permissions`: strictly limited to LinkedIn, Indeed, and Internshala domains.

---

## 📊 CSV Export & Spreadsheet Compatibility

Clicking **⬇ Export CSV** exports the entire database into a clean CSV file (`careertrack_jobs_YYYY-MM-DD.csv`):
- **UTF-8 Byte Order Mark (`\uFEFF`)**: Included at the very beginning of the file so that Microsoft Excel, Apple Numbers, and LibreOffice automatically detect UTF-8 encoding.
- **RFC 4180 Escaping**: Values containing commas, quotes, or line breaks are wrapped in double quotes, and internal quotes are escaped as `""`.
- **Exported Columns**:
  `ID`, `Role`, `Company`, `URL`, `Deadline Date`, `Deadline Raw Text`, `Location`, `Employment Type`, `Source Site`, `Status`, `Result Outcome`, `Date Applied`, `Notes`, `Captured At`, `Created At`.

---

## ♿ Accessibility Features

- Full keyboard support for drag-and-drop replacement: each job card includes an accessible **Move to…** select dropdown.
- High-contrast visual cues for urgency:
  - Overdue applications display a distinct red border and overdue badge.
  - Due today applications display an orange urgency tag.
- Keyboard shortcuts: pressing `Escape` closes any active modal dialog.

---

## 🛠 Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| Notification does not pop up | OS or Chrome notification permission disabled | Ensure Windows Focus Assist / Do Not Disturb allows Chrome notifications. Check `chrome://settings/content/notifications`. |
| Job title not detected on a listing | Markup changes or dynamic React rendering | Click **✍ Enter Job Manually** in the popup to enter details directly, or adjust the selector in `content.js`. |
| Card disappeared from board | An active search query or filter is hiding it | Clear the search input and set the Status and Deadline filters to "All". |
| Storage reset / fresh profile | Extension uninstalled | Export your records regularly using **⬇ Export CSV** for local backup. |

---

## 📜 License
Developed as part of the **BSERC GenAI Internship | Week 2 | Project 10**. All rights reserved.
