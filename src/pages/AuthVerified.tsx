import { motion } from 'motion/react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { account, isAppwriteConfigured } from '../lib/appwrite';

export default function AuthVerified() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const userId = searchParams.get('userId');
      const secret = searchParams.get('secret');

      if (!userId || !secret) {
        setStatus('error');
        setMessage('Invalid verification link. Please try again.');
        return;
      }

      if (!isAppwriteConfigured) {
        setStatus('success');
        setMessage('Email verified! (Demo mode)');
        return;
      }

      try {
        await account.updateVerification(userId, secret);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="auth-glow flex min-h-screen flex-col items-center justify-center px-4 py-10 text-cream">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-3xl border border-line bg-panel/95 backdrop-blur p-8 text-center"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-brand/10 mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
            <h1 className="font-display text-2xl tracking-wide">Verifying Email...</h1>
            <p className="mt-2 text-sm text-muted">Please wait while we confirm your email address.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-glow flex min-h-screen flex-col items-center justify-center px-4 py-10 text-cream">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-3xl border border-line bg-panel/95 backdrop-blur p-8 text-center"
        >
          <div className={`grid h-16 w-16 place-items-center rounded-full mx-auto mb-4 ${status === 'success' ? 'bg-success/10' : 'bg-error/10'}`}>
            {status === 'success' ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <XCircle className="h-8 w-8 text-error" />
            )}
          </div>
          <h1 className="font-display text-2xl tracking-wide">
            {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h1>
          <p className="mt-2 text-sm text-muted">{message}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-sm font-bold text-ink shadow-lg shadow-white/15 transition-colors hover:bg-brand-strong"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-6 py-3.5 text-sm font-semibold text-muted transition-colors hover:text-cream"
            >
              Back to Store
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}