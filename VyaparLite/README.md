# VyaparLite — Offline-First Small Shop Billing & UPI Collection App

> **BSERC GenAI Internship | Week 2 | Project 7 | Section B | Medium**  
> A phone-first, zero-cloud, 100% offline billing and UPI collection Progressive Web Application (PWA) tailored for neighbourhood kirana stores and small merchants.

---

## 🌟 Executive Summary

Small merchants often face unstable mobile network connectivity, manual calculation mistakes, loss of physical paper receipts, and delayed UPI payments. **VyaparLite** solves this by providing:
- **Instant offline billing**: Create itemized invoices with quantities, line/bill discounts, and GST taxes in seconds.
- **Dynamic local UPI QR codes**: Generates standard NPCI UPI payment requests with the exact payable amount and configured shop VPA directly on device—zero internet required.
- **Shareable receipt cards**: High-resolution receipt image generated locally via Canvas, shareable via native Android share sheet (WhatsApp, SMS) or instant PNG download.
- **Offline daily sales & audit history**: Stores all bills, voided invoices, and sales metrics persistently in browser IndexedDB.
- **Integer Paise financial engine**: Never uses floating-point arithmetic for monetary calculations, guaranteeing zero rounding errors.

---

## 🚀 Key Features

| Category | Capability | Details |
|---|---|---|
| 🏪 **Shop Profile** | Custom Identity & VPA | Store name, address, contact phone, default GST category, and custom UPI ID (e.g. `shop@okaxis`). |
| 📦 **Catalogue** | Instant Item Management | Add, edit, search, and activate/deactivate products. Supports decimal units (`kg`, `litre`, `pcs`, `packet`). Preloaded with sample kirana goods. |
| 🧾 **Billing Engine** | Multi-Tier Calculations | Line-item quantities, custom line discounts (₹), whole-bill discount (% or flat ₹), mixed GST tax tiers (0%, 5%, 12%, 18%, 28%), and sticky grand total. |
| 💳 **UPI QR Collection**| Offline Payment Code | Encodes `upi://pay` URI into a locally generated QR image with exact paise-precision total. |
| 🖼️ **Receipt Sharing** | Canvas Graphic & Web Share | Renders branded invoice graphic including bill number, date, line items, tax breakdown, and QR. Direct WhatsApp/share sheet sharing with PNG fallback. |
| 📊 **Daily Sales History**| Audit-Grade History | Search by invoice number or product, date filters, day total sales KPI, and cancellation/voiding with required audit reasons. |
| 💾 **Backup & Restore** | Zero Data Lock-in | Validated JSON database export and restore. |
| ✈️ **Offline-First (PWA)**| Flight-Mode Ready | Service worker caching + Dexie.js IndexedDB persistence. Works 100% with no network connection. |

---

## 🧮 Calculation & Data Integrity Engine

VyaparLite implements strict monetary and accounting integrity rules:

### 1. Integer Paise Arithmetic
All prices, discounts, taxes, and totals are computed and stored as **integer paise** ($1\text{ INR} = 100\text{ paise}$). Floating-point values (`0.1 + 0.2 != 0.3`) are never used in monetary calculations.

### 2. Precise Calculation Pipeline
$$\text{Line Subtotal} = \text{round}(\text{UnitPricePaise} \times \text{Quantity})$$
$$\text{Line Discounted Base} = \text{Line Subtotal} - \text{clamp}(\text{LineDiscountPaise}, 0, \text{Line Subtotal})$$
$$\text{Bill Discount Allocation}_i = \text{round}\left(\frac{\text{Line Discounted Base}_i}{\sum \text{Line Discounted Base}} \times \text{Total Bill Discount}\right)$$
$$\text{Line Taxable Base}_i = \text{Line Discounted Base}_i - \text{Bill Discount Allocation}_i$$
$$\text{Line Tax}_i = \text{round}\left(\frac{\text{Line Taxable Base}_i \times \text{TaxRateBps}}{10000}\right)$$
$$\text{Grand Total} = \sum \text{Line Taxable Base}_i + \sum \text{Line Tax}_i$$

### 3. Historical Bill Immutability
When an invoice is saved, a complete snapshot of product names, units, unit prices, and applied tax categories is frozen inside the bill record. Editing catalogue prices never retroactively alters historical receipts.

### 4. Non-Destructive Voiding
Saved bills cannot be silently edited or deleted. Shop owners can mark an invoice as **VOID** with an explicit reason (e.g. "Customer returned items"), excluding it from daily sales totals while retaining the historical audit record.

---

## 🧪 Acceptance Test Evidence: 5 Hand-Calculated Bills

The test suite in `test-calculations.js` verifies all five test scenarios down to exact single paise:

```bash
node test-calculations.js
```

### Fixture Breakdown Table

| # | Fixture Description | Line Items & Quantities | Discounts Applied | Taxable Base | GST Tax | Grand Total | Verification Status |
|---|---|---|---|---|---|---|:---:|
| **1** | Single item, zero discount, tax-exempt | 2 kg Rice @ ₹50.00 | ₹0.00 | ₹100.00 (`10000p`) | ₹0.00 | **₹100.00** (`10000p`) | ✅ PASS |
| **2** | Line discount + single item GST 5% | 3 kg Sugar @ ₹40.00 | ₹10.00 line discount | ₹110.00 (`11000p`) | ₹5.50 (`550p`) | **₹115.50** (`11550p`) | ✅ PASS |
| **3** | Multi-item mixed GST (5% & 18%) | 1 L Oil @ ₹150 (5%)<br>2 pkts Detergent @ ₹80 (18%) | ₹0.00 | ₹310.00 (`31000p`) | ₹36.30 (`3630p`) | **₹346.30** (`34630p`) | ✅ PASS |
| **4** | Line discount + 10% bill discount with mixed GST | 1 kg Ghee @ ₹500 (12%, ₹50 off)<br>2 pcs Soap @ ₹30 (18%) | ₹50 line disc + 10% (₹51) bill disc | ₹459.00 (`45900p`) | ₹58.32 (`5832p`) | **₹517.32** (`51732p`) | ✅ PASS |
| **5** | Decimal quantities + Flat ₹75 discount with rounding | 1.75 kg Almonds @ ₹800 (12%)<br>0.5 kg Tea @ ₹450 (5%) | ₹75.00 flat bill discount | ₹1550.00 (`155000p`) | ₹170.98 (`17098p`) | **₹1720.98** (`172098p`) | ✅ PASS |

---

## 🛡️ UPI & Payment Safety Model

1. **No Fake Payment Confirmation**: VyaparLite strictly acts as a payment request generator. It displays a clear disclaimer: *"QR initiates payment request. VyaparLite does not claim payment succeeded without merchant verification. Always verify in your merchant bank app."*
2. **Zero Credential Access**: The application never prompts for, stores, or transmits UPI PINs, OTPs, net-banking passwords, or account numbers.
3. **Configurable Payee**: Never hardcodes real payment VPAs. The merchant enters their own UPI ID in Settings, defaulting safely to `demo@upi` with warning indicators.

---

## 📱 Installation & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Start
```bash
# 1. Clone repository and navigate to folder
cd "week_2 project 3"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Or build production bundle
npm run build
npm run preview
```

### Android Phone / Mobile Installation (PWA)
1. Ensure the development server is running on local network (e.g. `http://<YOUR_LOCAL_IP>:5173`).
2. Open Chrome on your Android smartphone and navigate to the address.
3. Tap the browser menu (**⋮**) and select **"Add to Home screen"** or **"Install App"**.
4. The VyaparLite app icon will appear on your home screen and open in standalone fullscreen mode.
5. Turn on **Flight Mode** on the phone to test 100% offline billing, QR generation, receipt sharing, and history.

---

## 📂 Project Architecture

```
week_2 project 3/
├── public/
│   ├── favicon.svg          # Shop application vector icon
│   ├── manifest.json        # PWA standalone manifest
│   └── sw.js                # Service Worker for offline asset caching
├── src/
│   ├── db/
│   │   └── database.ts      # Dexie.js IndexedDB schema, models & types
│   ├── utils/
│   │   ├── calculations.ts  # Integer paise calculation engine
│   │   ├── money.ts         # Paise/Rupees formatting and math utils
│   │   ├── upi.ts           # Standard UPI URI builder & validator
│   │   └── billNumber.ts    # Sequential invoice numbering
│   ├── components/
│   │   └── Layout.tsx       # Phone-first navigation bar & header
│   ├── pages/
│   │   ├── Dashboard.tsx    # Daily KPI summary & recent bills
│   │   ├── Billing.tsx      # Fast checkout, product picker & discounts
│   │   ├── Receipt.tsx      # Canvas image renderer, UPI QR & Web Share
│   │   ├── History.tsx      # Date/text filterable bill audit log
│   │   ├── Catalogue.tsx    # Product management with unit & tax tiers
│   │   └── Settings.tsx     # Shop info, UPI configuration & backup/restore
│   ├── App.tsx              # Router configuration
│   ├── main.tsx             # Application mount & Service Worker registration
│   └── index.css            # Tailwind CSS v4 styling rules
├── test-calculations.js     # Verification suite for 5 hand-calculated bills
├── prompts.md               # Prompts log in build order
└── package.json
```

---

## 🔒 Security & Privacy Notice

VyaparLite runs entirely inside the client browser. No customer phone numbers, bill records, or store revenues are uploaded to any external server. To prevent data loss if browser website storage is cleared, use the **Export Backup** feature in Settings periodically.
