import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ID } from 'appwrite';
import {
  Bitcoin,
  CheckCircle2,
  Copy,
  CreditCard,
  FileUp,
  Hourglass,
  Loader2,
  Lock,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import { databases, storage, appwriteConfig, isAppwriteConfigured } from '../lib/appwrite';
import {
  CRYPTO_WALLETS,
  evidencePermissions,
  isPaystackConfigured,
  loadPaystack,
  orderPermissions,
  paystackPublicKey,
} from '../lib/payments';
import { fmt } from '../lib/format';
import { friendlyError, logError } from '../lib/errors';
import { createOrderNotification } from '../lib/notifications';

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

const inputCls =
  'w-full rounded-xl border border-line bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-brand/50 placeholder:text-muted';

function MethodCard({
  icon: Icon,
  title,
  subtitle,
  selected,
  onClick,
}: {
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
        selected
          ? 'border-brand bg-brand/10 shadow-lg shadow-white/10'
          : 'border-line bg-card hover:border-brand/40'
      }`}
    >
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
          selected ? 'bg-brand text-ink' : 'bg-card-2 text-muted'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{subtitle}</p>
      </div>
    </button>
  );
}

function SuccessView({ result, onDone }: { result: { method: string; id: string }; onDone: () => void }) {
  const crypto = result.method === 'crypto';
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`grid h-20 w-20 place-items-center rounded-full ${
          crypto ? 'bg-brand/10 text-cream' : 'bg-brand/15 text-brand'
        }`}
      >
        {crypto ? <Hourglass className="h-10 w-10" /> : <CheckCircle2 className="h-10 w-10" />}
      </motion.div>
      <h2 className="font-display text-3xl tracking-wide">
        {crypto ? 'SUBMITTED FOR APPROVAL' : 'PAYMENT CONFIRMED'}
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        Order <span className="font-bold text-cream">{result.id}</span> is in.{' '}
        {crypto
          ? "We'll verify your transfer against the evidence you uploaded — usually within a few hours — and confirm your order."
          : "We'll reach out with shipping and pickup details."}
      </p>
      <button
        onClick={onDone}
        className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
      >
        Keep Shopping
      </button>
    </div>
  );
}

function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-card-2 text-muted">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h3 className="font-bold">Your cart is empty</h3>
      <p className="text-sm text-muted">Add something first — then come back to pay.</p>
      <button
        onClick={onBrowse}
        className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
      >
        Browse Store
      </button>
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
}: {
  items: ReturnType<typeof useCart>['items'];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const { currency } = useUI();
  return (
    <aside className="h-fit rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-6">
      <h2 className="font-display text-xl tracking-wide">ORDER SUMMARY</h2>
      <div className="mt-4 space-y-3">
        {items.map((i) => (
          <div key={i.key} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{i.name}</p>
              <p className="text-xs text-muted">
                Size {i.size} · ×{i.qty}
              </p>
            </div>
            <span className="shrink-0 font-semibold">{fmt(i.price * i.qty, currency)}</span>
          </div>
        ))}
      </div>
      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Sub Total</dt>
          <dd className="font-bold">{fmt(subtotal, currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="font-bold">
            {shipping === 0 ? <span className="text-cream">FREE</span> : fmt(shipping, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <dt className="font-display text-lg tracking-wide">TOTAL</dt>
          <dd className="font-display text-2xl">{fmt(total, currency)}</dd>
        </div>
      </dl>
    </aside>
  );
}

export default function Checkout() {
  const { items, subtotal, shipping, total, clear } = useCart();
  const { user, ready } = useAuth();
  const { push } = useToast();
  const { currency } = useUI();
  const navigate = useNavigate();

  const [method, setMethod] = useState<'paystack' | 'crypto' | null>(null);
  const [coin, setCoin] = useState('SOL');
  const [txHash, setTxHash] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState<{ method: string; id: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (result) return <SuccessView result={result} onDone={() => navigate('/')} />;
  if (items.length === 0) return <EmptyCart onBrowse={() => navigate('/')} />;

  const live =
    isAppwriteConfigured && Boolean(appwriteConfig.databaseId) && Boolean(appwriteConfig.ordersCollectionId);
  const wallet = CRYPTO_WALLETS.find((w) => w.coin === coin) ?? CRYPTO_WALLETS[0];

  async function createOrder(extra: Record<string, string>) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      ID.unique(),
      {
        userId: user!.$id,
        userEmail: user!.email,
        userName: user!.name || '',
        items: JSON.stringify(
          items.map(({ productId, name, size, qty, price }) => ({
            productId,
            name,
            size,
            qty,
            price,
          }))
        ),
        subtotal,
        shipping,
        total,
        status: extra.status,
        method: extra.method,
        paymentRef: extra.paymentRef ?? '',
        coin: extra.coin ?? '',
        txHash: extra.txHash ?? '',
        evidenceFileId: extra.evidenceFileId ?? '',
      },
      orderPermissions(user!.$id)
    );
    return doc.$id;
  }

  async function handlePaystack() {
    if (!isPaystackConfigured) {
      push({
        title: "Paystack isn't set up yet",
        message: 'Add VITE_PAYSTACK_PUBLIC_KEY to .env and restart the dev server.',
        tone: 'error',
      });
      return;
    }
    setPlacing(true);
    try {
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: user!.email,
        amount: Math.round(total * 100),
        currency: 'NGN',
        ref: `CNX-${Date.now()}`,
        metadata: { userId: user!.$id },
        callback: (t: { reference: string }) => {
          void finalizePaystack(t.reference);
        },
        onClose: () => setPlacing(false),
      });
      handler.openIframe();
    } catch (err) {
      push({
        title: "Couldn't open Paystack",
        message: friendlyError(err, "Couldn't start the payment. Check your connection and try again."),
        tone: 'error',
      });
      setPlacing(false);
    }
  }

  async function finalizePaystack(reference: string) {
    try {
      const id = live
        ? await createOrder({ status: 'paid', method: 'paystack', paymentRef: reference })
        : `CNX-${Date.now().toString().slice(-8)}`;
      if (live) {
        await createOrderNotification(user!.$id, id, 'paystack', 'paid', total);
      }
      setResult({ method: 'paystack', id });
      clear();
    } catch (err) {
      logError(err);
      push({
        title: 'Payment received but order failed to save',
        message: `Contact support with reference ${reference}. We'll confirm the payment and complete your order.`,
        tone: 'error',
      });
    } finally {
      setPlacing(false);
    }
  }

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = wallet.address;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    push({ title: 'Copied', message: `${wallet.name} address copied.`, tone: 'success' });
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    if (picked.size > MAX_EVIDENCE_BYTES) {
      push({
        title: 'File too large',
        message: 'Evidence must be under 10MB.',
        tone: 'error',
      });
      return;
    }
    setFile(picked);
  }

  async function handleCryptoSubmit() {
    if (!file) {
      push({
        title: 'Evidence required',
        message: 'Upload a screenshot or PDF of your transfer first.',
        tone: 'error',
      });
      return;
    }
    if (live && !appwriteConfig.evidenceBucketId) {
      push({
        title: 'Evidence storage isn\u2019t configured',
        message: 'Add VITE_APPWRITE_EVIDENCE_BUCKET_ID to .env and restart.',
        tone: 'error',
      });
      return;
    }
    setPlacing(true);
    try {
      if (live) {
        const uploaded = await storage.createFile(
          appwriteConfig.evidenceBucketId,
          ID.unique(),
          file,
          evidencePermissions(user!.$id)
        );
        const id = await createOrder({
          status: 'pending_approval',
          method: 'crypto',
          coin,
          txHash: txHash.trim(),
          evidenceFileId: uploaded.$id,
        });
        await createOrderNotification(user!.$id, id, 'crypto', 'pending_approval', total);
        setResult({ method: 'crypto', id });
      } else {
        setResult({ method: 'crypto', id: `CNX-${Date.now().toString().slice(-8)}` });
      }
      clear();
    } catch (err) {
      push({
        title: "Couldn't submit order",
        message: friendlyError(err, "We couldn't submit your order. Please try again."),
        tone: 'error',
      });
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-wide">CHECKOUT</h1>
        <p className="mt-1 text-sm text-muted">Pick how you want to pay — Paystack or crypto.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MethodCard
              icon={CreditCard}
              title="Paystack"
              subtitle="Cards, bank transfer & USSD — instant confirmation."
              selected={method === 'paystack'}
              onClick={() => setMethod('paystack')}
            />
            <MethodCard
              icon={Bitcoin}
              title="Crypto"
              subtitle="SOL, ETH or BTC — upload proof after sending."
              selected={method === 'crypto'}
              onClick={() => setMethod('crypto')}
            />
          </div>

          {method === 'paystack' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-line bg-card p-6"
            >
              <div className="flex items-center gap-2 text-sm text-muted">
                <Lock className="h-4 w-4 text-brand" />
                Secured by Paystack — your details never touch our servers.
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={placing}
                onClick={handlePaystack}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-lg font-bold text-ink shadow-xl shadow-white/15 transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placing && <Loader2 className="h-5 w-5 animate-spin" />}
                {placing ? 'Opening Paystack...' : `Pay ${fmt(total, currency)}`}
              </motion.button>
              <p className="mt-3 text-center text-xs text-muted">
                A Paystack window will open — complete the payment and your order is placed
                instantly.
              </p>
            </motion.div>
          )}

          {method === 'crypto' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-5 rounded-2xl border border-line bg-card p-6"
            >
              <div className="grid grid-cols-3 gap-2">
                {CRYPTO_WALLETS.map((w) => (
                  <button
                    key={w.coin}
                    onClick={() => setCoin(w.coin)}
                    className={`rounded-xl border px-3 py-2.5 text-center transition-all ${
                      coin === w.coin
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-line bg-card-2 text-muted hover:border-brand/40 hover:text-cream'
                    }`}
                  >
                    <p className="text-sm font-extrabold">{w.coin}</p>
                    <p className="text-[11px] opacity-75">{w.name}</p>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Amount to send
                </p>
                <p className="mt-1 font-display text-3xl text-brand">{fmt(total, currency)}</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    {wallet.name} address · {wallet.network}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand transition-opacity hover:opacity-80"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
                <p className="mt-2 break-all rounded-xl border border-line bg-card-2 px-4 py-3 font-mono text-sm text-cream">
                  {wallet.address}
                </p>
              </div>

              <div className="rounded-xl bg-card-2/60 px-4 py-3 text-xs leading-relaxed text-muted">
                Send the exact amount on the network shown, then upload proof below. Your order is
                placed as <span className="font-bold text-cream">awaiting approval</span> and
                confirmed once we verify the transfer.
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Transaction hash (optional)
                </label>
                <input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste the tx signature if you have it"
                  className={`${inputCls} mt-2 font-mono`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  Evidence of payment <span className="text-brand">*</span>
                </label>
                {file ? (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-card-2 px-4 py-3">
                    <FileUp className="h-5 w-5 shrink-0 text-brand" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted">{Math.round(file.size / 1024)} KB</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="shrink-0 text-muted transition-colors hover:text-brand"
                      aria-label="Remove selected file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-card-2/50 px-4 py-6 text-muted transition-colors hover:border-brand/50 hover:text-cream"
                  >
                    <FileUp className="h-6 w-6" />
                    <span className="text-sm font-semibold">Upload screenshot or PDF</span>
                    <span className="text-xs">JPG, PNG, WEBP, HEIC or PDF · max 10MB</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFilePicked}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={placing}
                onClick={handleCryptoSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-lg font-bold text-ink shadow-xl shadow-white/15 transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placing && <Loader2 className="h-5 w-5 animate-spin" />}
                {placing ? 'Submitting...' : `I've sent ${fmt(total, currency)} — Submit order`}
              </motion.button>
            </motion.div>
          )}
        </div>

        <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
      </div>
    </div>
  );
}
