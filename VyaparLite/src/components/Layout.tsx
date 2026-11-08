import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Home, FileText, History, Package, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/billing', icon: FileText, label: 'Bill', exact: false },
  { to: '/history', icon: History, label: 'History', exact: false },
  { to: '/catalogue', icon: Package, label: 'Products', exact: false },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isBilling = location.pathname.startsWith('/billing');

  const shop = useLiveQuery(() => db.shopProfile.toCollection().first());
  const billCount = useLiveQuery(() => db.bills.count());
  const lastBill = useLiveQuery(() => db.bills.orderBy('timestamp').reverse().first());
  const appSettings = useLiveQuery(() => db.appSettings.toCollection().first());

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveTimeStr, setSaveTimeStr] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (lastBill) {
      const d = new Date(lastBill.timestamp);
      const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
      setSaveTimeStr(`Saved ${time}`);
    } else {
      setSaveTimeStr('Ready');
    }
  }, [lastBill]);

  const isBackupOverdue = (billCount ?? 0) >= 50 && !appSettings?.lastBackupDate;

  const handleStatusPillClick = () => {
    if (isBackupOverdue) {
      navigate('/settings');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[var(--desk)] text-[var(--ink)] shadow-2xl relative overflow-hidden font-ui">
      {/* Top Bar (56px) */}
      <header className="h-14 bg-[var(--desk)] border-b border-[var(--line)] px-4 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="font-bold text-base text-[var(--ink)] truncate block">
            {shop?.shopName || 'Sri Murugan Stores'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Pill */}
          <div
            onClick={handleStatusPillClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition select-none ${
              isBackupOverdue
                ? 'bg-[var(--tally-wash)] text-[#8c6d00] border border-[var(--tally)]'
                : !isOnline
                ? 'bg-[var(--ledger-wash)] text-[var(--ledger)]'
                : 'bg-[var(--well)] text-[var(--ink-2)]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0"
              style={{
                backgroundColor: isBackupOverdue
                  ? 'var(--tally)'
                  : 'var(--ledger)',
              }}
            />
            <span className="truncate max-w-[140px]">
              {isBackupOverdue
                ? 'Back up your data'
                : !isOnline
                ? 'Offline. Everything works'
                : saveTimeStr}
            </span>
          </div>

          {/* Settings shortcut */}
          <button
            onClick={() => navigate('/settings')}
            className={`p-1.5 rounded-full transition ${
              location.pathname === '/settings'
                ? 'text-[var(--ballpoint)] bg-[var(--ballpoint-wash)]'
                : 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--well)]'
            }`}
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Primary Scrollable Screen Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation (hides during Billing) */}
      {!isBilling && (
        <nav
          className="h-16 bg-[var(--desk)] border-t border-[var(--line)] flex justify-around items-stretch shrink-0 z-30 pb-[env(safe-area-inset-bottom)]"
          aria-label="Main navigation"
        >
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center relative transition-colors ${
                  isActive ? 'text-[var(--ballpoint)] font-semibold' : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* 3px indicator bar above the active icon */}
                  {isActive && (
                    <span className="absolute top-0 left-4 right-4 h-[3px] bg-[var(--ballpoint)] rounded-b-full" />
                  )}
                  <Icon
                    size={22}
                    className={`transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
                  />
                  <span className="text-xs mt-1 leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
