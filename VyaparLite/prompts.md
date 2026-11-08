# VyaparLite - Prompts & Build Trajectory

This document records the sequence of engineering prompts used to design, implement, and verify **VyaparLite** (Offline-First Small Shop Billing & UPI Collection App) in accordance with the PRD specification.

---

### Prompt 1: Project Initialization & Dependency Architecture
```text
Initialize a React + TypeScript + Vite project named VyaparLite configured as a Progressive Web Application (PWA).
Install core client-side dependencies:
- dexie & dexie-react-hooks for persistent IndexedDB storage
- qrcode for local canvas-based UPI payment QR generation
- lucide-react for touch-friendly mobile icons
- @tailwindcss/vite and tailwindcss for modern styling
- react-router-dom for client-side view routing

Configure strict offline capability:
- Manifest JSON with standalone display mode
- Service Worker with offline caching strategies
- No backend servers, external APIs, or cloud accounts
```

---

### Prompt 2: Database Schema & Integer Paise Monetary Domain
```text
Define IndexedDB data schema with Dexie.js adhering to data integrity rules:
1. All monetary values stored and calculated strictly as integer paise (1 INR = 100 paise) to avoid floating-point rounding errors.
2. Store ShopProfile with id, shopName, address, phone, logo, upiId (placeholder demo@upi by default), and default tax category.
3. Store Product catalogue with name, SKU, unit, unitPricePaise, taxCategory (NONE, GST5, GST12, GST18, GST28), and active boolean.
4. Store Bill records with sequential billNumber, timestamp, status (SAVED / VOID), voidReason, and complete product snapshots so historical receipts remain invariant even if catalogue items are later edited or deleted.
5. Store AppSettings tracking schemaVersion, nextBillNumber, and billPrefix.
```

---

### Prompt 3: Calculation Engine & Hand-Calculated Bill Unit Tests
```text
Implement `calculateBill(lines, billDiscountType, billDiscountValue)` with explicit calculation precedence:
1. Compute line subtotal (unitPricePaise * quantity).
2. Apply line-level discount (capped at line subtotal).
3. Compute bill-level discount (percentage or flat rupees).
4. Allocate bill discount proportionally across items based on their discounted base.
5. Calculate line tax on the final net discounted base: round(base * taxRateBps / 10000).
6. Sum taxable bases and taxes to get grandTotalPaise.
7. Implement 5 automated test fixtures verifying hand-calculated results down to exact single paise.
```

---

### Prompt 4: Mobile-First Touch UI & Navigation Shell
```text
Build a bottom-tab navigation layout optimized for single-hand Android phone usage:
- Header displaying app name and offline status badge
- Screens:
  * Dashboard (Today's sales KPI, bills count, quick "New Bill" button, recent bills list)
  * Billing (Searchable modal product picker, line item quantity stepper, line discount inputs, bill discount toggle, expandable breakdown, sticky Save action)
  * Receipt (Formatted invoice preview, dynamic UPI payment QR code, native Web Share API with PNG download fallback, and Void bill audit modal)
  * History (Date-picker filter, text search by invoice # or product, day sales total, void pill indicators)
  * Catalogue (Product list, active/inactive toggle, add/edit drawer, SKU duplicate check, preloaded sample items)
  * Settings (Shop profile info, UPI ID configuration with safety warning, invoice prefix, JSON export & validated backup import)
```

---

### Prompt 5: UPI URI Builder & Local QR Generator
```text
Build `buildUpiUri` adhering to NPCI standard UPI specification:
`upi://pay?pa={upiId}&pn={payeeName}&am={amountInRupees}&cu=INR&tn={note}`
Generate QR code offline on high-resolution canvas with embedded shop information and exact payable total.
Display explicit payment safety disclaimer:
"QR initiates payment request with exact amount. VyaparLite does not process or confirm banking transactions automatically. Check your merchant banking app or soundbox."
```

---

### Prompt 6: Canvas Receipt Image Generation & Web Share Integration
```text
Render the printable invoice directly onto an HTML5 Canvas:
- Include store branding, address, phone number
- Invoice number, timestamp, item lines, quantities, unit prices, discounts, GST tax breakdown
- Insert rendered UPI QR code directly inside receipt image
- Enable `navigator.share({ files: [receiptFile] })` for native Android WhatsApp/messaging sharing
- Provide graceful fallback to automatic PNG file download when Web Share API is not supported.
```

---

### Prompt 7: Verification, Test Execution & Offline Demonstration
```text
Execute automated tests for the 5 hand-calculated bills.
Build production distribution bundle with `npm run build`.
Verify offline readiness in flight mode, PWA installation criteria, and data persistence across page reloads.
```
