import { Shirt } from 'lucide-react';

export default function PlaceholderImage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-card-2 via-card to-ink">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-brand/25 bg-brand/10">
        <Shirt className="h-8 w-8 text-brand/80" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted/70">
        Image coming soon
      </span>
    </div>
  );
}
