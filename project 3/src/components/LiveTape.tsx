import React, { useState, useRef } from 'react';
import type { CartLine, BillTotals } from '../utils/calculations';
import type { ShopProfile } from '../db/database';
import { formatRupees } from '../utils/money';
import { Odometer } from './Odometer';
import { SerratedEdge } from './SerratedEdge';
import { Minus, Plus, Trash2, ChevronDown, Percent, IndianRupee } from 'lucide-react';

interface LiveTapeProps {
  cart: CartLine[];
  totals: BillTotals;
  shop: ShopProfile | undefined;
  billNumber: string;
  billDiscountType: 'AMOUNT' | 'PERCENT';
  billDiscountValue: number;
  onUpdateQuantity: (idx: number, qty: number) => void;
  onRemoveLine: (idx: number) => void;
  onUpdateLineDiscount?: (idx: number, rupees: string) => void;
  onSetBillDiscount: (type: 'AMOUNT' | 'PERCENT', value: number) => void;
  onTearSave: () => void;
  onOpenMathTrail: () => void;
  saving?: boolean;
}

export const LiveTape: React.FC<LiveTapeProps> = ({
  cart,
  totals,
  shop,
  billNumber,
  billDiscountType,
  billDiscountValue,
  onUpdateQuantity,
  onRemoveLine,
  onSetBillDiscount,
  onTearSave,
  onOpenMathTrail,
  saving = false,
}) => {
  const [showDiscountEditor, setShowDiscountEditor] = useState(false);
  const [discountInput, setDiscountInput] = useState(billDiscountValue > 0 ? (billDiscountType === 'PERCENT' ? billDiscountValue.toString() : (billDiscountValue / 100).toString()) : '');
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  // Touch / Drag to tear handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = Math.max(0, clientY - startYRef.current);
    setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY >= 72 && !saving && cart.length > 0) {
      onTearSave();
    }
    setDragY(0);
  };

  const handleApplyDiscount = () => {
    const val = parseFloat(discountInput);
    if (isNaN(val) || val <= 0) {
      onSetBillDiscount(billDiscountType, 0);
    } else {
      if (billDiscountType === 'PERCENT') {
        onSetBillDiscount('PERCENT', Math.min(100, val));
      } else {
        onSetBillDiscount('AMOUNT', Math.round(val * 100));
      }
    }
    setShowDiscountEditor(false);
  };

  const tearProgress = Math.min(1, dragY / 72);

  return (
    <div className="flex flex-col items-center w-full select-none pb-20">
      {/* Thermal Receipt Roll Body */}
      <div
        className="w-full max-w-[384px] bg-[#FFFFFF] text-[#0F1A4A] font-tape text-[13px] leading-[18px] transition-transform duration-150 relative"
        style={{
          boxShadow: '0 6px 0 -2px rgba(15,26,74,.10), 0 14px 18px -10px rgba(15,26,74,.25)',
          transform: isDragging ? `translateY(${dragY * 0.4}px)` : 'none',
        }}
      >
        {/* Paper Header Block */}
        <div className="p-4 pb-2 text-center border-b border-dashed border-[#9AA3C0]/60">
          <p className="font-bold text-[15px] uppercase tracking-wide">
            {shop?.shopName || 'SRI MURUGAN STORES'}
          </p>
          <p className="text-[11px] text-[#3A4470] mt-0.5">
            {shop?.address || '12 Bazaar St, Madurai'}
          </p>
          {shop?.phone && (
            <p className="text-[11px] text-[#3A4470]">Ph: {shop.phone}</p>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#5F678F] pt-2 mt-1 border-t border-dashed border-[#9AA3C0]/40">
            <span>BILL #{billNumber}</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Live Tape Item List */}
        <div className="p-4 py-2">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-[#5F678F]">
              <p className="text-xs">No items printed yet.</p>
              <p className="text-[11px] mt-1">Tap items in products to feed the tape.</p>
            </div>
          ) : (
            <ul className="divide-y divide-dashed divide-[#9AA3C0]/30 space-y-2">
              {cart.map((line, idx) => {
                const itemCalc = totals.items[idx];
                return (
                  <li key={idx} className="pt-2 first:pt-0 line-print-enter">
                    <div className="flex justify-between items-baseline font-semibold">
                      <span className="truncate pr-2">{line.productName}</span>
                      {line.taxCategory !== 'NONE' && (
                        <span className="text-[10px] text-[#1E7A4F] font-normal shrink-0">
                          {line.taxCategory.replace('GST', '')}%
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper & Amount Row */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 font-ui">
                        <button
                          type="button"
                          onClick={() => {
                            if (line.quantity <= 1) {
                              onRemoveLine(idx);
                            } else {
                              onUpdateQuantity(idx, Math.max(0.1, Math.round((line.quantity - 1) * 10) / 10));
                            }
                          }}
                          className="w-7 h-7 bg-[#E6EAE8] text-[#0F1A4A] rounded-lg flex items-center justify-center font-bold active:bg-[#C9D0CC] transition"
                          aria-label="Decrease quantity"
                        >
                          {line.quantity <= 1 ? <Trash2 size={13} className="text-[#B0245A]" /> : <Minus size={13} />}
                        </button>

                        <span className="font-tape font-bold text-xs min-w-[32px] text-center">
                          {line.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(idx, Math.round((line.quantity + 1) * 10) / 10)}
                          className="w-7 h-7 bg-[#E6EAE8] text-[#0F1A4A] rounded-lg flex items-center justify-center font-bold active:bg-[#C9D0CC] transition"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>

                        <span className="font-tape text-[11px] text-[#5F678F] ml-1">
                          × {formatRupees(line.unitPricePaise)}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-right">
                        {formatRupees(itemCalc?.lineTotalPaise ?? 0)}
                      </div>
                    </div>

                    {line.lineDiscountPaise > 0 && (
                      <div className="text-[11px] text-[#B0245A] text-right pt-0.5">
                        Disc: -{formatRupees(line.lineDiscountPaise)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Totals Section */}
        {cart.length > 0 && (
          <div className="p-4 pt-1 border-t border-dashed border-[#9AA3C0]/60 space-y-1">
            <div
              onClick={onOpenMathTrail}
              className="flex justify-between items-baseline cursor-pointer hover:bg-[#E6EAE8]/30 px-1 py-0.5 rounded transition"
            >
              <span>Subtotal</span>
              <span className="font-semibold">{formatRupees(totals.subtotalPaise)}</span>
            </div>

            {/* Bill Discount Row */}
            <div className="flex justify-between items-center py-0.5">
              <button
                type="button"
                onClick={() => setShowDiscountEditor(!showDiscountEditor)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#2740C8] hover:underline"
              >
                <span>Bill discount</span>
                <span className="bg-[#E3E8FB] px-1 rounded text-[10px] flex items-center">
                  {billDiscountType === 'PERCENT' ? `${billDiscountValue}%` : `₹${billDiscountValue / 100}`}
                  <ChevronDown size={10} className="ml-0.5" />
                </span>
              </button>
              <span className="text-[#B0245A] font-semibold">
                -{formatRupees(totals.billDiscountPaise)}
              </span>
            </div>

            {/* Inline Bill Discount Quick Editor */}
            {showDiscountEditor && (
              <div className="bg-[#F4F6F5] p-2 rounded-lg border border-[#C9D0CC] my-1 font-ui space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F1A4A]">
                  <span>Edit Bill Discount</span>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => onSetBillDiscount('PERCENT', 0)}
                      className="px-1.5 py-0.5 rounded bg-[#E6EAE8] text-[#3A4470]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex bg-[#E6EAE8] rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => onSetBillDiscount('PERCENT', billDiscountValue)}
                      className={`px-2 py-0.5 text-xs rounded font-bold ${
                        billDiscountType === 'PERCENT' ? 'bg-[#2740C8] text-white' : 'text-[#3A4470]'
                      }`}
                    >
                      <Percent size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetBillDiscount('AMOUNT', billDiscountValue)}
                      className={`px-2 py-0.5 text-xs rounded font-bold ${
                        billDiscountType === 'AMOUNT' ? 'bg-[#2740C8] text-white' : 'text-[#3A4470]'
                      }`}
                    >
                      <IndianRupee size={11} />
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-white border border-[#C9D0CC] rounded-lg px-2 py-1 text-xs font-bold text-right"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="bg-[#2740C8] text-white text-xs font-bold px-3 py-1 rounded-lg"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}

            <div
              onClick={onOpenMathTrail}
              className="flex justify-between items-baseline cursor-pointer hover:bg-[#E6EAE8]/30 px-1 py-0.5 rounded transition text-[#3A4470]"
            >
              <span>Taxable</span>
              <span>{formatRupees(totals.taxablePaise)}</span>
            </div>

            <div
              onClick={onOpenMathTrail}
              className="flex justify-between items-baseline cursor-pointer hover:bg-[#E6EAE8]/30 px-1 py-0.5 rounded transition text-[#3A4470]"
            >
              <span>Tax (GST)</span>
              <span>+{formatRupees(totals.taxPaise)}</span>
            </div>

            {/* Double Rule */}
            <div className="pt-2 pb-1 border-t-2 border-b-2 border-double border-[#0F1A4A] flex justify-between items-baseline font-bold text-[16px] leading-[22px]">
              <span className="uppercase tracking-wider">TOTAL</span>
              <Odometer amountPaise={totals.grandTotalPaise} className="text-xl font-bold" />
            </div>

            <p
              onClick={onOpenMathTrail}
              className="text-[10px] text-[#5F678F] text-center pt-1 underline cursor-pointer hover:text-[#2740C8] font-ui"
            >
              Tap to inspect full calculation trail
            </p>
          </div>
        )}

        {/* Serrated Bottom Edge with Tear Handle */}
        <div className="relative">
          <SerratedEdge color="#FFFFFF" direction="down" />

          {/* Grab Handle for Pull to Tear */}
          <div
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full py-2.5 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-center"
            title="Drag down to tear and save bill"
          >
            <div className="w-12 h-1 bg-[#C9D0CC] rounded-full mb-1" />
            <span
              className={`text-[11px] font-ui font-semibold transition-colors ${
                dragY >= 72 ? 'text-[#1E7A4F] font-bold' : 'text-[#5F678F]'
              }`}
            >
              {dragY >= 72
                ? '✓ Release to tear and save'
                : dragY > 20
                ? 'Keep pulling to tear...'
                : '⌄ Pull the tape down to tear'}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Primary Save Action */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-gradient-to-t from-[var(--desk)] via-[var(--desk)] to-transparent z-40">
          <button
            type="button"
            onClick={onTearSave}
            disabled={saving}
            className="w-full h-14 bg-[var(--ballpoint)] hover:opacity-95 active:scale-[0.99] text-white font-ui font-bold text-base rounded-[10px] flex items-center justify-between px-5 shadow-lg disabled:opacity-50 transition"
          >
            <span>{saving ? 'Saving bill…' : 'Save bill'}</span>
            <span className="font-tape font-black text-lg">
              {formatRupees(totals.grandTotalPaise)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
