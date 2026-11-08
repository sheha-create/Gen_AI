---
name: redesignx-skill
description: Reusable Design System & Visual Hierarchy Skill for transforming unstyled web pages into high-fidelity, accessible, responsive experiences while guaranteeing 100% word-for-word content preservation.
---

# ReDesignX Craft Skill: Precision Web Transformation System

## 1. Skill Purpose & Core Axiom
The ReDesignX Craft Skill is a systematic, reusable design methodology engineered to transform raw, unstyled, or legacy web documents into modern, polished, responsive, and accessible digital products.

> **CRITICAL CONTENT PRESERVATION AXIOM:**
> Under no circumstances may any visible word, label, heading, sentence, metric, badge, or call-to-action text be added, removed, paraphrased, or rewritten. The skill modifies strictly presentation, geometry, typography, color, spacing, visual grouping, and micro-interactions.

---

## 2. Visual Principles & Hierarchy
1. **Clear Hero Focal Point:**
   - Establish an unmistakable focal point in the first 600px of vertical viewport height.
   - Contrast ratio between the headline and surrounding body copy should be at least 2.5× in size and 300 in font-weight difference.
2. **Scannability & Chunking:**
   - Long walls of text must be broken down visually using distinct section containers, semantic cards, and spatial margins without altering prose.
   - Use badge tags (e.g. `uppercase tracking-wider font-semibold`) as categorical anchor points before section headings.
3. **Information Architecture & Elevation:**
   - Employ a 3-tier elevation system:
     - Level 0 (Base canvas): Deep slate/charcoal or warm crisp neutral surface.
     - Level 1 (Section containers & cards): Distinct background with a subtle border (`1px solid hsla(...)`) and soft multi-layer shadow.
     - Level 2 (Interactive elements, dropdowns, sticky navigation, modals): Higher contrast border, subtle glow or backdrop blur (`backdrop-filter: blur(12px)`).

---

## 3. Typography Scale & Font Pairing
The design skill specifies a geometric modular type scale rooted in the 1.25 (Major Third) ratio with fluid clamp sizing:

| Token Name | Size Formula / Value | Weight | Line Height | Letter Spacing | Typical Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--font-display-2xl` | `clamp(2.5rem, 5vw + 1rem, 4rem)` (40px–64px) | 800 (Extrabold) | 1.1 | -0.03em | Primary Hero Headline |
| `--font-display-xl` | `clamp(2rem, 3.5vw + 0.5rem, 3rem)` (32px–48px) | 700 (Bold) | 1.2 | -0.025em | Section Headings (H2) |
| `--font-display-lg` | `clamp(1.5rem, 2.5vw + 0.25rem, 2rem)` (24px–32px) | 700 (Bold) | 1.25 | -0.02em | Card & Subsection Titles (H3) |
| `--font-heading-md` | `1.25rem` (20px) | 600 (Semibold) | 1.35 | -0.01em | Speaker/Product Names |
| `--font-body-lg` | `1.125rem` (18px) | 400 (Regular) | 1.65 | 0 | Hero Subtitle, Lead Paragraphs |
| `--font-body-base` | `1rem` (16px) | 400 (Regular) | 1.6 | 0 | Body Text, Feature Lists |
| `--font-body-sm` | `0.875rem` (14px) | 500 (Medium) | 1.5 | 0.01em | Secondary metadata, tags, table rows |
| `--font-caption` | `0.75rem` (12px) | 600 (Semibold) | 1.4 | 0.08em | Category badges (Uppercase) |

### Font Stack
- Primary Sans: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Monospace / Numeric: `ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`

---

## 4. Spacing System (8pt Grid)
All layout margins, paddings, and gaps must strictly adhere to the mathematical 4px/8px geometric progression:

- `--space-1`: `4px` (0.25rem) — Micro gaps between icon and text
- `--space-2`: `8px` (0.5rem) — Badge padding, button tight gap
- `--space-3`: `12px` (0.75rem) — Small card internal padding
- `--space-4`: `16px` (1.0rem) — Standard button padding, stack spacing
- `--space-6`: `24px` (1.5rem) — Card body padding, grid column gaps
- `--space-8`: `32px` (2.0rem) — Card separation, subsection margin
- `--space-12`: `48px` (3.0rem) — Major section header margin
- `--space-16`: `64px` (4.0rem) — Standard desktop section vertical padding
- `--space-24`: `96px` (6.0rem) — Hero & flagship section vertical spacing

---

## 5. Color Tokens & Accessible Contrast (WCAG 2.1 AAA / AA)
All foreground-to-background combinations meet or exceed WCAG AA standards (4.5:1 for body copy, 3:1 for large display text, 3:1 for UI components).

### Modern Dark Slate & Emerald Energy Theme:
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-canvas: #090d16;          /* Deep nocturnal slate canvas */
  --bg-surface: #111827;         /* Level 1 card surface */
  --bg-surface-elevated: #1a2234;/* Level 2 interactive surface */
  --bg-surface-subtle: #0f1624;  /* Inset / table background */
  
  /* Primary & Accent Spectrum */
  --brand-primary: #10b981;       /* Radiant Emerald: 4.8:1 contrast on surface */
  --brand-primary-hover: #059669; /* Emerald hover shade */
  --brand-primary-glow: rgba(16, 185, 129, 0.25);
  --brand-accent: #38bdf8;        /* Sky Blue accent */
  --brand-accent-glow: rgba(56, 189, 248, 0.2);

  /* Typography Colors */
  --text-primary: #f8fafc;       /* 98% luminosity; 16.5:1 contrast against canvas */
  --text-secondary: #94a3b8;     /* Slate-400; 5.8:1 contrast against canvas (WCAG AA pass) */
  --text-muted: #64748b;         /* Slate-500; auxiliary text */
  --text-inverse: #090d16;       /* On top of primary emerald CTA */

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --border-highlight: rgba(16, 185, 129, 0.4);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 25px rgba(16, 185, 129, 0.25);
}
```

---

## 6. Layout & Grid Rules
1. **Container Centering:**
   - Maximum container width capped at `1200px` (`max-width: 1200px; margin-inline: auto;`).
   - Side gutter padding of minimum `24px` on desktop, `16px` on mobile.
2. **Modern CSS Grid for Content:**
   - Multi-column grids must use auto-fit or responsive tracks:
     `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));`
   - Agenda and timeline schedules use flexible split layouts: time markers juxtaposed against description cards.
3. **Flexbox Alignment:**
   - Navigation uses space-between flex alignment with sticky/fixed positioning and glassmorphism backdrop blur.
   - Buttons within actions row use flex wrapping with consistent gap (`--space-3`).

---

## 7. Responsive Behavior Rules
1. **Mobile-First Breakpoint Architecture:**
   - Phone (`< 640px`): Single column flow, stack horizontal items, full-width buttons, collapsible navigation.
   - Tablet (`640px – 1024px`): 2-column grids for cards and agenda items.
   - Desktop (`> 1024px`): Full 3/4-column grids, horizontal stats bar, expanded horizontal navigation.
2. **Zero Horizontal Overflow:**
   - Strict `overflow-x: hidden` on viewport roots.
   - All images and tables wrap or scroll gracefully (`max-width: 100%`).
3. **Touch Targets:**
   - Every interactive control (button, link, input) has a minimum touch target bounding box of `44px × 44px`.

---

## 8. Component Consistency Rules
1. **Buttons:**
   - Primary: Radiant brand gradient background, contrasting inverse text, subtle box shadow with transition, border-radius of `8px` or `9999px` (pill).
   - Secondary: Subtle transparent surface with `1px solid var(--border-strong)`, color `var(--text-primary)`, hover background `var(--bg-surface-elevated)`.
   - Hover state: `-2px` translateY transform and active scale `0.98`.
2. **Cards:**
   - Background `var(--bg-surface)`, border `1px solid var(--border-subtle)`, rounded corners `16px`.
   - Transition: `transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease`.
3. **Badges:**
   - Inline-flex, uppercase, `letter-spacing: 0.08em`, font-size `0.75rem`, padding `4px 12px`, border-radius `9999px`, background `rgba(16, 185, 129, 0.12)`, text color `var(--brand-primary)`.
4. **Form Controls:**
   - Inputs styled with dark inset surface, `1px solid var(--border-subtle)`, focus ring `2px solid var(--brand-primary)` with zero offset.

---

## 9. Accessibility Specifications (WCAG 2.1 AA/AAA)
1. **Semantic Landmarks:**
   - Use proper `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>` containers.
2. **Accessible Focus Rings:**
   - Implement universal `:focus-visible` styles with high contrast outlines (`outline: 2px solid var(--brand-primary); outline-offset: 2px;`).
3. **Color Independence:**
   - Information must never be communicated through color alone. Badges, links, and active states include typography weights or iconography.
4. **Motion Sensitivity:**
   - Respect user preferences via `@media (prefers-reduced-motion: reduce)`. Disable smooth transforms and transitions when requested.

---

## 10. Reusable Invocation Instructions
To apply this skill to any existing plain page:
1. **Read & Lock Content:** Extract visible text nodes into a canonical JSON object to freeze all copy.
2. **Link Design Tokens:** Import `design-tokens.css` into the target document head.
3. **Upgrade Semantic Wrapper Structure:** Wrap existing plain elements into designated modern layout containers (`.container`, `.grid-2col`, `.grid-3col`, `.card-surface`, `.badge-pill`).
4. **Apply Component Classes:** Apply `.btn-primary`, `.btn-secondary`, `.pricing-card`, `.stat-counter` without touching text innerHTML.
5. **Execute Automated Verification:** Run `scripts/verify_content.mjs` to mathematically guarantee zero word differences.
