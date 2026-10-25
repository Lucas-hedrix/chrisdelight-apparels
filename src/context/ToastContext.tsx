import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message?: string;
  tone?: 'success' | 'error';
}

const ToastContext = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);
export const useToast = () => useContext(ToastContext)!;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, tone: 'success', ...toast }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-card p-4 shadow-2xl shadow-black/50"
            >
              {t.tone === 'error' ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cream" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs text-muted">{t.message}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
