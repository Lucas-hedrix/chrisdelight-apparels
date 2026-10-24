import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Currency } from '../lib/format';

interface UIValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const UIContext = createContext<UIValue | null>(null);
export const useUI = () => useContext(UIContext)!;

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>('NGN');
  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, currency, setCurrency }}>
      {children}
    </UIContext.Provider>
  );
}
