# CareerCraft Studio 🚀
> **Offline-capable professional resume builder with live A4 preview, structurally distinct templates, selectable text PDF export, and local data persistence.**

Designed and built for **BSERC GenAI Internship · Week 2 · Project 3 · Version 1.0**.

---

## ✨ Features Overview

### 1. Mandatory Functional Requirements
- **Structured Resume Form**: Full editor support for:
  - Personal Profile (Full name, role, email, phone, city/region, portfolio link, LinkedIn).
  - Professional Summary with word counter.
  - Work Experience (Roles, organizations, dates, currently working, responsibilities, measurable achievements).
  - Education History (Degree, major, university, dates, GPA, coursework).
  - Featured Projects (Technologies, architecture, key contributions, live/GitHub links).
  - Skills & Competencies (Categorized skills with optional proficiency levels and bulk importer).
  - Certifications (Name, issuer, date, credential ID, verification URL).
  - Honors & Achievements (Awards, competitions, dates, impact descriptions).
- **Live A4 Preview**:
  - Exact A4 aspect ratio (`210mm` x `297mm`).
  - Interactive zoom controls (Fit to width, Zoom In, Zoom Out, percentage indicator).
  - Instant live update as fields are modified.
- **Three Structurally Distinct Templates**:
  - **Classic**: Restrained single-column format, traditional hierarchy, formal horizontal dividers, ATS standard.
  - **Modern**: Two-column layout with a left sidebar (skills badge tags, education, credentials) and right main body (summary callout, timeline with bullet markers, impact boxes).
  - **Minimal**: Editorial Swiss style with wide section title columns, generous whitespace, and refined tracking.
- **Section Reordering & Organization**:
  - Drag-and-drop grab handles to reorder sections.
  - Keyboard-accessible move-up and move-down arrow controls (for full accessibility and mobile).
  - Section visibility toggle (hide/show any section without losing data).
- **Selectable-Text PDF Export**:
  - Native browser Print to PDF with custom print stylesheet (`@page { size: A4 portrait; margin: 0; }`).
  - True copyable, selectable text (zero canvas or screenshot rasterization).
  - Print isolation hides all editor UI and prints only pristine resume sheets.
- **Save & Load Resume Data**:
  - Export full resume data as a `.json` backup file.
  - Includes schema version (`"schemaVersion": "1.0.0"`), all fields, template choice, accent settings, and section order.
  - Import JSON with rigorous validation against malformed or unsupported versions.
  - Confirmation prompt before overwriting unsaved work.

### 2. Recommended Differentiating Enhancements
- **Resume Completeness Meter**: Live score percentage (0–100%) with an interactive checklist breakdown and actionable tips.
- **Local Job Description Keyword Matcher**:
  - Paste any target job description.
  - Transparent client-side keyword extraction comparing job terms against resume corpus.
  - Reports match percentage, matched keywords (with frequencies), and missing terms.
  - Explicit transparent disclaimer (never claiming proprietary ATS black-box algorithms).
- **Action-Verb & Phrasing Coach**:
  - Curated bank of power action verbs categorized by impact (Leadership, Technical, Optimization, Research, Communication).
  - Passive / weak phrase detector (identifies phrases like "Responsible for", "Helped with", "Worked on" and suggests strong alternatives).
  - Guaranteed never to fabricate achievements or invent false credentials.
- **Page-Break & Overflow Safeguards**:
  - Live page estimation (e.g. `2 Pages (A4 Flow)`).
  - Visual dashed guides showing exact A4 page transitions.
  - Proactive spill warning when text is within 50px of an awkward page split.
- **Theme & Typography Customization**:
  - 7 curated professional palette presets (Indigo, Slate, Teal, Navy, Emerald, Crimson, Bronze) plus custom hex picker.
  - 3 typography options: Modern Sans (System UI), Classic Serif (Georgia/Editorial), Technical Mono (Code/Developer).
  - 3 spacing densities: Compact, Normal, Relaxed.
- **Fictional Demo Profile & Blank Reset**:
  - 1-click load complete realistic profile (Alex Morgan - Senior Full Stack Engineer).
  - 1-click reset to blank slate with confirmation modal.
- **100% Offline Capability**:
  - Zero external CDN dependencies; all icons and styles bundled locally.
  - Auto-persists work in browser `localStorage`.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React (vector SVG, locally bundled)
- **Test Runner**: Node.js Native Test Runner (`node:test`)

```
src/
├── types/
│   └── resume.ts               # Schema version & full data model types
├── data/
│   └── sampleData.ts           # Fictional demonstration profile & metadata
├── utils/
│   ├── validation.ts           # Schema validation & corrupted file protection
│   ├── exportImport.ts         # JSON download & file upload reader
│   ├── atsMatcher.ts           # Transparent local keyword comparison
│   ├── actionVerbs.ts          # Action verb bank & weak phrasing detector
│   └── pageCalculator.ts       # Completeness & page overflow calculator
├── components/
│   ├── Header.tsx              # Top bar, sample loader, file I/O, PDF export
│   ├── editor/
│   │   ├── ProfileEditor.tsx
│   │   ├── SummaryEditor.tsx
│   │   ├── ExperienceEditor.tsx
│   │   ├── EducationEditor.tsx
│   │   ├── ProjectsEditor.tsx
│   │   ├── SkillsEditor.tsx
│   │   ├── CertificationsEditor.tsx
│   │   ├── AchievementsEditor.tsx
│   │   └── SectionOrganizer.tsx # Drag & drop + keyboard reorder + visibility
│   ├── preview/
│   │   ├── ResumePreview.tsx    # A4 layout, zoom, pagination guides
│   │   └── templates/
│   │       ├── ClassicTemplate.tsx
│   │       ├── ModernTemplate.tsx
│   │       └── MinimalTemplate.tsx
│   ├── tools/
│   │   ├── CompletenessMeter.tsx
│   │   ├── JobMatcherModal.tsx
│   │   ├── ActionVerbsModal.tsx
│   │   └── DesignSettingsModal.tsx
│   └── common/
│       ├── ConfirmModal.tsx
│       └── Toast.tsx
├── App.tsx                     # State orchestrator & responsive workspace
├── main.tsx                    # React DOM root entry
└── index.css                   # Tailwind directives & print media rules
```

---

## 🚀 Running the Project

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Run Automated Test Suite
```bash
npm test
```
All 17 automated tests cover schema validation, edge cases, completeness calculation, keyword matching, and page overflow boundaries.
