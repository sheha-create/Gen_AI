import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { formatRupees } from '../utils/money';
import { SerratedEdge } from '../components/SerratedEdge';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());

  // Update clock every 30 seconds for live "Last bill X min ago"
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Today date format: e.g. "Today, Thu 6 Nov"
  const todayDateFormatted = useMemo(() => {
    const d = new Date();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return `Today, ${dayName} ${dayNum} ${month}`;
  }, []);

  // Check saved draft
  const draft = useLiveQuery(() => db.drafts.toCollection().first());

  // Fetch today's saved bills
  const todayBills = useLiveQuery(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return db.bills
      .where('timestamp')
      .between(start.getTime(), end.getTime())
      .toArray();
  }, []);

  const activeBills = todayBills?.filter((b) => b.status === 'SAVED') ?? [];
  const todayTotalPaise = activeBills.reduce((sum, b) => sum + b.grandTotalPaise, 0);
  const todayBillCount = activeBills.length;

  // Last bill relative time
  const lastBillTimeFormatted = useMemo(() => {
    if (activeBills.length === 0) return 'No bills today';
    const latest = activeBills.reduce((prev, curr) =>
      curr.timestamp > prev.timestamp ? curr : prev
    );
    const diffMin = Math.max(0, Math.floor((now - latest.timestamp) / 60000));
    if (diffMin < 1) return 'Last bill just now';
    if (diffMin === 1) return 'Last bill 1 min ago';
    if (diffMin < 60) return `Last bill ${diffMin} min ago`;
    const hours = Math.floor(diffMin / 60);
    return `Last bill ${hours} hour${hours > 1 ? 's' : ''} ago`;
  }, [activeBills, now]);

  // Hourly sales distribution
  const hourlyBars = useMemo(() => {
    const currentHour = new Date().getHours();
    const startHour = Math.min(9, currentHour); // start at 9am or earlier
    const endHour = Math.min(23, currentHour + 1);

    const buckets: { hour: number; label: string; paise: number; isCurrent: boolean }[] = [];
    for (let h = startHour; h <= endHour; h++) {
      const displayLabel = h > 12 ? `${h - 12}` : h === 0 ? '12' : `${h}`;
      buckets.push({
        hour: h,
        label: displayLabel,
        paise: 0,
        isCurrent: h === currentHour,
      });
    }

    activeBills.forEach((b) => {
      const h = new Date(b.timestamp).getHours();
      const target = buckets.find((bucket) => bucket.hour === h);
      if (target) {
        target.paise += b.grandTotalPaise;
      }
    });

    const maxPaise = Math.max(1, ...buckets.map((b) => b.paise));
    return buckets.map((b) => ({
      ...b,
      heightPercent: Math.max(10, Math.round((b.paise / maxPaise) * 100)),
    }));
  }, [activeBills]);

  // Recent 5 bills
  const recentBills = useLiveQuery(() =>
    db.bills.orderBy('timestamp').reverse().limit(5).toArray()
  );

  const handleDiscardDraft = async () => {
    await db.drafts.clear();
  };

  const handleResumeDraft = () => {
    navigate('/billing');
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-10">
      {/* Draft Resume Alert */}
      {draft && draft.lines && draft.lines.length > 0 && (
        <div className="bg-[var(--tally-wash)] border border-[var(--tally)] rounded-[10px] p-3.5 flex items-center justify-between text-xs font-ui">
          <div>
            <p className="font-bold text-[var(--ink)]">
              Draft bill with {draft.lines.length} {draft.lines.length === 1 ? 'item' : 'items'}
            </p>
            <p className="text-[var(--ink-2)] text-[11px] mt-0.5">Left in progress</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDiscardDraft}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--well)] text-[var(--ink-2)] hover:text-[var(--stamp)] font-semibold transition"
            >
              Discard
            </button>
            <button
              onClick={handleResumeDraft}
              className="px-3 py-1.5 rounded-lg bg-[var(--ballpoint)] text-white font-bold transition"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* 5.2 Hero Section on Tally Highlighter Strip */}
      <div className="bg-[#FFFFFF] rounded-t-[10px] shadow-xs border-t border-l border-r border-[var(--line)] overflow-hidden">
        <div className="p-4 pb-3">
          <p className="text-xs font-semibold text-[var(--ink-2)] tracking-wide">
            {todayDateFormatted}
          </p>

          <div className="mt-1.5 py-2 px-3 bg-[var(--tally)] rounded-lg flex items-baseline justify-between shadow-xs">
            <span className="text-[32px] sm:text-[40px] font-black leading-none tracking-tight font-ui text-[#0F1A4A]">
              {formatRupees(todayTotalPaise)}
            </span>
            <span className="font-bold text-sm text-[#0F1A4A]/80 font-ui">
              {todayBillCount} {todayBillCount === 1 ? 'bill' : 'bills'}
            </span>
          </div>

          <p className="text-xs font-medium text-[var(--ink-2)] mt-2">
            {lastBillTimeFormatted}
          </p>
        </div>

        {/* Serrated Divider under Hero */}
        <SerratedEdge color="#FFFFFF" direction="down" />
      </div>

      {/* Sales by Hour Bars */}
      <div className="bg-[#FFFFFF] p-4 rounded-[10px] border border-[var(--line)] shadow-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[var(--ink-2)] uppercase tracking-wider">
            Sales by hour
          </span>
          <span className="text-[11px] text-[var(--ink-3)]">Tap bar to inspect</span>
        </div>

        <div className="flex items-end gap-1.5 h-20 pt-2 border-b border-[var(--line)] px-1">
          {hourlyBars.map((b, i) => (
            <div
              key={i}
              onClick={() => navigate(`/history?hour=${b.hour}`)}
              className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
              title={`${b.label}:00 - ${formatRupees(b.paise)}`}
            >
              <div
                className={`w-full rounded-t-sm transition-all group-hover:opacity-80 ${
                  b.paise > 0
                    ? 'bg-[var(--ballpoint)]'
                    : 'bg-[var(--well)]'
                }`}
                style={{ height: `${b.paise > 0 ? b.heightPercent : 8}%` }}
              />
              <span
                className={`text-[10px] mt-1 font-mono leading-none ${
                  b.isCurrent ? 'font-bold text-[var(--ballpoint)]' : 'text-[var(--ink-3)]'
                }`}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Action Button: 56px high, full width, ballpoint */}
      <button
        onClick={() => navigate('/billing')}
        className="w-full h-14 bg-[var(--ballpoint)] hover:opacity-95 active:scale-[0.99] text-white font-ui font-bold text-base rounded-[10px] flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Plus size={20} className="stroke-[3]" />
        <span>New bill</span>
      </button>

      {/* Recent Bills (Last 5) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[var(--ink-2)] uppercase tracking-wider">
            Recent bills
          </span>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-[var(--ballpoint)] font-semibold hover:underline"
          >
            All bills →
          </button>
        </div>

        {!recentBills || recentBills.length === 0 ? (
          <div className="bg-[#FFFFFF] p-6 rounded-[10px] border border-[var(--line)] text-center text-xs text-[var(--ink-3)]">
            No bills yet today. Start with New bill.
          </div>
        ) : (
          <div className="space-y-2">
            {recentBills.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/receipt/${b.id}`)}
                className="bg-[#FFFFFF] p-3.5 rounded-t-[10px] border border-b-0 border-[var(--line)] cursor-pointer hover:bg-[var(--well)]/30 active:scale-[0.99] transition"
              >
                <div className="flex justify-between items-baseline font-tape">
                  <div>
                    <span className="font-bold text-[var(--ink)]">#{b.billNumber}</span>
                    <span className="text-[11px] text-[var(--ink-3)] ml-2">
                      {new Date(b.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    {b.status === 'VOID' ? (
                      <span className="text-[11px] text-[var(--stamp)] font-bold">VOID</span>
                    ) : (
                      <span className="font-bold text-[var(--ink)]">
                        {formatRupees(b.grandTotalPaise)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-[var(--ink-3)] truncate pt-0.5 font-tape">
                  {b.items.map((i) => i.productName).join(', ')}
                </div>

                <SerratedEdge color="#FFFFFF" direction="down" className="-mb-3.5 mt-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
