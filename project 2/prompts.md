# CareerCraft Studio — Prompt History & Architecture Documentation

## Project Information
- **Application**: CareerCraft Studio
- **Curriculum**: BSERC GenAI Internship · Week 2 · Project 3
- **Version**: 1.0.0
- **Status**: Complete & Verified

---

## 1. Executive Summary & Deliverables Checklist

| Requirement | Specification | Implementation Details | Status |
| :--- | :--- | :--- | :--- |
| **FR-01** | Structured form for core sections | Profile, Summary, Experience, Education, Projects, Skills, Certifications, Achievements | **Completed** |
| **FR-02** | Live A4 preview | True 210mm x 297mm proportion preview with real-time update on field edits | **Completed** |
| **FR-03** | 3 genuinely distinct templates | Classic (single-column), Modern (2-column sidebar), Minimal (Swiss editorial) | **Completed** |
| **FR-04** | Section reordering | Drag-and-drop handles + keyboard accessible move up/down + visibility toggle | **Completed** |
| **FR-05** | Selectable-text PDF export | Native print stylesheet (`@media print`), zero screenshot flattening, copyable text | **Completed** |
| **FR-06** | Save data to downloadable file | Schema v1.0.0 JSON exporter with full state backup | **Completed** |
| **FR-07** | Load data and restore fields | Safe JSON parser with strict schema validation and error feedback | **Completed** |
| **FR-08** | Multi-page resume flow | Page break indicators, dynamic page estimator, `break-inside: avoid` rules | **Completed** |
| **FR-09** | Completeness feedback | Dynamic completeness meter with weighted breakdown and suggestions | **Completed** |
| **FR-10** | Local Job Keyword Matcher | Transparent client-side keyword matching with explicit no-guarantee ATS disclaimer | **Completed** |
| **FR-11** | Theme customization | 7 curated accent color presets, custom hex picker, 3 typography styles, 3 spacings | **Completed** |
| **FR-12** | Offline capability | 100% local operation with bundled icons, fonts, styles, zero external network calls | **Completed** |

---

## 2. Structural Template Differentiation

The application implements three structurally distinct layouts:

1. **Classic Template**:
   - Single-column flow with traditional serif hierarchy.
   - Formal horizontal dividers colored with user's accent.
   - Inline bulleted contact bar and right-aligned dates.
   - Traditional ATS-optimized format ideal for banking, academia, and enterprise engineering.

2. **Modern Template**:
   - Two-column sidebar architecture (35% left sidebar, 65% main content column).
   - Prominent header banner with applicant's name and role in high contrast.
   - Left sidebar highlights key competencies (badges with proficiencies), education, and certifications.
   - Right main area contains executive summary callout and career track timeline with bullet dots and impact result cards.

3. **Minimal Template**:
   - Swiss editorial asymmetrical layout.
   - Left label column (25% width) dedicated to uppercase tracking-wide section headings.
   - Right content column (75% width) with generous whitespace, crisp line heights, and refined hairline dividers.
   - Clean, airy, minimalist aesthetic.

---

## 3. Evidence of Multi-Page Resume Flow (FR-08, T-04)

- **Page Dimension Accuracy**: The live preview document adheres strictly to A4 dimensions (`210mm` width by `297mm` height per page, approximating 1123px at 96 DPI).
- **Page Estimation Engine**: `src/utils/pageCalculator.ts` measures element scroll height and computes page count (e.g. `2 Pages (A4 Flow)`).
- **Visual Page Break Guide**: When content spills onto multiple pages, dashed visual guides indicate where page boundaries fall.
- **Spill & Overflow Alerts**: Warns users when content is within 50px of crossing into a subsequent page.
- **CSS Page-Break Rules**:
  - `break-inside: avoid; page-break-inside: avoid;` applied to work experience entries, education items, project cards, and certification blocks to prevent awkward splits across pages.
  - `break-after: avoid; page-break-after: avoid;` applied to headings (`h1`, `h2`, `h3`, `h4`) to prevent orphaned headings at the bottom of pages.

---

## 4. Evidence of 100% Offline Operation (FR-12, T-09)

- All UI icons are provided by `lucide-react` and bundled locally at build time into `dist/assets/`.
- No external CDNs, Google Fonts, or remote analytics are loaded.
- Web fonts default to robust system font stacks (`system-ui`, `Georgia`, `Menlo/Consolas`).
- Save and load operations operate entirely client-side using the HTML5 `Blob` and `FileReader` APIs.
- The ATS keyword matcher runs pure local regex extraction and stop-word filtering in the browser.
- Full offline test: Wi-Fi disabled, browser reloads from local build / dev server, all capabilities (editing, preview, save, load, PDF print) function flawlessly.

---

## 5. Test Suite Verification (Section 18 Test Plan)

All 17 automated test cases execute via `npm test` using Node.js's native test runner:

```
▶ Resume Data Validation (T-06, T-07, T-08)
  ✔ validates a pristine sample resume successfully
  ✔ rejects null or non-object input (T-08)
  ✔ rejects missing schemaVersion (T-08)
  ✔ rejects unsupported major schema version (T-08)
  ✔ rejects missing profile section (T-08)
  ✔ ensures all section keys are preserved even if imported file had missing ones
✔ Resume Data Validation (T-06, T-07, T-08)
▶ Resume Completeness Calculator (FR-09)
  ✔ computes 100% completeness for sample resume
  ✔ computes 0% completeness for empty resume
  ✔ increases completeness incrementally as fields are added
✔ Resume Completeness Calculator (FR-09)
▶ Page Overflow & Boundary Estimation (FR-08, T-04)
  ✔ estimates 1 page for standard content height
  ✔ estimates 2 pages for multi-page content flow
  ✔ flags overflow risk when content approaches page boundary threshold
✔ Page Overflow & Boundary Estimation (FR-08, T-04)
▶ Local ATS & Keyword Matcher (FR-10)
  ✔ matches common keywords between job description and resume corpus
  ✔ identifies missing keywords not present in resume
  ✔ handles empty job description gracefully
✔ Local ATS & Keyword Matcher (FR-10)
▶ Action Verbs and Phrasing Coach
  ✔ detects weak passive phrases like "Responsible for"
  ✔ provides constructive replacement alternatives without fabricating achievements
✔ Action Verbs and Phrasing Coach
ℹ tests 17
ℹ suites 5
ℹ pass 17
ℹ fail 0
```
