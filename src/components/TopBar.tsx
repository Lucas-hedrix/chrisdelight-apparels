import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Menu, Search, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useNotifications, type Notification } from '../context/NotificationContext';
import type { Currency } from '../lib/format';
import { fmtDateShort } from '../lib/format';

const CURRENCIES: Currency[] = ['NGN', 'USD', 'GBP', 'CAD'];

export default function TopBar() {
  const { user } = useAuth();
  const { setSidebarOpen, currency, setCurrency } = useUI();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } =
    useNotifications();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user?.name?.trim()?.split(/\s+/)[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/collections?q=${encodeURIComponent(term)}` : '/collections');
  };

  const handleNotifClick = (n: Notification) => {
    if (!n.read) void markAsRead(n.$id);
    setNotifOpen(false);
  };

  const toggleNotif = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) void fetchNotifications();
  };

  return (
    <header className="z-30 flex flex-wrap items-center gap-x-4 gap-y-3 px-4 pt-6 sm:px-6 lg:px-10">
      <button
        onClick={() => setSidebarOpen(true)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-cream lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-[28px]">
          Hi, {firstName ?? 'there'}!
        </h1>
        <p className="text-sm text-muted">Welcome back</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="hidden w-full max-w-sm items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-2.5 transition-colors focus-within:border-brand/50 md:flex"
      >
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search fabrics, tees, joggers..."
          className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-muted"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="h-10 cursor-pointer appearance-none rounded-xl border border-line bg-card px-3 text-xs font-bold uppercase tracking-wider text-muted outline-none transition-colors hover:text-cream"
          aria-label="Currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c} style={{ background: '#101010', color: '#f5f4f0' }}>
              {c === 'NGN' ? '₦ NGN' : c === 'USD' ? '$ USD' : c === 'GBP' ? '£ GBP' : 'CA$ CAD'}
            </option>
          ))}
        </select>

        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-muted transition-colors hover:text-cream"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand" />
            )}
          </button>

          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-line bg-card shadow-2xl shadow-black/50 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h3 className="font-bold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-line">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted">
                    {unreadCount === 0 && notifications.length === 0 ? 'No notifications yet' : 'All caught up!'}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.$id}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-card-2 ${
                        !n.read ? 'bg-brand/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted line-clamp-2">{n.message}</p>
                          <p className="mt-1 text-[11px] text-muted/70">{fmtDateShort(n.$createdAt)}</p>
                        </div>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        {user ? (
          <div
            className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-extrabold text-ink"
            title={user.name || user.email}
          >
            {(user.name || user.email || '?').trim().charAt(0).toUpperCase()}
          </div>
        ) : (
          <Link
            to="/auth"
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-muted transition-colors hover:border-brand/50 hover:text-cream"
            aria-label="Sign in"
            title="Sign in"
          >
            <UserRound className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
