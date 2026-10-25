import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Clock,
  Eye,
  ImagePlus,
  Loader2,
  Lock,
  Megaphone,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch, getMyVendor, uploadLogo, type VendorMe } from '../lib/vendorClient';
import { PLAN_PRICES, type VendorPlan } from '../lib/vendors';
import { isPaystackConfigured, loadPaystack, paystackPublicKey } from '../lib/payments';
import { fmt } from '../lib/format';
import { friendlyError, logError } from '../lib/errors';

const inputCls =
  'w-full rounded-xl border border-line bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-brand/50 placeholder:text-muted';

const STEPS = [
  {
    title: 'Register your business',
    body: 'Tell us who you are — business name, what you sell, and your WhatsApp number. We review every registration before your store goes live.',
  },
  {
    title: 'Pick your plan',
    body: 'Rent a monthly storefront space, or partner with us on commission. Paid plans are activated once we verify your payment.',
  },
  {
    title: 'List your products',
    body: 'Add products with photos, prices, sizes and descriptions from your vendor dashboard. They appear on your storefront and across the marketplace.',
  },
];

const PLANS: {
  id: VendorPlan;
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₦3,000 / month',
    tagline: 'Get your products in front of every visitor.',
    features: [
      'Your own storefront page on Cybernexus',
      'Products listed in the main marketplace',
      'Buyers contact you through the platform',
      'WhatsApp number stays private — contact is locked until you upgrade',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '₦4,000 / month',
    tagline: 'Everything in Starter, plus direct contact.',
    features: [
      'Everything included in Starter',
      'Buyers reach you directly on WhatsApp',
      'Your number is verified and unlocked for buyers',
      'Best for vendors who close sales themselves',
    ],
    highlight: true,
  },
  {
    id: 'commission',
    name: 'Commission Partner',
    price: 'No monthly fee',
    tagline: 'We take an agreed share of each qualifying sale.',
    features: [
      'No subscription — you pay only when you sell',
      'Commission rate agreed with us before activation',
      'Your store is actively promoted across the platform',
      'Every sale is recorded so the maths is always visible to you',
    ],
  },
];

export default function Sell() {
  return (
    <div className="mx-auto max-w-5xl">
      <Hero />
      <HowItWorks />
      <PlansSection />
      <StorefrontSection />
      <PaymentsSection />
      <CommissionSection />
      <RulesSection />
      <VendorTerms />
      <ApplySection />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-card p-8 sm:p-14">
      <div className="glow-circle pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full" />
      <p className="font-display text-sm tracking-[0.3em] text-brand">FOR LOCAL VENDORS</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight tracking-wide sm:text-6xl">
        RENT A SPACE. REACH EVERY CUSTOMER.
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Cybernexus started as a clothing store — now it is a marketplace. Rent a storefront space,
        list whatever you sell, and put your products in front of every visitor. You keep full
        control of your products, your prices and your brand.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#apply"
          className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
        >
          Become a Vendor
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href="#vendor-terms"
          className="rounded-full border border-line px-6 py-3 text-sm font-bold text-cream transition-colors hover:border-brand/40"
        >
          Read the vendor terms
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl tracking-wide">HOW IT WORKS</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-3xl border border-line bg-card p-6"
          >
            <span className="font-display text-3xl text-brand">{i + 1}</span>
            <h3 className="mt-3 font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl tracking-wide">CHOOSE YOUR PLAN</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Every plan rents you a storefront space on Cybernexus. The difference is how buyers reach
        you — and how we get paid.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`flex flex-col rounded-3xl border p-6 ${
              plan.highlight ? 'border-brand/60 bg-brand/5' : 'border-line bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{plan.name}</h3>
              {plan.highlight && (
                <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-ink">
                  Most popular
                </span>
              )}
            </div>
            <p className="mt-4 font-display text-3xl text-brand">{plan.price}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{plan.tagline}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#apply"
              className={`mt-6 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                plan.highlight
                  ? 'bg-brand text-ink hover:bg-brand-strong'
                  : 'border border-line text-cream hover:border-brand/40'
              }`}
            >
              List Your Products
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-card p-5">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-bold text-cream">How contact locking works:</span> on Starter, a
          buyer who tries to contact you sees an upgrade prompt instead of your number. This is
          enforced on our servers — your WhatsApp number is never sent to the browser, so it cannot
          be uncovered by zooming in, viewing the page source, or inspecting network traffic.
        </p>
      </div>
    </section>
  );
}

function StorefrontSection() {
  const items = [
    {
      icon: Store,
      title: 'A storefront of your own',
      body: 'cybernexus.store/vendors/your-name — your logo, your bio, your products.',
    },
    {
      icon: Eye,
      title: 'Marketplace exposure',
      body: 'Your products appear in the main marketplace alongside the house collection.',
    },
    {
      icon: UserRound,
      title: 'A vendor dashboard',
      body: 'Add, edit and remove products; update your profile and track your plan — all in one place.',
    },
    {
      icon: Megaphone,
      title: 'A chance to be featured',
      body: 'From time to time we feature vendors and products across the platform at no extra cost. Featuring is discretionary — we never promise traffic or sales.',
    },
  ];
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl tracking-wide">WHAT YOU GET</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-4 rounded-3xl border border-line bg-card p-6">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-card-2 text-brand">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentsSection() {
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl tracking-wide">PAYMENTS &amp; RENEWALS</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-card p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="font-bold">Paystack, verified by a human</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Subscription payments run through Paystack. After you pay, your payment is reviewed and
            verified by our team before your plan activates — nothing is activated automatically.
            Your reference and payment history stay visible in your dashboard.
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-card p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-brand" />
            <h3 className="font-bold">Monthly cycle</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Your month starts the day your payment is verified. When a plan expires, buyer contact
            locks immediately and your products stay visible for 7 more days, then come down until
            you renew. Upgrading from Starter to Business keeps the time you have already paid for
            — it stacks onto your new expiry date.
          </p>
        </div>
      </div>
    </section>
  );
}

function CommissionSection() {
  return (
    <section className="mt-14">
      <div className="rounded-3xl border border-line bg-card p-6 sm:p-10">
        <div className="flex items-center gap-3">
          <CircleDollarSign className="h-6 w-6 text-brand" />
          <h2 className="font-display text-2xl tracking-wide">COMMISSION PARTNERS</h2>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-2.5 text-sm leading-relaxed text-muted">
            <p>
              Commission partnership suits vendors with steady sales who would rather pay only when
              they earn. There is no monthly fee.
            </p>
            <p>
              Before activation we agree a commission rate with you individually — it is never
              guessed or imposed silently, and you will see the exact percentage and the terms in
              writing in your dashboard.
            </p>
            <p>
              Every qualifying sale is recorded with the amount, the rate and the commission due, so
              your history is always visible. Records are marked pending, settled or disputed and
              can be reviewed with you at any time.
            </p>
          </div>
          <div className="space-y-2.5 text-sm leading-relaxed text-muted">
            <p>
              Because we only earn when you do, commission partners get the most visible placement
              we can offer — priority featuring across the platform.
            </p>
            <p>
              To be considered, apply with the Commission Partner plan. We will reach out to agree
              the rate and terms before your store goes live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RulesSection() {
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl tracking-wide">THE RULES</h2>
      <div className="mt-6 rounded-3xl border border-line bg-card p-6 sm:p-10">
        <div className="space-y-2.5 text-sm leading-relaxed text-muted">
          <p>
            Every registration is reviewed by our team before your storefront goes live. We may
            decline applications that do not fit the platform.
          </p>
          <p>
            Illegal goods, counterfeit items, and anything that would violate Nigerian law are
            prohibited. Listings that break the rules are removed, and repeat violations lead to
            suspension without a refund for the current month.
          </p>
          <p>
            You are responsible for your listings, your prices, and the orders you accept. Keep your
            product information accurate and your WhatsApp reachable if you are on the Business
            plan.
          </p>
          <p>
            We may suspend a store that breaches these rules. Suspended stores disappear from the
            marketplace immediately.
          </p>
        </div>
      </div>
    </section>
  );
}

function VendorTerms() {
  const clauses = [
    {
      title: 'The service',
      body: 'Cybernexus provides vendors with a storefront page, product listings in the main marketplace, and — on qualifying plans — a buyer contact channel. Cybernexus is a platform: unless an order is placed through the house collection, the sale contract is between the vendor and the buyer. Cybernexus is not a party to vendor sales and does not take custody of vendor goods.',
    },
    {
      title: 'Subscriptions and renewal',
      body: 'Starter and Business plans are billed monthly in advance through Paystack. A plan takes effect when our team verifies the payment — typically within a few hours. Each verified payment extends your expiry date by one month from the current expiry (or from today, if your plan has already lapsed). Plans do not auto-charge; you renew manually.',
    },
    {
      title: 'Expiry, downgrades and refunds',
      body: 'When a paid plan expires, the buyer contact channel locks immediately and your products remain visible for a 7-day grace period, after which they are hidden until you renew. Subscription fees already paid are non-refundable, except where we are unable to provide the service at all.',
    },
    {
      title: 'Upgrades',
      body: 'You can upgrade from Starter to Business at any time from your dashboard. The time remaining on your current plan carries over — the new expiry is your old expiry plus the new month, so upgrading early never wastes money.',
    },
    {
      title: 'Commission partnerships',
      body: 'Commission partners pay no subscription. The commission rate and what counts as a qualifying sale are agreed between the vendor and Cybernexus in writing before activation. We record every qualifying sale with its amount and commission, and both parties can review the records. Disputes about a recorded sale can be raised through support and will be marked disputed until resolved.',
    },
    {
      title: 'Your content and conduct',
      body: 'You keep ownership of your product photos and descriptions. You grant Cybernexus a licence to display them on the platform while you are a vendor. You must own or have the right to use everything you upload, and your listings must comply with Nigerian law. Prohibited: illegal goods, counterfeits, misleading claims, and anything we reasonably judge harmful to buyers or the platform.',
    },
    {
      title: 'Moderation and suspension',
      body: 'We review registrations and may decline or remove listings that break these terms. We may suspend a store for violations; suspended stores are hidden immediately and, for paid plans, the current month is not refunded where the suspension follows a breach by the vendor.',
    },
    {
      title: 'Changes and termination',
      body: 'We may update these vendor terms; material changes will be published on this page. Either side can end the relationship at any time — tell us and we will take your store down; expired-plan data handling follows the expiry policy above.',
    },
  ];
  return (
    <section id="vendor-terms" className="mt-14 scroll-mt-24">
      <h2 className="font-display text-3xl tracking-wide">VENDOR TERMS OF SERVICE</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        These terms apply to everyone who rents a storefront space on Cybernexus. They work
        alongside our general{' '}
        <Link to="/terms" className="font-semibold text-cream underline decoration-line underline-offset-4 hover:decoration-brand">
          Terms &amp; Conditions
        </Link>
        .
      </p>
      <div className="mt-6 rounded-3xl border border-line bg-card p-6 sm:p-10">
        <div className="space-y-8">
          {clauses.map((c, i) => (
            <section key={c.title}>
              <h3 className="flex items-baseline gap-2.5 text-base font-bold text-cream">
                <span className="font-display text-lg text-brand">{i + 1}.</span>
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-line pt-6 text-sm font-semibold text-cream">
          Questions about the vendor programme? Contact us through the{' '}
          <Link to="/support" className="underline decoration-line underline-offset-4 hover:decoration-brand">
            support page
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

function ApplySection() {
  const { user, ready } = useAuth();
  const { push } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const [me, setMe] = useState<VendorMe | null | undefined>(undefined);
  const [plan, setPlan] = useState<VendorPlan>('starter');
  const [form, setForm] = useState({ businessName: '', slug: '', category: '', bio: '', whatsapp: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { kind: 'pending' | 'commission' }>(null);

  useEffect(() => {
    if (!user) {
      setMe(null);
      return;
    }
    getMyVendor()
      .then(setMe)
      .catch(() => setMe(null));
  }, [user]);

  const slug = useMemo(() => form.slug || slugify(form.businessName), [form.slug, form.businessName]);
  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function pickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function openPaystack(payment: { plan: 'starter' | 'business' }) {
    const PaystackPop = await loadPaystack();
    return new Promise<string>((resolve, reject) => {
      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: user!.email,
        amount: PLAN_PRICES[payment.plan] * 100,
        currency: 'NGN',
        ref: `CVN-${Date.now()}`,
        metadata: { purpose: 'vendor-plan', plan: payment.plan, userId: user!.$id },
        callback: (t: { reference: string }) => resolve(t.reference),
        onClose: () => reject(new Error('Payment window closed before completion')),
      });
      handler.openIframe();
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      let logoFileId: string | undefined;
      if (logoFile) logoFileId = await uploadLogo(logoFile);

      await apiFetch('/vendor/register', {
        method: 'POST',
        body: JSON.stringify({
          businessName: form.businessName,
          slug,
          category: form.category,
          bio: form.bio,
          whatsapp: form.whatsapp,
          plan,
          logoFileId,
        }),
      });

      if (plan === 'commission') {
        setDone({ kind: 'commission' });
      } else {
        if (!isPaystackConfigured) {
          push({
            title: 'Application received',
            message: 'Payments are not set up yet — we will contact you to complete your subscription.',
          });
          setDone({ kind: 'pending' });
          return;
        }
        const reference = await openPaystack({ plan });
        await apiFetch('/vendor/payments', {
          method: 'POST',
          body: JSON.stringify({ plan, reference, amount: PLAN_PRICES[plan] }),
        });
        setDone({ kind: 'pending' });
      }
      push({
        title: 'Application submitted',
        message: 'We review every registration before your store goes live.',
      });
    } catch (err) {
      logError(err);
      push({
        title: "Couldn't complete your application",
        message: friendlyError(err, 'Check your details and try again.'),
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  return (
    <section id="apply" ref={formRef} className="mt-14 scroll-mt-24">
      <h2 className="font-display text-3xl tracking-wide">BECOME A VENDOR</h2>

      {done ? (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-line bg-card p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand/15 text-brand">
            <BadgeCheck className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl tracking-wide">
            {done.kind === 'commission' ? 'APPLICATION IN REVIEW' : 'PAYMENT SUBMITTED'}
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            {done.kind === 'commission'
              ? 'Thank you! We will reach out on the details you provided to agree your commission rate and terms before your store goes live.'
              : 'Thank you! We verify every payment by hand before your plan activates — usually within a few hours. Track the status in your vendor dashboard.'}
          </p>
          <Link
            to="/vendor"
            className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
          >
            Go to your dashboard
          </Link>
        </div>
      ) : !user ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-line bg-card p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-card-2 text-muted">
            <UserRound className="h-8 w-8" />
          </div>
          <h3 className="font-bold">Sign in to apply</h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            You need a Cybernexus account to register a business. It takes less than a minute.
          </p>
          <Link
            to="/auth?next=/sell"
            className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
          >
            Sign in or create an account
          </Link>
        </div>
      ) : me === undefined ? (
        <div className="mt-6 grid place-items-center rounded-3xl border border-line bg-card p-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : me ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-brand/40 bg-brand/5 p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand/15 text-brand">
            <Store className="h-8 w-8" />
          </div>
          <h3 className="font-bold">You already run a store here</h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            {me.vendor.businessName} is registered on Cybernexus. Manage your products, plan and
            profile from the dashboard.
          </p>
          <Link
            to="/vendor"
            className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong"
          >
            Open your dashboard
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 rounded-3xl border border-line bg-card p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Business name</span>
              <input required minLength={2} maxLength={100} value={form.businessName} onChange={setField('businessName')} placeholder="e.g. Ada Threads" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Store address</span>
              <div className="flex items-center gap-2">
                <input
                  value={form.slug}
                  onChange={setField('slug')}
                  placeholder={slug || 'your-name'}
                  maxLength={30}
                  className={`${inputCls} flex-1`}
                />
              </div>
              <span className="mt-1.5 block text-[11px] text-muted">cybernexus.store/vendors/{slug || 'your-name'}</span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">What do you sell?</span>
              <input maxLength={100} value={form.category} onChange={setField('category')} placeholder="e.g. Skincare, Art, Footwear" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">WhatsApp number</span>
              <input required inputMode="tel" value={form.whatsapp} onChange={setField('whatsapp')} placeholder="2348012345678" className={inputCls} />
              <span className="mt-1.5 block text-[11px] text-muted">Digits only, with country code. Buyers only see this on the Business plan.</span>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">About your business</span>
              <textarea rows={3} maxLength={1000} value={form.bio} onChange={setField('bio')} placeholder="Tell buyers who you are and what makes your products worth it." className={inputCls} />
            </label>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Logo (optional)</span>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded-2xl border border-line object-cover" />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-line text-muted">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}
                <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-xs font-bold text-cream transition-colors hover:border-brand/40">
                  {logoPreview ? 'Change logo' : 'Upload logo'}
                  <input type="file" accept="image/*" onChange={pickLogo} className="hidden" />
                </label>
                {logoPreview && (
                  <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted hover:text-cream" aria-label="Remove logo">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">Choose your plan</span>
            <div className="grid gap-3 sm:grid-cols-3">
              {PLANS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    plan === p.id ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/40'
                  }`}
                >
                  <p className="font-bold">{p.name}</p>
                  <p className="mt-1 font-display text-xl text-brand">{p.price}</p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              {plan === 'commission'
                ? 'No payment now — we will reach out to agree your rate before activation.'
                : `You will be redirected to Paystack to pay ${fmt(PLAN_PRICES[plan])}. Your plan activates after we verify the payment.`}
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-brand-strong disabled:opacity-60 sm:w-auto"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {busy ? 'Working…' : plan === 'commission' ? 'Apply as a Commission Partner' : `Submit application & pay ${fmt(PLAN_PRICES[plan])}`}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            By applying you agree to the vendor terms above. Every registration is reviewed before
            your storefront goes live.
          </p>
        </form>
      )}
    </section>
  );
}
