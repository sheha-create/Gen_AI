# CareerTrack Job Clipper – Prompts & Implementation History

This document records the structured, chronological AI pair-programming prompts used to design, implement, and verify the **CareerTrack Job Clipper** Chrome Extension in accordance with Project 10 milestones.

---

## Milestone 1: Manifest V3 Skeleton & Project Architecture

**Prompt:**
> "Design a Manifest V3 Chrome Extension architecture for 'CareerTrack Job Clipper'.
> Set up `manifest.json` with `manifest_version: 3`, minimal necessary permissions (`storage`, `alarms`, `notifications`), and host permissions scoped strictly to the three target job portals (`https://*.linkedin.com/*`, `https://*.indeed.com/*`, `https://internshala.com/*`, `https://*.internshala.com/*`).
> Configure a background service worker (`background.js`), default popup action (`popup.html`), content script (`content.js`) with `document_idle` execution, and declare icons and web accessible resources.
> Ensure no unnecessary broad permissions (`<all_urls>`, cookies, or webRequest) are requested."

**Outcome:**
- Created `manifest.json` with clean MV3 declarations.
- Defined service worker and content script mapping.
- Structured directory layout with `icons/`, popup, and board components.

---

## Milestone 2: Data Model, Storage Layer & Editable Job Form

**Prompt:**
> "Define the `JobRecord` data schema and local storage management layer in `background.js` and `board.html`.
> Support fields: `id`, `roleTitle`, `companyName`, `jobUrl`, `deadlineDate`, `deadlineRawText`, `location`, `employmentType`, `sourceSite`, `capturedAt`, `status` (`SAVED`, `APPLIED`, `INTERVIEW`, `RESULT`), `resultOutcome` (`OFFER`, `REJECTED`, `WITHDRAWN`, `OTHER`), `dateApplied`, `notes`, `reminderEnabled`, `reminderAt`, `createdAt`, `updatedAt`.
> Provide robust schema validation so that required fields (role, company) are enforced and invalid payloads are rejected.
> Build an accessible modal form with input validation, clear error messages, and dynamic display of the Result Outcome selector when status is set to `RESULT`."

**Outcome:**
- Implemented `validateJob()` and storage handlers (`getJobs`, `saveJobs`, `SAVE_JOB`, `UPDATE_JOB`, `DELETE_JOB`).
- Built modal dialog supporting all record attributes with validation.

---

## Milestone 3: Four-Column Kanban Board & Accessible Movement Controls

**Prompt:**
> "Implement a four-column Kanban board (`Saved`, `Applied`, `Interview`, `Result`) in `board.html`, `board.js`, and `board.css`.
> Use the HTML5 Drag and Drop API (`dragstart`, `dragover`, `dragleave`, `drop`) to allow moving job cards between stages, persisting the status changes immediately to `chrome.storage.local`.
> In strict accordance with accessibility guidelines and Chrome MV3 CSP (no inline `onclick` or `ondrop` handlers):
> 1. Attach all listeners cleanly via JavaScript.
> 2. Implement an accessible fallback: a 'Move to…' dropdown select on each card that allows keyboard navigation and screen readers to move cards across columns without mouse drag-and-drop.
> 3. Automatically record `dateApplied` when a card transitions to `APPLIED` if not already set."

**Outcome:**
- Created responsive 4-column layout styled with `#16324F` and `#147D92` color palette.
- Added drag-and-drop with column hover highlights and smooth transitions.
- Added keyboard-accessible `<select>` dropdown for instant column transfers.

---

## Milestone 4: Search, Filtering & Overdue Visual Indicators

**Prompt:**
> "Add a fast, real-time client-side search and multi-criteria filtering system to the application board:
> 1. Real-time search by role title, company name, or location.
> 2. Filter dropdown by application status (`SAVED`, `APPLIED`, `INTERVIEW`, `RESULT`).
> 3. Filter dropdown by deadline urgency (`Overdue`, `Due Today`, `Due This Week`, `Due This Month`, `No Deadline`).
> 4. An Overdue badge in the toolbar indicating the number of active jobs past their deadline date. Clicking this badge should filter the board to only show overdue applications."

**Outcome:**
- Implemented `getFilteredJobs()` with zero external dependencies.
- Added interactive overdue counter badge in the toolbar.
- Added visual overdue cues on cards (`overdue-card` left red border, overdue tags).

---

## Milestone 5: Content Extraction Adapter 1 – LinkedIn

**Prompt:**
> "Implement content extraction in `content.js` for LinkedIn job postings (`https://*.linkedin.com/*`).
> First attempt extracting structured data from `script[type='application/ld+json']` containing `JobPosting` schema.
> If structured metadata is absent or partial, fall back to conservative DOM selectors:
> - Role: `.top-card-layout__title`, `.job-details-jobs-unified-top-card__job-title`, `h1.t-24`
> - Company: `.topcard__org-name-link`, `.topcard__org-name`, `a[data-tracking-control-name='public_jobs_topcard-org-name']`
> - Location: `.topcard__flavor--bullet`, primary description container
> - Deadline/Criteria: `.description__job-criteria-item` subheaders matching `/expir|deadline|apply by/i`
> Ensure `window.location.href` is preserved as `jobUrl` and no global variables are shadowed."

**Outcome:**
- Added robust JSON-LD extractor plus LinkedIn selector fallback.
- Added date normalizer converting diverse date strings into standard ISO `YYYY-MM-DD`.

---

## Milestone 6: Content Extraction Adapters 2 & 3 – Indeed & Internshala with Manual Fallback

**Prompt:**
> "Expand `content.js` and `popup.js` with site-specific extraction adapters for Indeed and Internshala:
> 1. Indeed:
>    - Role: `[data-testid='jobsearch-JobInfoHeader-title']`, `h1.jobsearch-JobInfoHeader-title`
>    - Company: `[data-testid='inlineHeader-companyName']`
>    - Location: `[data-testid='job-location']`
>    - Employment Type: `[data-testid='jobType']`
> 2. Internshala:
>    - Role: `.profile_on_detail_page`, `.internship_title`
>    - Company: `.company_name`
>    - Location: `#location_names a`, `.location_link`
>    - Deadline: `.internship_other_details_container` labeled 'Apply by' (handles formats like '28 Nov\' 24')
>    - Stipend: captured into notes
> 3. Manual Fallback:
>    If detection is incomplete or the user is on an unsupported page, show a friendly fallback in the popup with an 'Enter Job Manually' button that pre-fills the current tab URL and allows one-click manual saving without leaving the popup."

**Outcome:**
- Added complete Indeed and Internshala extractors.
- Added graceful manual entry view in `popup.html` and `popup.js`.

---

## Milestone 7: Deadline Alarms, Chrome Notifications & Startup Overdue Handling

**Prompt:**
> "Implement deadline reminder handling in `background.js` using `chrome.alarms` and `chrome.notifications`:
> 1. Compute `reminderAt` using a configurable lead time (default 24 hours) relative to `23:59:00` on the deadline date.
> 2. Register alarms with `chrome.alarms.create(job.id, { when: reminderTime })`.
> 3. When the alarm triggers, verify `notificationEnabled` and fire `chrome.notifications.create` showing job title, company name, and days remaining.
> 4. Clicking the notification should open `board.html`.
> 5. Implement `onStartup` and `onInstalled` handlers that inspect stored records. If Chrome was closed when a deadline or reminder passed, issue an overdue reminder and flag the job as overdue."

**Outcome:**
- Full alarm scheduling and cancellation lifecycle on save, edit, move, and delete.
- Notification click handler opening the Kanban board.
- Startup routine detecting missed reminders.

---

## Milestone 8: RFC 4180 CSV Export, Local Storage Privacy & Polish

**Prompt:**
> "Implement CSV export and local data management in `background.js` and `board.js`:
> 1. RFC 4180 compliant CSV generator: wrap values containing commas, double quotes (`"`), or newlines (`\n`, `\r`) in quotes, and escape internal quotes by doubling them (`""`).
> 2. Prepend the UTF-8 Byte Order Mark (`\uFEFF`) so Microsoft Excel and Google Sheets correctly interpret characters and accents.
> 3. Provide a 'Clear All Data' button in Settings with explicit confirmation.
> 4. Ensure 100% offline and local privacy: zero network requests, zero third-party analytics, and pure local persistence in `chrome.storage.local`.
> 5. Create icons, documentation (`README.md`, `test-checklist.md`, `sample.csv`), and verify installation in Chrome developer mode."

**Outcome:**
- Robust CSV export generator with UTF-8 BOM.
- Full offline guarantee and data clearance controls.
- Comprehensive documentation and testing guide.
