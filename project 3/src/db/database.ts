import Dexie, { type Table } from 'dexie';
import type { CartLine } from '../utils/calculations';

export type TaxCategory = 'NONE' | 'GST5' | 'GST12' | 'GST18' | 'GST28';

export const TAX_RATES: Record<TaxCategory, number> = {
  NONE: 0,
  GST5: 500,   // 5% in basis points (paise per 100 paise)
  GST12: 1200, // 12%
  GST18: 1800, // 18%
  GST28: 2800, // 28%
};

export interface ShopProfile {
  id?: number;
  shopName: string;
  address: string;
  phone: string;
  logoDataUrl?: string;
  upiId: string;
  currency: string;
  defaultTaxCategory: TaxCategory;
  receiptFooter?: string;
}

export interface Product {
  id?: number;
  name: string;
  sku?: string;
  category?: string;
  unit: string;
  unitPricePaise: number; // always integer paise
  taxCategory: TaxCategory;
  active: boolean;
  createdAt: number;
}

export interface BillItem {
  productId: number;
  productName: string; // snapshot
  productSku?: string;
  unit: string;        // snapshot
  unitPricePaise: number; // snapshot
  quantity: number;    // can be decimal (e.g. 0.5 kg)
  quantityDisplay: string; // e.g. "1.5"
  taxCategory: TaxCategory; // snapshot
  lineTaxRateBps: number;    // snapshot tax rate in basis points
  lineDiscountPaise: number; // per-item discount in paise
  lineSubtotalPaise: number; // unitPrice * quantity (before discount/tax)
  lineDiscountedPaise: number; // after line discount
  lineTaxPaise: number;       // tax on discounted base
  lineTotalPaise: number;     // discountedBase + tax
}

export type BillStatus = 'SAVED' | 'VOID';

export interface Bill {
  id?: number;
  billNumber: string;
  timestamp: number;
  status: BillStatus;
  voidReason?: string;
  items: BillItem[];
  subtotalPaise: number;      // sum of lineSubtotalPaise
  billDiscountPaise: number;  // bill-level discount
  billDiscountType: 'AMOUNT' | 'PERCENT';
  billDiscountValue: number;  // percent in bps or paise amount
  taxablePaise: number;       // sum of lineDiscountedPaise - billDiscount allocated
  taxPaise: number;           // sum of lineTaxPaise
  grandTotalPaise: number;    // taxablePaise + taxPaise
  paymentNote?: 'Not noted' | 'I checked my bank app';
  shopSnapshot: {
    shopName: string;
    address: string;
    phone: string;
    upiId: string;
    receiptFooter?: string;
  };
}

export interface AppSettings {
  id?: number;
  schemaVersion: number;
  nextBillNumber: number;
  billPrefix: string;
  installed?: boolean;
  lastBackupDate?: string;
}

export interface DraftBill {
  id?: number;
  lines: CartLine[];
  billDiscountType: 'AMOUNT' | 'PERCENT';
  billDiscountValue: number;
  updatedAt: number;
}

export class VyaparDB extends Dexie {
  shopProfile!: Table<ShopProfile>;
  products!: Table<Product>;
  bills!: Table<Bill>;
  appSettings!: Table<AppSettings>;
  drafts!: Table<DraftBill>;

  constructor() {
    super('VyaparLite');
    this.version(2).stores({
      shopProfile: '++id',
      products: '++id, name, sku, active',
      bills: '++id, billNumber, timestamp, status',
      appSettings: '++id',
      drafts: '++id, updatedAt',
    });
  }
}

export const db = new VyaparDB();

// Default starter products for neighbourhood shop
export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Toor dal 1 kg', sku: 'DAL-01', category: 'Pulses', unit: 'kg', unitPricePaise: 16500, taxCategory: 'NONE', active: true, createdAt: Date.now() },
  { name: 'Biscuit pack', sku: 'BISC-01', category: 'Snacks', unit: 'pack', unitPricePaise: 1000, taxCategory: 'GST18', active: true, createdAt: Date.now() },
  { name: 'Butter 100 g', sku: 'BTR-100', category: 'Dairy', unit: 'g', unitPricePaise: 5800, taxCategory: 'GST12', active: true, createdAt: Date.now() },
  { name: 'Basmati Rice (1kg)', sku: 'RICE-01', category: 'Grains', unit: 'kg', unitPricePaise: 9000, taxCategory: 'GST5', active: true, createdAt: Date.now() },
  { name: 'Sunflower Oil (1L)', sku: 'OIL-01', category: 'Oils', unit: 'litre', unitPricePaise: 14500, taxCategory: 'GST5', active: true, createdAt: Date.now() },
  { name: 'Aashirvaad Atta (5kg)', sku: 'ATTA-05', category: 'Grains', unit: 'packet', unitPricePaise: 23500, taxCategory: 'NONE', active: true, createdAt: Date.now() },
  { name: 'Sugar 1 kg', sku: 'SUGAR-01', category: 'Essentials', unit: 'kg', unitPricePaise: 4400, taxCategory: 'GST5', active: true, createdAt: Date.now() },
  { name: 'Tea 250 g', sku: 'TEA-250', category: 'Beverages', unit: 'packet', unitPricePaise: 13000, taxCategory: 'GST5', active: true, createdAt: Date.now() },
  { name: 'Milk 500 ml', sku: 'MILK-500', category: 'Dairy', unit: 'ml', unitPricePaise: 2700, taxCategory: 'NONE', active: true, createdAt: Date.now() },
  { name: 'Detergent powder 1 kg', sku: 'SURF-01', category: 'Cleaning', unit: 'packet', unitPricePaise: 12500, taxCategory: 'GST18', active: true, createdAt: Date.now() },
  { name: 'Toothpaste 150 g', sku: 'PASTE-150', category: 'Personal Care', unit: 'pcs', unitPricePaise: 9200, taxCategory: 'GST12', active: true, createdAt: Date.now() },
  { name: 'Soap pack of 3', sku: 'SOAP-03', category: 'Personal Care', unit: 'packet', unitPricePaise: 10500, taxCategory: 'GST18', active: true, createdAt: Date.now() },
];

// Initialize defaults on first run
export async function initDB() {
  const count = await db.appSettings.count();
  if (count === 0) {
    await db.appSettings.add({
      schemaVersion: 1,
      nextBillNumber: 1,
      billPrefix: '01',
    });
  }

  const shopCount = await db.shopProfile.count();
  if (shopCount === 0) {
    await db.shopProfile.add({
      shopName: 'Sri Murugan Stores',
      address: '12 Bazaar St, Madurai',
      phone: '9876543210',
      upiId: 'demo-shop@upi', // design.md default placeholder
      currency: 'INR',
      defaultTaxCategory: 'NONE',
      receiptFooter: 'Thank you. Visit again.',
    });
  }

  // Pre-seed starter product catalogue if empty
  const prodCount = await db.products.count();
  if (prodCount === 0) {
    await db.products.bulkAdd(INITIAL_PRODUCTS);
  }
}
