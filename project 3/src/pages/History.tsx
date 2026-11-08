import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { formatRupees } from '../utils/money';
import { SerratedEdge } from '../components/SerratedEdge';
import { Search, Calendar, TrendingUp, FileText, Ban, Filter, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [showAllDates, setShowAllDates] = useState(false);

  const bills = useLiveQuery(() => {
    if (showAllDates) {
      return db.bills.orderBy('timestamp').reverse().toArray();
    }
    if (dateFilter) {
      const start = new Date(dateFilter);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateFilter);
      end.setHours(23, 59, 59, 999);
      return db.bills
        .where('timestamp')
        .between(start.getTime(), end.getTime())
        .reverse()
        .toArray();
    }
    return db.bills.orderBy('timestamp').reverse().toArray();
  }, [dateFilter, showAllDates]);

  const filteredBills = useMemo(() => {
    if (!bills) return [];
    if (!searchQuery.trim()) return bills;
    const q = searchQuery.toLowerCase().trim();
    return bills.filter((b) => {
      const matchNumber = b.billNumber.toLowerCase().includes(q);
      const matchItem = b.items.some((i) => i.productName.toLowerCase().includes(q));
      return matchNumber || matchItem;
    });
  }, [bills, searchQuery]);

  const activeBills = filteredBills.filter((b) => b.status === 'SAVED');
  const voidBills = filteredBills.filter((b) => b.status === 'VOID');
  const periodTotal = activeBills.reduce((sum, b) => sum + b.grandTotalPaise, 0);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-10">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-[var(--ink)] tracking-tight font-ui">Bill History</h1>
        <p className="text-xs text-[var(--ink-3)] font-medium mt-0.5">Complete audit ledger of saved bills</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--paper)] rounded-[10px] p-4 border border-[var(--line)]">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="p-1 bg-[var(--ledger-wash)] text-[var(--ledger)] rounded-lg">
              <TrendingUp size={15} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-2)]">
              {showAllDates ? 'All-Time' : 'Day Total'}
            </span>
          </div>
          <p className="text-xl font-black text-[var(--ink)] font-tape mt-1">{formatRupees(periodTotal)}</p>
          <p className="text-[10px] text-[var(--ink-3)] mt-0.5 font-medium">{activeBills.length} active bills</p>
        </div>

        <div className="bg-[var(--paper)] rounded-[10px] p-4 border border-[var(--line)]">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="p-1 bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] rounded-lg">
              <FileText size={15} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-2)]">Bills</span>
          </div>
          <p className="text-xl font-black text-[var(--ballpoint)] font-tape mt-1">{filteredBills.length}</p>
          <p className="text-[10px] text-[var(--ink-3)] mt-0.5 font-medium">
            {voidBills.length > 0 ? `${voidBills.length} voided` : 'None voided'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            type="text"
            placeholder="Search by bill no. or product name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] pl-9 pr-8 bg-[var(--well)] border border-[var(--line)] rounded-[10px] text-xs font-semibold text-[var(--ink)] placeholder-[var(--ink-3)] focus:outline-none focus:border-[var(--ballpoint)] focus:ring-1 focus:ring-[var(--ballpoint)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date picker + All toggle */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
            <input
              type="date"
              disabled={showAllDates}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 h-11 bg-[var(--paper)] border border-[var(--line)] rounded-[10px] text-xs font-bold text-[var(--ink)] disabled:bg-[var(--well)] disabled:text-[var(--ink-3)] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowAllDates(!showAllDates)}
            className={`h-11 px-3.5 rounded-[10px] text-xs font-bold flex items-center gap-1.5 border transition ${
              showAllDates
                ? 'bg-[var(--ballpoint)] text-white border-[var(--ballpoint)]'
                : 'bg-[var(--paper)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-2)]'
            }`}
          >
            <Filter size={13} />
            <span>{showAllDates ? 'All Records' : 'Day View'}</span>
          </button>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-2">
        {filteredBills.length === 0 ? (
          <div className="bg-[var(--paper)] rounded-[10px] p-8 text-center border border-[var(--line)] space-y-2">
            <FileText size={36} className="mx-auto mb-2 opacity-30 text-[var(--ballpoint)]" />
            <p className="font-bold text-[var(--ink)] text-xs">No bills found</p>
            <p className="text-[11px] text-[var(--ink-3)]">
              {searchQuery
                ? `No bills match "${searchQuery}". Try a bill number or item name.`
                : `No bills on ${showAllDates ? 'record' : new Date(dateFilter).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`}
            </p>
          </div>
        ) : (
          filteredBills.map((bill) => (
            <div key={bill.id} className="relative">
              {/* Bill Slip Card */}
              <div
                onClick={() => navigate(`/receipt/${bill.id}`)}
                className={`bg-[var(--paper)] rounded-t-[10px] border-t border-l border-r px-4 py-3 cursor-pointer active:scale-[0.99] transition group ${
                  bill.status === 'VOID'
                    ? 'border-[var(--stamp-wash)]'
                    : 'border-[var(--line)] hover:border-[var(--ballpoint)]/50'
                }`}
              >
                {/* Left accent stripe */}
                <div
                  className={`absolute top-0 left-0 w-1 h-full rounded-tl-[10px] ${
                    bill.status === 'VOID' ? 'bg-[var(--stamp)]' : 'bg-[var(--ballpoint)]'
                  }`}
                />

                <div className="pl-3 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--ink)] text-xs font-tape">#{bill.billNumber}</span>
                      {bill.status === 'VOID' ? (
                        <span className="bg-[var(--stamp-wash)] text-[var(--stamp)] text-[9px] font-black px-1.5 py-0.5 rounded border border-[var(--stamp)]/30 flex items-center gap-0.5">
                          <Ban size={9} /> VOID
                        </span>
                      ) : (
                        <span className="bg-[var(--ledger-wash)] text-[var(--ledger)] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[var(--ledger)]/30 flex items-center gap-0.5">
                          <CheckCircle2 size={9} /> Saved
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--ink-3)] font-tape">
                      {new Date(bill.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {new Date(bill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    <p className="text-[11px] text-[var(--ink-2)] line-clamp-1 font-ui">
                      {bill.items.map((i) => `${i.productName} (${i.quantityDisplay})`).join(', ')}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1 ml-4">
                    <p className={`font-tape font-black text-sm ${bill.status === 'VOID' ? 'text-[var(--ink-3)] line-through' : 'text-[var(--ink)] group-hover:text-[var(--ballpoint)]'}`}>
                      {formatRupees(bill.grandTotalPaise)}
                    </p>
                    <div className="flex items-center gap-0.5 text-[10px] text-[var(--ballpoint)] font-bold">
                      <span>View</span>
                      <ChevronRight size={11} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Serrated bottom edge */}
              <SerratedEdge color="#FFFFFF" direction="down" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
