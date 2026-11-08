# ReDesignX: Same Page, New Design

[![Content Parity](https://img.shields.io/badge/Content_Parity-100%25_Verified-10b981.svg)](#content-fidelity-guarantee)
[![WCAG 2.1](https://img.shields.io/badge/Accessibility-WCAG_2.1_AAA%2FAA-38bdf8.svg)](#accessibility-standards)
[![Assignment](https://img.shields.io/badge/BSERC_GenAI_Internship-Week_2_Project_17-purple.svg)](#assignment-context)

> **ReDesignX** demonstrates how a formalized, reusable design skill can transform a plain, unstyled web page into a high-fidelity visual experience while keeping every single word, heading, call-to-action, and label 100% identical.

---

## Table of Contents
1. [Assignment Context & Overview](#assignment-context--overview)
2. [Project Deliverables Directory](#project-deliverables-directory)
3. [Content Fidelity Guarantee](#content-fidelity-guarantee)
4. [Reusable Design Skill Specification](#reusable-design-skill-specification)
5. [Before-and-After Visual Evidence & Rule Analysis](#before-and-after-visual-evidence--rule-analysis)
6. [Proof of Skill Reusability (Sample Page 2)](#proof-of-skill-reusability-sample-page-2)
7. [Automated Verification Suite](#automated-verification-suite)
8. [Interactive Comparison Portal](#interactive-comparison-portal)
9. [How to Run & Reproduce Locally](#how-to-run--reproduce-locally)

---

## Assignment Context & Overview
- **Program:** BSERC GenAI Internship · Week 2 Projects
- **Section & Number:** Section D, Project 17 (Page 19)
- **Primary Goal:**
  1. Build one plain baseline page without using a design skill.
  2. Create a reusable design skill covering hierarchy, typography, spacing, color, layout, responsive behavior, and accessibility.
  3. Redesign the page using the skill while preserving every word word-for-word.
  4. Provide before/after evidence, explain design improvements, and demonstrate reusability on a second concept.

---

## Project Deliverables Directory

```
week_2 project 8/
├── data/
│   ├── canonical_content.json         # Frozen content inventory for Primary Event page (720 words)
│   ├── second_sample_content.json     # Frozen content inventory for Second Roastery page (436 words)
│   └── verification_report.json       # Automated test suite audit report (0 diffs, 100% pass)
├── skills/
│   └── redesignx-skill/
│       ├── SKILL.md                   # Full design skill documentation & invocation guide
│       ├── design-tokens.css          # Reusable CSS custom property tokens
│       └── rules.json                 # Machine-readable rule definitions
├── src/
│   ├── baseline.html                  # Plain baseline page (unstyled Times New Roman)
│   ├── redesigned.html                # Redesigned page (craft skill applied)
│   ├── second_sample_baseline.html    # Second sample baseline (Café Roastery)
│   ├── second_sample_redesigned.html  # Second sample redesigned (reusable skill proof)
│   └── styles/
│       ├── baseline.css               # Minimal baseline styles
│       ├── redesigned.css             # High-fidelity modern styles for primary page
│       └── second_sample_redesigned.css # Reusable skill styles for second sample
├── screenshots/
│   ├── baseline-desktop.png           # 1280x800 baseline screenshot
│   ├── baseline-mobile.png            # 375x812 baseline screenshot
│   ├── redesigned-desktop.png         # 1280x800 redesigned screenshot
│   ├── redesigned-mobile.png          # 375x812 redesigned screenshot
│   ├── second-baseline-desktop.png    # 1280x800 second baseline screenshot
│   ├── second-baseline-mobile.png     # 375x812 second baseline screenshot
│   ├── second-redesigned-desktop.png  # 1280x800 second redesigned screenshot
│   └── second-redesigned-mobile.png   # 375x812 second redesigned screenshot
├── scripts/
│   └── verify_content.mjs             # Automated content diff & parity test runner
├── index.html                         # Interactive Comparison & Split Slider Portal
├── prompts.md                         # Detailed prompt engineering & milestone history
└── README.md                          # Comprehensive technical documentation
```

---

## Content Fidelity Guarantee

Both pages were strictly validated by `scripts/verify_content.mjs`:

| Page Concept | Baseline Words | Redesigned Words | Added / Deleted | Ordering Diff | Parity Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Apex Horizon Summit 2027** (Primary) | 720 | 720 | 0 | 0 | **100% PASSED** |
| **Lumina Artisan Roasters** (Reusability) | 436 | 436 | 0 | 0 | **100% PASSED** |

> **Fidelity Rule:** No text was rewritten, summarized, embellished, or added. Every heading, speaker bio, pricing package, bullet point, and button label remained 100% identical.

---

## Reusable Design Skill Specification

The design skill (`skills/redesignx-skill/SKILL.md`) encapsulates the following principles:

### 1. Visual Hierarchy
- **Focal Ratio:** The hero headline utilizes `clamp(2.75rem, 5vw, 4rem)` with weight 800 and leading 1.1, providing an instantaneous focal anchor.
- **Section Badges:** Every section opens with an uppercase tracking badge (`.badge-pill`) that provides spatial orientation before major headings.
- **3-Tier Elevation:** Base canvas (`#090d16`), Card surface (`#111827`), and Elevated interactive surface (`#1a2234`).

### 2. Modular Typography Scale
Rooted in the 1.25 (Major Third) ratio with fluid clamp scaling:
- Display 2XL: `clamp(2.75rem, 5vw, 4rem)` (Hero)
- Display XL: `clamp(1.875rem, 3.5vw, 2.5rem)` (H2 Headings)
- Display LG: `1.25rem` (20px) (Card Headings)
- Body Large: `1.125rem` (18px) (Lead copy, 1.65 line height)
- Body Base: `1rem` (16px) (Paragraphs, 68ch max width)
- Font Stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### 3. Spacing Grid (8pt Progression)
- All margins, paddings, and gaps use tokens: `--space-1` (4px), `--space-2` (8px), `--space-4` (16px), `--space-6` (24px), `--space-8` (32px), `--space-16` (64px), `--space-24` (96px).

### 4. Color & Accessible Contrast (WCAG 2.1 AAA / AA)
- Canvas: `#090d16`
- Primary Headline Text: `#f8fafc` (Contrast ratio **16.5:1** against canvas — passes WCAG AAA)
- Secondary Body Text: `#94a3b8` (Contrast ratio **5.8:1** against canvas — passes WCAG AA)
- Radiant Accent: Emerald `#10b981` (Contrast ratio **4.8:1** against card surface)

### 5. Layout & Responsive Behavior
- Container max-width: `1200px` with fluid 24px horizontal gutters.
- CSS Grid with `repeat(auto-fit, minmax(280px, 1fr))` for cards.
- Mobile-first breakpoints: 375px (Mobile), 768px (Tablet), 1024px (Laptop), 1280px (Desktop).
- Zero horizontal overflow (`overflow-x: hidden`).
- Touch targets: Minimum `44px × 44px` on all buttons and navigation links.

### 6. Accessibility
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Universal `:focus-visible` with 2px high-contrast emerald outline.
- Hardware-independent styling (color + typography + border).
- Media query `@media (prefers-reduced-motion: reduce)` disables transition animations.

---

## Before-and-After Visual Evidence & Rule Analysis

| Visual Area | Plain Baseline State | Redesigned State | Design Rule Implemented |
| :--- | :--- | :--- | :--- |
| **Typography & Hierarchy** | Generic browser serif (Times New Roman), low contrast, flat hierarchy. | Fluid geometric sans (Inter), 800-weight display title, clear visual contrast. | `RULE-TYPOGRAPHY-01` & `RULE-HIERARCHY-01` |
| **Hero & Metrics** | Default HTML table with basic grey borders. | High-impact 4-column metric cards with glowing emerald counters. | `RULE-COLOR-02` & `RULE-LAYOUT-02` |
| **Speaker Profiles** | Plain unstyled text separated by basic `<hr>` lines. | Elevated interactive card grid with hover lift and category-colored subheadings. | `RULE-LAYOUT-02` & `RULE-COLOR-02` |
| **Agenda & Schedule** | Dense raw bullet list. | 2-column day cards with structured schedule slots and hover borders. | `RULE-SPACING-01` & `RULE-LAYOUT-02` |
| **Pricing Packages** | Plain lists with unstyled grey buttons. | 3-tier card system featuring an elevated "Featured" badge and full-width CTAs. | `RULE-LAYOUT-02` & `RULE-RESPONSIVE-02` |
| **Navigation & Header** | Unstyled vertical list of links. | Glassmorphic sticky navbar with glowing brandmark and primary CTA. | `RULE-LAYOUT-01` & `RULE-COLOR-02` |
| **Mobile Adaptability** | Clipped layout with small non-touch-friendly buttons. | Adaptive single-column flow, 44px touch targets, zero horizontal scrolling. | `RULE-RESPONSIVE-01` & `RULE-RESPONSIVE-02` |

---

## Proof of Skill Reusability (Sample Page 2)

To demonstrate that the design skill is truly generalizable and not hardcoded to a single layout:
- **Concept 2:** "Lumina Artisan Roasters & Café"
- **Content:** Harvest micro-lots, café pour-over menu, roasting philosophy, and tasting club dispatches.
- **Result:**
  - Applied the exact same modular type scale, 8pt spacing grid, responsive grid cards, and accessibility rules with an amber coffee accent palette.
  - Automated verification confirmed **436 / 436 words matching identically** (0 mismatches).

---

## Automated Verification Suite

Run the automated verification suite anytime:
```bash
node scripts/verify_content.mjs
```

### Verification Output:
```text
======================================================
VERIFYING FIDELITY: Primary Event Landing Page (Apex Horizon Summit 2027)
======================================================
Raw Words Count:
  - Baseline Words:   720
  - Redesigned Words: 720
Normalized Token Count:
  - Baseline Tokens:   720
  - Redesigned Tokens: 720
Canonical String Entries: 109

Result for Primary Event Landing Page (Apex Horizon Summit 2027):
  - Missing in Baseline:   0
  - Missing in Redesigned:  0
  - Sequence Mismatches:    0
  - Content Parity Status:  PASSED (100% IDENTICAL)

======================================================
VERIFYING FIDELITY: Second Sample Page (Lumina Artisan Roasters)
======================================================
Raw Words Count:
  - Baseline Words:   436
  - Redesigned Words: 436
Normalized Token Count:
  - Baseline Tokens:   436
  - Redesigned Tokens: 436
Canonical String Entries: 71

Result for Second Sample Page (Lumina Artisan Roasters):
  - Missing in Baseline:   0
  - Missing in Redesigned:  0
  - Sequence Mismatches:    0
  - Content Parity Status:  PASSED (100% IDENTICAL)

OVERALL SUITE STATUS: ALL TESTS PASSED - 100% CONTENT FIDELITY GUARANTEED
```

---

## Interactive Comparison Portal

Open `index.html` in any browser to launch the Interactive Comparison Portal:
- **Interactive Split Slider:** Drag the emerald divider handle left and right to inspect the before-and-after transformation.
- **Live Side-by-Side Dual Frame:** Dual live iframes rendering the actual HTML files side-by-side.
- **Viewport Switcher:** Preview Desktop (1280px) and Mobile (375px) viewports with one click.
- **Concept Switcher:** Toggle between Event Summit and Artisan Roastery instantly.
- **Design Improvement Rules:** Interactive rule explorer linking visual changes to specific tokens.
- **Content Parity Inspector:** Live metrics display showing the word count parity and automated test logs.

---

## How to Run & Reproduce Locally

1. **Clone or Navigate to the Workspace:**
   ```bash
   cd "week_2 project 8"
   ```

2. **Run Content Verification:**
   ```bash
   node scripts/verify_content.mjs
   ```

3. **Launch the Comparison Portal:**
   Double-click `index.html` or serve via any static HTTP server:
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```
   Open `http://localhost:8080` in your web browser.

4. **Open Standalone Pages Directly:**
   - Baseline: `src/baseline.html`
   - Redesign: `src/redesigned.html`
   - Second Baseline: `src/second_sample_baseline.html`
   - Second Redesign: `src/second_sample_redesigned.html`

---
*Created for BSERC GenAI Internship · Week 2 Project 17 · ReDesignX*
