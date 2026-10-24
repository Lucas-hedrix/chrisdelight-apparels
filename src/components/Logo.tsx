import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Logo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-ink shadow-lg shadow-white/15 transition-transform group-hover:scale-105">
        <Zap className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <span className="font-display text-[22px] leading-[0.95] tracking-wide">
        CYBERNEXUS
        <br />
        <span className="text-brand">STORE</span>
      </span>
    </Link>
  );
}
