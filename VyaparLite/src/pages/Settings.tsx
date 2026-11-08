import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db, type TaxCategory } from '../db/database';
import { isValidUpiId } from '../utils/upi';
import {
  Save,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  Store,
  CreditCard,
  Receipt,
  Database,
  ShieldAlert,
  ChevronRight,
  FileText,
} from 'lucide-react';

const TAX_OPTIONS: { label: string; value: TaxCategory }[] = [
  { label: 'Exempt / 0%', value: 'NONE' },
  { label: 'GST 5%', value: 'GST5' },
  { label: 'GST 12%', value: 'GST12' },
  { label: 'GST 18%', value: 'GST18' },
  { label: 'GST 28%', value: 'GST28' },
];

export default function Settings() {
  const navigate = useNavigate();
  const shop = useLiveQuery(() => db.shopProfile.toCollection().first());
  const appSettings = useLiveQuery(() => db.appSettings.toCollection().first());

  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [upiId, setUpiId] = useState('');
  const [defaultTax, setDefaultTax] = useState<TaxCategory>('NONE');
  const [billPrefix, setBillPrefix] = useState('INV');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    if (shop) {
      setShopName(shop.shopName || '');
      setAddress(shop.address || '');
      setPhone(shop.phone || '');
      setUpiId(shop.upiId || '');
      setDefaultTax(shop.defaultTaxCategory || 'NONE');
      setReceiptFooter(shop.receiptFooter || 'Thank you. Visit again.');
    }
  }, [shop]);

  useEffect(() => {
    if (appSettings) {
      setBillPrefix(appSettings.billPrefix || 'INV');
    }
  }, [appSettings]);

  const handleSave = async () => {
    setError('');
    if (!shopName.trim()) {
      setError('Shop name is required');
      return;
    }
    if (upiId && !isValidUpiId(upiId)) {
      setError('UPI ID needs an @, like name@bank (e.g. murugan@okhdfcbank)');
      return;
    }

    const shopData = {
      shopName: shopName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      upiId: upiId.trim() || 'demo@upi',
      currency: 'INR',
      defaultTaxCategory: defaultTax,
      receiptFooter: receiptFooter.trim() || 'Thank you. Visit again.',
    };

    if (shop?.id) {
      await db.shopProfile.update(shop.id, shopData);
    } else {
      await db.shopProfile.add(shopData);
    }

    if (appSettings?.id) {
      await db.appSettings.update(appSettings.id, {
        billPrefix: billPrefix.trim().toUpperCase() || 'INV',
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = async () => {
    const data = {
      app: 'VyaparLite',
      version: 1,
      exportedAt: new Date().toISOString(),
      shopProfile: await db.shopProfile.toArray(),
      products: await db.products.toArray(),
      bills: await db.bills.toArray(),
      appSettings: await db.appSettings.toArray(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VyaparLite_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Validating and restoring backup…');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !Array.isArray(data.products) || !Array.isArray(data.bills)) {
        throw new Error('This file isn\'t a VyaparLite backup.');
      }

      await db.transaction('rw', [db.shopProfile, db.products, db.bills, db.appSettings], async () => {
        await db.shopProfile.clear();
        await db.products.clear();
        await db.bills.clear();
        await db.appSettings.clear();

        if (data.shopProfile?.length) {
          await db.shopProfile.bulkAdd(data.shopProfile.map(({ id: _, ...r }: any) => r));
        }
        if (data.products?.length) {
          await db.products.bulkAdd(data.products.map(({ id: _, ...r }: any) => r));
        }
        if (data.bills?.length) {
          await db.bills.bulkAdd(data.bills.map(({ id: _, ...r }: any) => r));
        }
        if (data.appSettings?.length) {
          await db.appSettings.bulkAdd(data.appSettings.map(({ id: _, ...r }: any) => r));
        }
      });
      setImportStatus('✅ Backup imported. All products and bills restored.');
    } catch (err: any) {
      setImportStatus(`❌ Import failed: ${err.message}`);
    }
    e.target.value = '';
  };

  const isUpiValidFormat = !upiId || isValidUpiId(upiId);

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="bg-[var(--paper)] rounded-[10px] p-4 border border-[var(--line)] space-y-3">
      <div className="flex items-center gap-2 text-[var(--ballpoint)] font-bold text-sm">
        <div className="p-1.5 bg-[var(--ballpoint-wash)] rounded-lg">
          <Icon size={17} />
        </div>
        <h2 className="font-ui">{title}</h2>
      </div>
      {children}
    </div>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="font-bold text-[var(--ink-2)] block mb-1 text-xs">{children}</label>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={`w-full border border-[var(--line)] bg-[var(--well)] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)] ${props.className ?? ''}`}
    />
  );

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-10">
      <div>
        <h1 className="text-xl font-black text-[var(--ink)] tracking-tight font-ui">Settings</h1>
        <p className="text-xs text-[var(--ink-3)] font-medium mt-0.5">Store profile, UPI and data backups</p>
      </div>

      {/* Quick links */}
      <div className="bg-[var(--paper)] rounded-[10px] border border-[var(--line)] overflow-hidden">
        <button
          onClick={() => navigate('/catalogue')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[var(--well)] transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] rounded-lg">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--ink)]">Product catalogue</p>
              <p className="text-[11px] text-[var(--ink-3)]">Add, edit and manage products</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[var(--ink-3)]" />
        </button>
      </div>

      {error && (
        <div className="bg-[var(--stamp-wash)] border border-[var(--stamp)]/30 text-[var(--stamp)] text-xs p-3.5 rounded-[10px] flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="bg-[var(--ledger-wash)] border border-[var(--ledger)]/30 text-[var(--ledger)] text-xs p-3.5 rounded-[10px] flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0" />
          <span className="font-bold">Settings saved!</span>
        </div>
      )}

      {/* Shop Profile */}
      <Section icon={Store} title="Store profile">
        <div className="space-y-2.5 text-xs">
          <div>
            <FieldLabel>Shop name *</FieldLabel>
            <Input
              type="text"
              placeholder="e.g. Sri Murugan Stores"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Address / Landmark</FieldLabel>
            <Input
              type="text"
              placeholder="e.g. 12 Bazaar St, Madurai"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Contact phone</FieldLabel>
            <Input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Receipt footer</FieldLabel>
            <Input
              type="text"
              placeholder="e.g. Thank you. Visit again."
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
            />
          </div>
        </div>
      </Section>

      {/* UPI */}
      <Section icon={CreditCard} title="UPI payee">
        <div className="space-y-2 text-xs">
          <div>
            <FieldLabel>Shop UPI ID (VPA)</FieldLabel>
            <input
              type="text"
              placeholder="e.g. murugan@okhdfcbank or 9876543210@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className={`w-full border rounded-[10px] px-3 py-2.5 text-xs font-mono font-bold text-[var(--ink)] focus:outline-none focus:ring-1 ${
                !isUpiValidFormat
                  ? 'border-[var(--stamp)] bg-[var(--stamp-wash)] focus:ring-[var(--stamp)] focus:border-[var(--stamp)]'
                  : 'border-[var(--line)] bg-[var(--well)] focus:border-[var(--ballpoint)] focus:ring-[var(--ballpoint)]'
              }`}
            />
            {!isUpiValidFormat && (
              <p className="text-[11px] text-[var(--stamp)] mt-1 font-medium">
                UPI ID needs an @, like name@bank.
              </p>
            )}
          </div>

          <div className="bg-[var(--well)] border border-[var(--line)] rounded-[10px] p-3 flex items-start gap-2.5 text-[11px] text-[var(--ink-2)]">
            <ShieldAlert size={16} className="text-[var(--tally)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Payment safety:</strong> VyaparLite only prepares a payment request. We never ask for or store a UPI PIN, OTP or bank password. Check your merchant soundbox or banking app to confirm settlement.
            </p>
          </div>
        </div>
      </Section>

      {/* Billing Defaults */}
      <Section icon={Receipt} title="Invoice numbering">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <FieldLabel>Invoice prefix</FieldLabel>
            <input
              type="text"
              maxLength={6}
              value={billPrefix}
              onChange={(e) => setBillPrefix(e.target.value.toUpperCase())}
              placeholder="INV"
              className="w-full border border-[var(--line)] bg-[var(--well)] rounded-[10px] px-3 py-2.5 text-xs font-mono uppercase font-black text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
            />
            <span className="text-[10px] text-[var(--ink-3)] mt-0.5 block font-tape">e.g. {billPrefix || 'INV'}-0001</span>
          </div>

          <div>
            <FieldLabel>Default tax</FieldLabel>
            <select
              value={defaultTax}
              onChange={(e) => setDefaultTax(e.target.value as TaxCategory)}
              className="w-full border border-[var(--line)] bg-[var(--well)] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[var(--ink)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
            >
              {TAX_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-[var(--ink-3)] leading-relaxed">
          VyaparLite doesn't give legal or accounting advice. Confirm your GST obligations with a CA.
        </p>
      </Section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-[var(--ballpoint)] hover:opacity-90 active:scale-[0.99] text-white font-bold py-4 px-4 rounded-[10px] flex items-center justify-center gap-2 transition text-sm"
      >
        <Save size={16} />
        <span>Save settings</span>
      </button>

      {/* Backup & Restore */}
      <Section icon={Database} title="Backup and restore">
        <p className="text-xs text-[var(--ink-2)] leading-relaxed">
          Bills and products are stored on this device in IndexedDB. Clearing browser cache can erase them. Export a backup regularly.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="border border-[var(--ballpoint)]/30 bg-[var(--ballpoint-wash)] hover:bg-[var(--ballpoint-wash)]/80 text-[var(--ballpoint)] text-xs font-bold py-3 px-3 rounded-[10px] flex items-center justify-center gap-1.5 transition"
          >
            <Download size={14} />
            <span>Export backup</span>
          </button>

          <label className="border border-[var(--line)] hover:bg-[var(--well)] text-[var(--ink-2)] text-xs font-bold py-3 px-3 rounded-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition">
            <Upload size={14} />
            <span>Restore backup</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <p className={`text-xs p-3 rounded-[10px] border font-semibold ${
            importStatus.includes('❌')
              ? 'bg-[var(--stamp-wash)] text-[var(--stamp)] border-[var(--stamp)]/30'
              : 'bg-[var(--ledger-wash)] text-[var(--ledger)] border-[var(--ledger)]/30'
          }`}>
            {importStatus}
          </p>
        )}
      </Section>
    </div>
  );
}
