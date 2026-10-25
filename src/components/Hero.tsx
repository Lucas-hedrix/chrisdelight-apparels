import { motion } from 'motion/react';
import { ArrowRight, Asterisk, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MARQUEE_ITEMS = [
  'FREE SHIPPING ON ORDERS OVER ₦200,000',
  'NEW DROPS EVERY WEEK',
  'PREMIUM TEXTILES & EVERYDAY ESSENTIALS',
  'FABRICS, TEES & JOGGERS PRICED TO MOVE',
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hero-glow relative overflow-hidden rounded-3xl border border-line p-8 sm:p-10 lg:col-span-2"
        >
          <div className="glow-circle pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full" />
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            New Drops · Everyday Essentials
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-wide sm:text-6xl">
            CYBERNEXUS.
            <br />
            <span className="text-brand">WEAR BOLD.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]">
            Discover premium fabrics, clean everyday fits and wardrobe essentials sourced with
            intention. From statement wrappers to heavyweight joggers, Cybernexus makes it easy to
            own something special without overpaying.
          </p>
          <p className="mt-4 text-sm font-bold text-cream sm:text-base">
            Shop essentials. Find something different. Wear bold.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/collections')}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink shadow-lg shadow-white/15 transition-colors hover:bg-brand-strong"
            >
              Shop the Collection
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <Link
              to="/support"
              className="rounded-full border border-line bg-card/60 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-brand/50"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-panel p-8"
        >
          <div className="glow-circle pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full" />
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand">
              <Zap className="h-3.5 w-3.5" />
              Limited Stock
            </span>
            <h2 className="mt-6 font-display text-3xl tracking-wide">LAST PIECES</h2>
            <p className="mt-2 font-display text-5xl leading-[0.95] text-cream">
              ALMOST
              <br />
              <span className="text-brand">SOLD OUT</span>
            </p>
            <p className="mt-4 text-sm text-muted">
              Our fabrics are moving fast — once a drop is gone, it&apos;s gone.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() =>
              document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="mt-8 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-ink shadow-lg shadow-white/15 transition-colors hover:bg-brand-strong"
          >
            Buy Now!
          </motion.button>
        </motion.div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-panel py-3.5">
        <div className="animate-marquee flex w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, i) => (
            <span
              key={i}
              className="flex items-center gap-8 pr-8 text-[11px] font-extrabold uppercase tracking-[0.25em] text-cream/50"
            >
              <Asterisk className="h-4 w-4 shrink-0 text-brand" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
