import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ID } from 'appwrite';
import { account, isAppwriteConfigured } from '../lib/appwrite';
import { notifyWelcome } from '../lib/notifications';

interface User {
  $id: string;
  name?: string;
  email: string;
  emailVerification?: boolean;
}

interface AuthValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);
export const useAuth = () => useContext(AuthContext)!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAppwriteConfigured) {
      setReady(true);
      return;
    }
    account
      .get()
      .then((u) => setUser(u as unknown as User))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string) => {
    if (!isAppwriteConfigured) throw new Error("Appwrite isn't configured yet. Add your keys to .env and restart.");
    await account.createEmailPasswordSession(email, password);
    setUser((await account.get()) as unknown as User);
  };

  const register = async (name: string, email: string, password: string) => {
    if (!isAppwriteConfigured) throw new Error("Appwrite isn't configured yet. Add your keys to .env and restart.");
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    // Confirm-email via Appwrite Auth (Cloud default mailer — no SMTP provider needed).
    try {
      await account.createVerification(`${window.location.origin}/auth/verified`);
    } catch (err) {
      console.warn('Failed to send verification email:', err);
    }
    setUser((await account.get()) as unknown as User);
    void notifyWelcome();
  };

  const logout = async () => {
    if (!isAppwriteConfigured) return;
    await account.deleteSession('current');
    setUser(null);
  };

  const sendVerification = async () => {
    if (!isAppwriteConfigured || !user) return;
    try {
      await account.createVerification(`${window.location.origin}/auth/verified`);
    } catch (err) {
      console.warn('Failed to send verification email:', err);
      throw err;
    }
  };

  return <AuthContext.Provider value={{ user, ready, login, register, logout, sendVerification }}>{children}</AuthContext.Provider>;
}
