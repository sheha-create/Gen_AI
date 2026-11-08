import React from 'react';
import type { BillTotals } from '../utils/calculations';
import { formatRupees } from '../utils/money';
import { X, HelpCircle } from 'lucide-react';

interface MathTrailSheetProps {
  totals: BillTotals;
  isOpen: boolean;
  onClose: () => void;
}

export const MathTrailSheet: React.FC<MathTrailSheetProps> = ({
  totals,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--desk)] text-[var(--ink)] max-w-lg mx-auto w-full rounded-t-[20px] p-5 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-[var(--line)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--ballpoint-wash)] text-[var(--ballpoint)]">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Calculation Trail</h2>
              <p className="text-xs text-[var(--ink-2)]">Exact step-by-step arithmetic engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--ink-2)] hover:text-[var(--ink)] rounded-xl hover:bg-[var(--well)] transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step-by-Step Breakdown */}
        <div className="py-4 space-y-4 text-xs font-tape select-text">
          {/* Step 1: Line Subtotals & Line Discounts */}
          <div className="bg-[var(--paper)] p-3.5 rounded-xl border border-[var(--line)] space-y-2">
            <p className="font-ui font-bold text-xs text-[var(--ink-2)] uppercase tracking-wider">
              1. Line Subtotals & Item Discounts
            </p>
            <div className="space-y-1.5 pt-1">
              {totals.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline border-b border-[var(--well)] pb-1">
                  <div>
                    <span className="font-semibold">{item.productName}</span>
                    <span className="text-[var(--ink-3)] ml-1">
                      ({item.quantityDisplay} × {formatRupees(item.unitPricePaise)})
                    </span>
                    {item.lineDiscountPaise > 0 && (
                      <span className="text-[var(--stamp)] ml-1">
                        [-{formatRupees(item.lineDiscountPaise)}]
                      </span>
                    )}
                  </div>
                  <span className="font-bold">{formatRupees(item.lineDiscountedPaise)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 font-bold text-[var(--ink)]">
                <span>Gross Subtotal:</span>
                <span>{formatRupees(totals.subtotalPaise)}</span>
              </div>
              {totals.lineDiscountTotalPaise > 0 && (
                <div className="flex justify-between text-[var(--stamp)]">
                  <span>Total Line Discounts:</span>
                  <span>-{formatRupees(totals.lineDiscountTotalPaise)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Bill-Level Discount Allocation */}
          {totals.billDiscountPaise > 0 && (
            <div className="bg-[var(--paper)] p-3.5 rounded-xl border border-[var(--line)] space-y-2">
              <p className="font-ui font-bold text-xs text-[var(--ink-2)] uppercase tracking-wider">
                2. Bill Discount Allocation (Proportional)
              </p>
              <p className="text-[var(--ink-2)] font-ui text-[11px]">
                Total bill discount of {formatRupees(totals.billDiscountPaise)} allocated across lines in proportion to each line's discounted base.
              </p>
              <div className="space-y-1 pt-1">
                {totals.items.map((item, idx) => {
                  const share = item.lineDiscountedPaise - (item.lineTotalPaise - item.lineTaxPaise);
                  return (
                    <div key={idx} className="flex justify-between text-[var(--ink-2)]">
                      <span>{item.productName} share:</span>
                      <span>-{formatRupees(share)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Taxable Base & GST Computation */}
          <div className="bg-[var(--paper)] p-3.5 rounded-xl border border-[var(--line)] space-y-2">
            <p className="font-ui font-bold text-xs text-[var(--ink-2)] uppercase tracking-wider">
              3. Taxable Base & Line GST
            </p>
            <div className="space-y-1.5 pt-1">
              {totals.items.map((item, idx) => {
                const taxableLine = item.lineTotalPaise - item.lineTaxPaise;
                return (
                  <div key={idx} className="flex justify-between items-baseline border-b border-[var(--well)] pb-1">
                    <div>
                      <span>{item.productName}</span>
                      <span className="text-[var(--ledger)] ml-1 font-medium">
                        [{item.taxCategory === 'NONE' ? '0%' : item.taxCategory.replace('GST', '') + '%'}]
                      </span>
                    </div>
                    <div className="text-right">
                      <div>Base: {formatRupees(taxableLine)}</div>
                      <div className="text-[var(--ledger)]">GST: +{formatRupees(item.lineTaxPaise)}</div>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between pt-1 text-[var(--ink-2)]">
                <span>Net Taxable Base:</span>
                <span>{formatRupees(totals.taxablePaise)}</span>
              </div>
              <div className="flex justify-between text-[var(--ledger)] font-bold">
                <span>Summed Line GST:</span>
                <span>+{formatRupees(totals.taxPaise)}</span>
              </div>
            </div>
          </div>

          {/* Step 4: Grand Total */}
          <div className="bg-[var(--tally-wash)] p-3.5 rounded-xl border border-[var(--tally)] flex justify-between items-center text-sm">
            <span className="font-ui font-bold text-[var(--ink)]">GRAND PAYABLE TOTAL</span>
            <span className="font-black text-lg text-[var(--ink)]">
              {formatRupees(totals.grandTotalPaise)}
            </span>
          </div>

          <p className="text-[11px] font-ui text-[var(--ink-3)] text-center leading-relaxed">
            Each line's tax is rounded to the nearest paisa, then added. No floating-point money is used anywhere.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[var(--ballpoint)] text-white font-ui font-bold py-3.5 rounded-[10px] text-sm hover:opacity-95 transition"
        >
          Close Calculation Trail
        </button>
      </div>
    </div>
  );
};
