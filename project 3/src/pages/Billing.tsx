import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '../db/database';
import { type CartLine, calculateBill } from '../utils/calculations';
import { formatRupees, toPaise } from '../utils/money';
import { getNextBillNumber } from '../utils/billNumber';
import { LiveTape } from '../components/LiveTape';
import { MathTrailSheet } from '../components/MathTrailSheet';
import { SerratedEdge } from '../components/SerratedEdge';
import { Search, ArrowLeft, X, Layers, Plus } from 'lucide-react';

export default function Billing() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<'pick' | 'review'>('pick');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [billDiscountType, setBillDiscountType] = useState<'AMOUNT' | 'PERCENT'>('PERCENT');
  const [billDiscountValue, setBillDiscountValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [showMathTrail, setShowMathTrail] = useState(false);
  const [billNumber, setBillNumber] = useState<string>('0129');
  const [lastPrintedLine, setLastPrintedLine] = useState<string>('');

  const shop = useLiveQuery(() => db.shopProfile.toCollection().first());
  const appSettings = useLiveQuery(() => db.appSettings.toCollection().first());

  // Set upcoming bill number preview
  useEffect(() => {
    if (appSettings) {
      const num = appSettings.nextBillNumber || 1;
      setBillNumber(num.toString().padStart(4, '0'));
    }
  }, [appSettings]);

  // Load existing draft on initial mount
  useEffect(() => {
    db.drafts.toCollection().first().then((draft) => {
      if (draft && draft.lines && draft.lines.length > 0) {
        setCart(draft.lines);
        setBillDiscountType(draft.billDiscountType || 'PERCENT');
        setBillDiscountValue(draft.billDiscountValue || 0);
        const last = draft.lines[draft.lines.length - 1];
        setLastPrintedLine(`${last.productName}  ${last.quantity} × ${formatRupees(last.unitPricePaise)}`);
      }
    });
  }, []);

  // Autosave draft (debounced 300ms)
  const saveDraftTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    saveDraftTimerRef.current = window.setTimeout(async () => {
      await db.drafts.clear();
      if (cart.length > 0) {
        await db.drafts.add({
          lines: cart,
          billDiscountType,
          billDiscountValue,
          updatedAt: Date.now(),
        });
      }
    }, 300);
    return () => {
      if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    };
  }, [cart, billDiscountType, billDiscountValue]);

  // Fetch active products
  const products = useLiveQuery(async () => {
    const all = await db.products.toArray();
    return all.filter((p) => p.active !== false);
  }, []);

  // Frequent products chips (first 5)
  const frequentProducts = useMemo(() => {
    return products?.slice(0, 5) ?? [];
  }, [products]);

  // In-memory instant search (under 16ms)
  const searchResults = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.findIndex((l) => l.productId === product.id!);
      let updated: CartLine[];
      if (existing >= 0) {
        updated = [...prev];
        const newQty = Math.round((updated[existing].quantity + 1) * 100) / 100;
        updated[existing] = { ...updated[existing], quantity: newQty };
      } else {
        updated = [
          ...prev,
          {
            productId: product.id!,
            productName: product.name,
            productSku: product.sku,
            unit: product.unit,
            unitPricePaise: product.unitPricePaise,
            taxCategory: product.taxCategory,
            quantity: 1,
            lineDiscountPaise: 0,
          },
        ];
      }
      return updated;
    });
    setLastPrintedLine(`${product.name}  1 × ${formatRupees(product.unitPricePaise)}`);
  }, []);

  const updateQuantity = useCallback((idx: number, qty: number) => {
    setCart((prev) => {
      if (idx >= prev.length) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: qty };
      return updated;
    });
  }, []);

  const removeLine = useCallback((idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const totals = useMemo(() => {
    return calculateBill(cart, billDiscountType, billDiscountValue);
  }, [cart, billDiscountType, billDiscountValue]);

  // Tear / Save Bill
  const handleSaveBill = async () => {
    if (cart.length === 0 || saving) return;
    setSaving(true);
    try {
      const generatedBillNum = await getNextBillNumber();
      const currentShop = await db.shopProfile.toCollection().first();

      const newId = await db.bills.add({
        billNumber: generatedBillNum,
        timestamp: Date.now(),
        status: 'SAVED',
        items: totals.items,
        subtotalPaise: totals.subtotalPaise,
        billDiscountPaise: totals.billDiscountPaise,
        billDiscountType,
        billDiscountValue,
        taxablePaise: totals.taxablePaise,
        taxPaise: totals.taxPaise,
        grandTotalPaise: totals.grandTotalPaise,
        paymentNote: 'Not noted',
        shopSnapshot: {
          shopName: currentShop?.shopName || 'Sri Murugan Stores',
          address: currentShop?.address || '12 Bazaar St, Madurai',
          phone: currentShop?.phone || '',
          upiId: currentShop?.upiId || 'demo-shop@upi',
          receiptFooter: currentShop?.receiptFooter || 'Thank you. Visit again.',
        },
      });

      // Clear draft after successful write
      await db.drafts.clear();
      navigate(`/receipt/${newId}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (window.confirm('Discard this draft bill?')) {
      await db.drafts.clear();
      navigate('/');
    }
  };

  const getItemQtyInCart = (productId: number) => {
    const item = cart.find((l) => l.productId === productId);
    return item ? item.quantity : 0;
  };

  // ----------------------------------------------------
  // REVIEW MODE: Show Live Tape
  // ----------------------------------------------------
  if (mode === 'review') {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--desk)] max-w-lg mx-auto">
        {/* Review Mode Top Bar */}
        <div className="h-14 bg-[var(--desk)] border-b border-[var(--line)] px-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => setMode('pick')}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--ballpoint)] hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Back to products</span>
          </button>
          <span className="text-xs font-tape text-[var(--ink-2)]">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Live Tape Body */}
        <div className="p-4 flex-1">
          <LiveTape
            cart={cart}
            totals={totals}
            shop={shop}
            billNumber={billNumber}
            billDiscountType={billDiscountType}
            billDiscountValue={billDiscountValue}
            onUpdateQuantity={updateQuantity}
            onRemoveLine={removeLine}
            onSetBillDiscount={(type, val) => {
              setBillDiscountType(type);
              setBillDiscountValue(val);
            }}
            onTearSave={handleSaveBill}
            onOpenMathTrail={() => setShowMathTrail(true)}
            saving={saving}
          />
        </div>

        {/* Math Trail Sheet */}
        <MathTrailSheet
          totals={totals}
          isOpen={showMathTrail}
          onClose={() => setShowMathTrail(false)}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // 5.3 PICK MODE: Product Picker & Tape Peek
  // ----------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-[var(--desk)] max-w-lg mx-auto relative select-none">
      {/* 5.3 Top Bar: ← New bill #0129  | Discard */}
      <div className="h-14 bg-[var(--desk)] border-b border-[var(--line)] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-1 -ml-1 text-[var(--ink-2)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-base text-[var(--ink)]">
            New bill <span className="font-tape font-semibold text-sm text-[var(--ink-2)]">#{billNumber}</span>
          </span>
        </div>
        {cart.length > 0 && (
          <button
            onClick={handleDiscard}
            className="text-xs font-semibold text-[var(--stamp)] hover:underline"
          >
            Discard
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto pb-28">
        {/* 6.4 Search field (52px high, well background, autofocus) */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            type="text"
            autoFocus
            placeholder="Search name or SKU"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] pl-10 pr-9 bg-[var(--well)] border border-[var(--line)] rounded-[10px] text-sm font-ui text-[var(--ink)] placeholder-[var(--ink-3)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-3)]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Frequent Chips */}
        {frequentProducts.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-semibold text-[var(--ink-2)] shrink-0 mr-1">
              Frequent:
            </span>
            {frequentProducts.map((p) => {
              const qty = getItemQtyInCart(p.id!);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`h-9 px-3 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                    qty > 0
                      ? 'bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] border border-[var(--ballpoint)]'
                      : 'bg-[var(--well)] text-[var(--ink)] hover:bg-[#C9D0CC]'
                  }`}
                >
                  <span>{p.name.split(' ')[0]}</span>
                  {qty > 0 && <span className="font-bold text-[10px]">({qty})</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Results List (64px high rows, whole row taps to add) */}
        <div className="space-y-1.5 pt-1">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--ink-3)] bg-[#FFFFFF] rounded-[10px] border border-[var(--line)]">
              No products found matching "{searchQuery}".
            </div>
          ) : (
            searchResults.map((p) => {
              const qty = getItemQtyInCart(p.id!);
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`h-16 px-4 bg-[#FFFFFF] rounded-[10px] border border-[var(--line)] flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${
                    qty > 0 ? 'border-[var(--ballpoint)] bg-[var(--ballpoint-wash)]/20' : 'hover:border-[#9AA3C0]'
                  }`}
                >
                  <div className="truncate pr-3">
                    <p className="font-ui font-semibold text-sm text-[var(--ink)] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[var(--ink-2)] font-tape mt-0.5">
                      {p.sku ? `${p.sku} • ` : ''}
                      {formatRupees(p.unitPricePaise)} / {p.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {qty > 0 && (
                      <span className="h-6 px-2 rounded-full bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] text-xs font-bold font-tape flex items-center justify-center border border-[var(--ballpoint)]">
                        {qty}
                      </span>
                    )}
                    <span className="font-tape font-bold text-sm text-[var(--ink)]">
                      {formatRupees(p.unitPricePaise)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5.3 Bottom Tape Peek (88px high, tap or drag up to review) */}
      <div
        onClick={() => setMode('review')}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#FFFFFF] text-[#0F1A4A] cursor-pointer shadow-lg z-40 transition-transform active:opacity-95"
        style={{
          boxShadow: '0 -4px 12px rgba(15,26,74,.15)',
        }}
      >
        <div className="p-3.5 pb-2 font-tape text-xs">
          <div className="flex justify-between items-baseline font-bold text-sm">
            <span className="flex items-center gap-1.5">
              <span>═ {cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
              <span className="text-[10px] font-ui font-normal text-[var(--ink-3)]">
                (tap to review tape)
              </span>
            </span>
            <span className="text-base text-[var(--ink)]">{formatRupees(totals.grandTotalPaise)}</span>
          </div>

          <div className="text-[11px] text-[#3A4470] truncate mt-1">
            {lastPrintedLine ? `↳ ${lastPrintedLine}` : 'Tape ready for products'}
          </div>
        </div>

        {/* Serrated Edge on Peek Bottom */}
        <SerratedEdge color="#FFFFFF" direction="down" />
      </div>
    </div>
  );
}
