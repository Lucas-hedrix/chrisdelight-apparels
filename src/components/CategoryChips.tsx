import { motion } from 'motion/react';

interface ChipOption {
  id: string;
  label: string;
}

interface CategoryChipsProps {
  value: string;
  onChange: (id: string) => void;
  options: ChipOption[];
  layoutId?: string;
}

export default function CategoryChips({
  value,
  onChange,
  options,
  layoutId = 'cat-chip',
}: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active ? 'text-ink' : 'text-muted hover:text-cream'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-white/15"
              />
            )}
            <span className="relative">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
