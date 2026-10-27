import { Star } from 'lucide-react';

export default function RatingStars({ rating }: { rating?: number | null }) {
  const filled = rating == null ? 0 : Math.round(rating);
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={
            i < filled
              ? 'h-3 w-3 fill-[#FFD700] text-[#FFD700]'
              : 'h-3 w-3 text-muted/40'
          }
        />
      ))}
      {rating != null && (
        <span className="ml-0.5 text-[10px] font-semibold text-muted">
          ({Number(rating).toFixed(1)})
        </span>
      )}
    </div>
  );
}
