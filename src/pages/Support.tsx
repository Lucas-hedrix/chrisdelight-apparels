import { useState } from 'react';
import { ChevronDown, Clock, Mail, PackageSearch, Send } from 'lucide-react';

const SUPPORT_EMAIL = 'gishisrael432@gmail.com';

const FAQS = [
  {
    q: 'Where do the pieces come from?',
    a: 'Every item is sourced with intention — premium fabrics, curated everyday fits and corporate pieces. Each listing notes its details.',
  },
  {
    q: 'How does shipping work?',
    a: 'Standard shipping (3-5 business days) is ₦2,500 and express (1-2 business days) is ₦5,000. Orders over ₦200,000 ship free within Abuja.',
  },
  {
    q: 'Can I return an item?',
    a: 'Yes — 14-day returns on everything, as long as the piece arrives back unworn, unwashed and with tags attached.',
  },
  {
    q: 'How do sizes run?',
    a: 'Each listing includes its available sizes. Between sizes? Size up — most of our drops run fitted.',
  },
];

export default function Support() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Cybernexus] Message from ${form.name || 'a customer'}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-4xl tracking-wide">SUPPORT</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Questions about a piece, an order, or sourcing? We&apos;re one message away.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Mail,
            title: 'Email Us',
            body: SUPPORT_EMAIL,
            href: `mailto:${SUPPORT_EMAIL}`,
          },
          { icon: Clock, title: 'Response Time', body: 'We reply within 24 hours, 7 days a week.' },
          {
            icon: PackageSearch,
            title: 'Order Questions',
            body: 'Include your order ID so we can pull it up instantly.',
          },
        ].map((c) => {
          const Icon = c.icon;
          const content = (
            <>
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold">{c.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{c.body}</p>
            </>
          );
          return c.href ? (
            <a
              key={c.title}
              href={c.href}
              className="rounded-3xl border border-line bg-card p-6 transition-colors hover:border-brand/40"
            >
              {content}
            </a>
          ) : (
            <div key={c.title} className="rounded-3xl border border-line bg-card p-6">
              {content}
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-card p-6">
          <h2 className="font-display text-2xl tracking-wide">SEND A MESSAGE</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand/50"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand/50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand/50"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink shadow-lg shadow-white/15 transition-colors hover:bg-brand-strong"
            >
              <Send className="h-4 w-4" />
              Send Message
            </button>
          </div>
        </form>

        <div>
          <h2 className="font-display text-2xl tracking-wide">FAQ</h2>
          <div className="mt-5 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-line bg-card px-5 py-4 transition-colors hover:border-brand/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
