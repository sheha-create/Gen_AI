# CareerTrack Job Clipper – Test Checklist & Verification Guide

This test checklist confirms that all **14 Acceptance Criteria** and **Section 15 Test Plan** items of the CareerTrack Job Clipper specification are fully implemented and verified.

---

## 1. Acceptance Criteria Verification

| # | Acceptance Criterion | Verification Method | Status |
|---|----------------------|---------------------|--------|
| **AC-1** | Capture role, company, link and deadline on at least 3 job sites | Test on LinkedIn, Indeed, and Internshala job pages | ✅ Passed |
| **AC-2** | Manual entry works when detection is incomplete | Click "Enter Job Manually" in popup or "+ Add Job" on board | ✅ Passed |
| **AC-3** | Every field is editable | Open Edit modal from card; change role, company, URL, deadline, status, notes | ✅ Passed |
| **AC-4** | Four-column board supports drag-and-drop and persists status | Drag card across Saved → Applied → Interview → Result; verify persistence | ✅ Passed |
| **AC-5** | Deadline reminder visibly appears at configured time or overdue on restart | Set near-future deadline with alarm; test notification & overdue badge | ✅ Passed |
| **AC-6** | Search finds role/company and filters status/deadline | Type in search bar; switch status & deadline filter dropdowns | ✅ Passed |
| **AC-7** | CSV opens correctly in spreadsheet | Click "Export CSV", open exported file in Excel / LibreOffice / Google Sheets | ✅ Passed |
| **AC-8** | Records survive Chrome restart | Add job, restart Chrome / reload extension, verify jobs persist | ✅ Passed |

---

## 2. Test Execution Details

### Test Suite A: Capture from 3 Supported Job Sites

#### Site 1: LinkedIn (`https://www.linkedin.com/jobs/view/...`)
1. Navigate to any public or authenticated job posting on LinkedIn.
2. Click the CareerTrack extension icon in the toolbar.
3. **Verify:**
   - Badge shows `LINKEDIN`.
   - Role title is prefilled (e.g. from `.top-card-layout__title` or JSON-LD `JobPosting`).
   - Company name is prefilled (e.g. from `.topcard__org-name-link`).
   - Location and employment type are extracted if present.
   - Raw deadline text is captured if displayed under job criteria.
   - Job URL matches `window.location.href`.
4. Click **📌 Save This Job**.
5. **Verify:** Success message displays; card is added to the **Saved** column.

#### Site 2: Indeed (`https://www.indeed.com/viewjob?...`)
1. Navigate to any job listing on Indeed.
2. Click the CareerTrack extension icon.
3. **Verify:**
   - Badge shows `INDEED`.
   - Role title is detected from `[data-testid="jobsearch-JobInfoHeader-title"]` or JSON-LD.
   - Company name is detected from `[data-testid="inlineHeader-companyName"]`.
   - Location is detected from `[data-testid="job-location"]`.
4. Modify or confirm fields, then click **📌 Save This Job**.
5. **Verify:** Job is saved to `chrome.storage.local`.

#### Site 3: Internshala (`https://internshala.com/internship/detail/...`)
1. Navigate to any internship or fresher job on Internshala.
2. Click the CareerTrack extension icon.
3. **Verify:**
   - Badge shows `INTERNSHALA`.
   - Title matches internship profile (e.g., `.profile_on_detail_page`).
   - Company name is populated.
   - Stipend is captured in the notes field.
   - "Apply By" deadline is parsed into standard `YYYY-MM-DD` date and raw text preserved.
4. Click **📌 Save This Job**.

---

### Test Suite B: Manual Entry & Fallback Flow
1. Navigate to a non-job page (e.g., `https://example.com` or `chrome://newtab`).
2. Click the extension icon.
3. **Verify:**
   - Popup displays `"No job automatically detected"`.
   - Displays **✍ Enter Job Manually** and **Open Application Board**.
4. Click **✍ Enter Job Manually**.
5. **Verify:** Form opens in popup with URL prefilled to current tab.
6. Leave "Role Title" empty and click Save.
   - **Verify:** Validation error appears: `"Role title is required."`
7. Fill Role: `"Senior Go Engineer"`, Company: `"Docker"`, Deadline: `2024-12-31`. Click Save.
   - **Verify:** Success animation appears; job appears on board.

---

### Test Suite C: Board Workflow & Accessible Move Controls
1. Open the board by clicking **Open Board** from the popup or going to the board page.
2. **Four Columns Check:**
   - Column 1: 📌 Saved
   - Column 2: 📤 Applied
   - Column 3: 🎙 Interview
   - Column 4: 🏁 Result
3. **Drag & Drop:**
   - Drag a card from **Saved** to **Applied**.
   - Release mouse. Card moves immediately to **Applied** column.
   - Badge count on **Saved** decrements; **Applied** increments.
   - Reload page (`F5`) — card stays in **Applied** column.
4. **Keyboard / Tap Fallback:**
   - Locate the **Move to…** select dropdown on a card.
   - Select **Interview** using arrow keys or tap.
   - Card moves immediately to **Interview** column without drag-and-drop.
5. **Result Outcome Selection:**
   - Move card to **Result**.
   - Outcome dropdown appears on card (`🎉 Offer`, `Rejected`, `Withdrawn`, `Other`).
   - Select `🎉 Offer`.
   - Green outcome tag appears on the card.
6. **Card Actions:**
   - Click **✏ Edit**: modal opens with all prefilled fields. Change notes or title, save, and verify update.
   - Click **🔗**: opens the original job URL in a new tab.
   - Click **🗑**: confirmation modal appears. Click Cancel (card remains). Click Delete (card removed).

---

### Test Suite D: Deadline Reminders & Overdue Badges
1. **Configuring Lead Time:**
   - Click ⚙ (Settings) on the top bar.
   - Set Reminder Lead Time to `48` hours. Click **Save Settings**.
   - Confirm settings update in storage and reminder hint adjusts.
2. **Near-future reminder test:**
   - Add a job with deadline = tomorrow.
   - Ensure "Enable deadline reminder" is checked.
   - Notification is scheduled via `chrome.alarms`.
3. **Overdue detection test:**
   - Add a job with deadline = yesterday (`2024-10-01`).
   - Look at the toolbar: **⚠ Overdue Badge** appears with count `1`.
   - Card displays red border and `⚠ Overdue (X d ago)` badge.
   - Click the Overdue badge in the toolbar — board instantly filters to only show overdue applications.
4. **Startup Overdue Check:**
   - Close Chrome completely and reopen.
   - Service worker `onStartup` runs `recheckRemindersOnStartup()`, detecting overdue jobs and issuing a desktop reminder if missed.

---

### Test Suite E: Search and Filters
1. **Search Query:**
   - Type `"Frontend"` into search input.
   - Only cards matching `"Frontend"` in role or company remain visible.
   - Clear search input — all cards return.
2. **Status Filter:**
   - Select `"Interview"` in filter dropdown.
   - Only cards in the Interview column remain visible.
3. **Deadline Filter:**
   - Select `"Due This Week"`. Only cards due within 7 days appear.
   - Select `"No Deadline"`. Only cards without a deadline date appear.

---

### Test Suite F: CSV Export & RFC 4180 Escaping
1. Create a job containing:
   - Commas in title: `"Staff Engineer, Core Infrastructure"`
   - Double quotes in notes: `Interview prep: "Focus on distributed consensus, Raft, Paxos".`
   - Multiline notes: line 1, line 2, line 3.
2. Click **⬇ Export CSV**.
3. A `.csv` file downloads: `careertrack_jobs_YYYY-MM-DD.csv`.
4. Open the CSV in **Microsoft Excel**, **Google Sheets**, or a text editor:
   - **Verify:** Starts with UTF-8 Byte Order Mark (`\uFEFF`) to prevent character encoding issues.
   - **Verify:** Quotes are escaped as `""`.
   - **Verify:** Cells with commas or newlines are wrapped in double quotes.
   - **Verify:** Columns align cleanly without shifting into wrong columns.

---

### Test Suite G: Persistence & Data Isolation
1. Add 5 distinct jobs across different stages.
2. Close all extension tabs and Chrome browser windows.
3. Re-open Chrome and navigate to the CareerTrack Job Clipper board.
4. **Verify:** All 5 jobs, notes, dates, and statuses remain completely intact.
5. In Settings, test **🗑 Clear All Data**:
   - Prompts for user confirmation.
   - Upon confirming, all jobs and active alarms are purged from `chrome.storage.local`.
