# ReDesignX: Development & Prompt Engineering Log (`prompts.md`)

This document records the prompt sequence and engineering steps used to execute **Project 17 · ReDesignX** (Same Page, New Design) according to the Product Requirements Document (PRD) for the BSERC GenAI Internship (Week 2, Section D).

---

## Milestone 1: Page Concept & Canonical Content Inventory Freezing

### Objective
Define the primary and secondary page concepts and freeze the canonical content inventory in structured JSON format before any design work commences.

### Master Prompt Used:
```text
System Role: Senior Design Systems Engineer & Content Architect
Task: Generate two complete, realistic web page content inventories:
1. Primary Concept: "Apex Horizon Summit 2027" (Annual Climate & Clean Tech Symposium event landing page).
2. Secondary Concept: "Lumina Artisan Roasters" (Specialty coffee roastery and café menu/product page).

Requirements:
- Structure content logically into semantic sections: Announcement Bar, Navigation, Hero (with badge, headline, subtitle, metrics, and actions), About/Mission, Featured Items/Speakers, Agenda/Menu, Logistics/Venue, Pricing/Tiers, Testimonials, Newsletter Form, and Footer.
- Ensure all copy is realistic, professional, and free from dummy "lorem ipsum" filler.
- Save canonical content as immutable JSON files (canonical_content.json and second_sample_content.json).
- Explicitly declare the Content Fidelity Pledge: "Every visible word, label, heading, sentence, metric, badge, and CTA must remain 100% identical in both baseline and redesigned versions."
```

### Generated Artifacts:
- `data/canonical_content.json` (109 canonical string items, 720 words)
- `data/second_sample_content.json` (71 canonical string items, 436 words)

---

## Milestone 2: Plain Baseline Page Construction & Pre-Skill Screenshot Capture

### Objective
Construct the baseline HTML page using deliberately minimal, default browser styling without invoking or referencing any design skill. Capture baseline screenshots prior to any redesign work.

### Baseline Construction Prompt Used:
```text
Task: Build src/baseline.html and src/styles/baseline.css using the exact text from data/canonical_content.json.

Constraints:
- DO NOT apply any modern design system, CSS grid frameworks, or aesthetic styling.
- Use default browser typography ("Times New Roman", serif), raw table borders, default browser buttons, standard blue hyperlinks, and basic box models.
- Include every single word, heading, button, label, and link in exact canonical order.
- Do not add or remove a single character of copy.
```

### Pre-Skill Screenshot Capture Command:
```powershell
chrome.exe --headless=new --disable-gpu --window-size=1280,1400 --screenshot="screenshots/baseline-desktop.png" "src/baseline.html"
chrome.exe --headless=new --disable-gpu --window-size=375,812 --screenshot="screenshots/baseline-mobile.png" "src/baseline.html"
```

### Generated Artifacts:
- `src/baseline.html`
- `src/styles/baseline.css`
- `src/second_sample_baseline.html`
- `screenshots/baseline-desktop.png`
- `screenshots/baseline-mobile.png`
- `screenshots/second-baseline-desktop.png`
- `screenshots/second-baseline-mobile.png`

---

## Milestone 3: Reusable Design Skill Formulation

### Objective
Author a formal, reusable Antigravity design skill with explicit rules for visual hierarchy, typography, 8pt spacing grid, WCAG color contrast, CSS grid layouts, responsive media queries, and accessibility standards.

### Design Skill Authoring Prompt Used:
```text
Task: Create a reusable design skill in skills/redesignx-skill/SKILL.md following the Antigravity skill specification format.

Key Requirements:
1. Reusability: Rules must apply to ANY plain web page or document, not just a single hardcoded page.
2. Visual Hierarchy: Define a 3-tier elevation system (Canvas, Surface, Elevated) and clear focal point ratio (2.5x font size difference).
3. Modular Typography Scale: Base font size on Major Third (1.25 ratio) with fluid clamp formulas from 12px to 64px. System sans-serif stack (Inter / Segoe UI / Apple-system).
4. Spacing System: Strict 8pt grid tokens (--space-1: 4px to --space-24: 96px).
5. Color & Contrast Tokens: Nocturnal slate with radiant emerald accents; specify WCAG 2.1 AAA/AA compliant contrast ratios (>4.5:1 for body copy, >16:1 for primary headlines).
6. Layout & Grids: 1200px container max-width, responsive CSS Grid with minmax auto-fit.
7. Responsive Architecture: Mobile-first media queries, zero horizontal overflow, 44px touch targets.
8. Accessibility: Semantic HTML5 landmarks, visible :focus-visible indicators with 2px emerald rings, prefers-reduced-motion media query.
9. Deliver rules.json and design-tokens.css alongside SKILL.md.
```

### Generated Artifacts:
- `skills/redesignx-skill/SKILL.md`
- `skills/redesignx-skill/design-tokens.css`
- `skills/redesignx-skill/rules.json`

---

## Milestone 4: Skill Application & Redesigned Page Implementation

### Objective
Apply the design skill tokens and layout rules to redesign the page while maintaining 100% word-for-word identity with the baseline.

### Redesign Prompt Used:
```text
Task: Build src/redesigned.html and src/styles/redesigned.css by applying skills/redesignx-skill/SKILL.md to the exact content of src/baseline.html.

Rules:
- Transform presentation into a high-tier digital experience: sticky glassmorphic navigation, radiant hero gradient, stats grid cards, speaker bio cards with hover lift, two-day agenda schedule layout, 3-tier pricing cards with featured badge, and polished newsletter form.
- Content Fidelity Rule: Do not add, omit, paraphrase, or reorder any visible text string.
- Repeat the transformation for the second concept (src/second_sample_redesigned.html and src/styles/second_sample_redesigned.css) to prove skill reusability.
```

### Generated Artifacts:
- `src/redesigned.html`
- `src/styles/redesigned.css`
- `src/second_sample_redesigned.html`
- `src/styles/second_sample_redesigned.css`
- `screenshots/redesigned-desktop.png`
- `screenshots/redesigned-mobile.png`
- `screenshots/second-redesigned-desktop.png`
- `screenshots/second-redesigned-mobile.png`

---

## Milestone 5: Automated Verification & Comparative Analysis

### Objective
Run an automated verification suite that tokenizes all visible text in baseline and redesigned HTML files and asserts 100% identity against the canonical inventory. Capture comparison evidence and package the interactive portal.

### Content Verification Script Prompt Used:
```text
Task: Write scripts/verify_content.mjs to perform automated content fidelity checking.

Requirements:
- Strip HTML tags, scripts, styles, and comments.
- Extract input placeholders, button texts, headings, and paragraphs.
- Normalize tokens and compare word count, canonical string presence, and sequence ordering.
- Produce data/verification_report.json and exit with code 0 only when both primary and secondary pages achieve 100% parity.
```

### Generated Artifacts:
- `scripts/verify_content.mjs`
- `data/verification_report.json` (0 missing, 0 diffs, 100% parity across both pages)
- `index.html` (Interactive comparison hub with split slider, dual-frame viewer, and rules inspector)
- `README.md`
