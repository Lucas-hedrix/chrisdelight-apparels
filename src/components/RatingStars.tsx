import { Star } from 'lucide-react';

export default function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <div className="flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={
              i < Math.round(rating)
                ? 'h-3.5 w-3.5 fill-cream text-cream'
                : 'h-3.5 w-3.5 text-muted/40'
            }
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-muted">({Number(rating ?? 0).toFixed(1)})</span>
    </div>
  );
}
