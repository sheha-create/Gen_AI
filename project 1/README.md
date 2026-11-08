# 📸 Smart ID Photo Lab

> **Offline-First Form Photo & Signature Studio** — Crop, level, compress, and validate photographs and signatures for official Indian exam forms (UPSC, SSC, GATE, IBPS) and international visa applications, entirely within your browser. **Zero server uploads. Complete privacy.**

---

## 🎯 Project Overview

**Smart ID Photo Lab** (also called *Form Photo Fixer*) is a production-quality, client-side web application that solves the frustratingly common problem of getting passport/ID photos and signatures to meet the exact pixel dimensions, file size limits, and format requirements demanded by government application portals.

### The Problem It Solves
Every year, millions of applicants struggle with:
- ❌ Photos rejected because they're 5 KB over the portal's max limit
- ❌ Wrong pixel dimensions (e.g., 200×230 vs. 350×350)
- ❌ Signatures with grey backgrounds instead of clean white
- ❌ Privacy concerns about uploading personal ID photos to unknown third-party websites

### Our Solution
A **100% client-side, offline-capable PWA** that:
- ✅ Ships with **5+ verified presets** sourced from official exam notifications
- ✅ Uses an **interactive canvas cropper** with face positioning guides
- ✅ Employs an **intelligent binary-search compression engine** that guarantees the output strictly meets KB limits
- ✅ Generates a **rule-by-rule compliance report** (PASS / WARNING / FAIL)
- ✅ Includes a **before/after split-slider** to visually inspect compression quality
- ✅ Supports **custom presets** for any form not in the built-in list
- ✅ **Never transmits any image data** — everything runs in-browser via Canvas API

---

## ✨ Features

### Core Functional Requirements Implemented

| PRD Requirement | Feature | Status |
|---|---|---|
| FR-01 | 5+ verified presets with exact specs (UPSC, SSC, GATE, IBPS, US Visa) | ✅ |
| FR-02 | Interactive Canvas-based photo cropper with drag, resize, aspect lock | ✅ |
| FR-03 | Face Guide Overlay (eye-line, crown, chin, face oval contour) | ✅ |
| FR-04 | Custom Preset creation with full validation | ✅ |
| FR-05 | Signature upload with contrast/whitening/threshold filters | ✅ |
| FR-06 | Iterative binary-search compression engine | ✅ |
| FR-07 | Before/After quality comparison slider | ✅ |
| FR-08 | Technical compliance validation report (PASS/WARN/FAIL per rule) | ✅ |
| FR-09 | One-click download of verified photo and signature files | ✅ |
| NFR-01 | 100% client-side, zero network transmission | ✅ |
| NFR-02 | Offline-capable PWA with Service Worker + manifest.json | ✅ |
| NFR-03 | Touch-friendly, responsive design (mobile + desktop) | ✅ |

### Additional Features
- **Rotation & Tilt Correction** — 90° rotation + fine angle slider (±30°)
- **Horizontal Flip** — Mirror correction for selfie camera photos
- **Signature Ink Cleanup** — Pure white paper filter, contrast boost, color inversion
- **Sample Data Loader** — One-click demo with pre-generated portrait and signature
- **Delete Custom Presets** — Manage saved configurations via localStorage
- **Accessibility** — Keyboard navigable, semantic HTML, ARIA labels

---

## 🏗️ Architecture

```
week_2 project 1/
├── index.html                 # Main SPA entry point
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (offline cache)
├── css/
│   └── styles.css             # Complete dark-mode UI stylesheet
├── js/
│   ├── app.js                 # Main application controller (orchestrator)
│   ├── presets.js              # Verified + custom preset data & validation
│   ├── cropper.js              # Interactive Canvas cropper with face guide
│   ├── compressor.js           # Binary-search JPEG compression engine
│   ├── validator.js            # Rule-by-rule compliance checker
│   ├── signature.js            # Signature processing & enhancement
│   └── comparison.js           # Before/After split-slider viewer
├── assets/
│   └── sample_images/
│       ├── sample_photo.jpg          # Generated test portrait
│       ├── sample_signature.jpg      # Generated test signature
│       └── large_phone_photo_12mp.jpg # High-res test image
└── tests/
    └── test_suite.html         # Automated browser test suite
```

### Module Dependency Flow

```
app.js (orchestrator)
  ├── presets.js      ← Preset data, selection, custom CRUD, validation
  ├── cropper.js      ← Canvas viewport, crop box, face guide rendering
  ├── compressor.js   ← Binary-search lossy compression engine
  ├── validator.js    ← Compliance rule evaluation (PASS/WARN/FAIL)
  ├── signature.js    ← Signature upload, contrast, threshold, export
  └── comparison.js   ← Interactive before/after split-slider
```

---

## 🚀 How to Run

### Option A: Direct File Open
Simply double-click `index.html` in your file explorer. The app runs entirely in-browser.

> **Note:** Service Worker registration requires HTTP serving, but all features work via `file://` protocol.

### Option B: Local HTTP Server (recommended for full PWA + Service Worker)

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Then open http://localhost:8000
```

### Option C: Run the Test Suite
Open `tests/test_suite.html` in any modern browser to run all automated validation tests.

---

## 🧪 Testing

The project includes a comprehensive browser-based test suite (`tests/test_suite.html`) covering:

| Test Category | Tests | Description |
|---|---|---|
| Preset Data Integrity | 9 tests | Verified preset fields, correct dimensions, fallback behavior |
| Custom Preset Validation | 6 tests | Name length, dimension ranges, min/max KB constraints |
| Compression Engine | 4 tests | Binary-search convergence, iteration logging, PNG handling |
| Compliance Validator | 7 tests | PASS/FAIL/WARNING scenarios, signature validation, source resolution |

**Total: 26 automated tests** — all run client-side in the browser.

---

## 📋 Verified Preset Specifications

| Preset | Dimensions | Max Size | Aspect Ratio | Signature |
|---|---|---|---|---|
| UPSC OTR | 350 × 350 px | 300 KB | 1:1 | 350 × 350 (≤ 300 KB) |
| SSC CGL/CHSL | 200 × 230 px | 50 KB | ~0.87 | 140 × 60 (≤ 20 KB) |
| GATE (IIT) | 480 × 640 px | 200 KB | 3:4 | 560 × 160 (≤ 200 KB) |
| IBPS PO/Clerk | 200 × 230 px | 50 KB | ~0.87 | 140 × 60 (≤ 20 KB) |
| US Visa DS-160 | 600 × 600 px | 240 KB | 1:1 | Optional |

All specifications sourced from official notification documents and portal instructions.

---

## 🔒 Privacy & Security

- **Zero network calls** — No fetch/XMLHttpRequest to any external server for image processing
- **No cookies or tracking** — localStorage used only for custom preset persistence
- **Service Worker** — Caches assets for offline use only; no analytics or telemetry
- **All processing via Canvas API** — `canvas.toBlob()`, `getImageData()`, `drawImage()`

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| UI Framework | Vanilla JavaScript (ES Modules), HTML5, CSS3 |
| Image Processing | HTML5 Canvas API (`CanvasRenderingContext2D`) |
| Compression | `canvas.toBlob()` with iterative quality binary search |
| Offline Support | Service Worker API + Cache API + Web App Manifest |
| State Management | Module-scoped variables + localStorage |
| Testing | Custom browser test runner (no external dependencies) |

**Zero external dependencies. No npm. No build step. No frameworks.**

---

## 📝 License

Built as part of **BSERC GenAI Internship — Week 2, Project 2**.
