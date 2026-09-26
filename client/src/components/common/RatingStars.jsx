import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating,
  max = 10,
  onChange,
  size = 'md',
  showNumber = true,
  readonly = false,
}) => {
  const [hoverRating, setHoverRating] = useState(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(max)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = displayRating >= starValue;
          const isHalf = !isFilled && displayRating >= starValue - 0.5;

          return (
            <button
              key={i}
              type="button"
              disabled={readonly}
              onClick={() => {
                if (!readonly && onChange) {
                  onChange(starValue === rating ? null : starValue);
                }
              }}
              onMouseEnter={() => !readonly && setHoverRating(starValue)}
              onMouseLeave={() => !readonly && setHoverRating(null)}
              className={`relative transition-transform ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'
              }`}
              title={`${starValue} / ${max}`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'text-brand-500 fill-brand-500'
                    : isHalf
                    ? 'text-brand-500 fill-brand-500/50'
                    : 'text-slate-600 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-brand-400">
          {rating ? `${Number(rating).toFixed(1)}/10` : 'Unrated'}
        </span>
      )}
    </div>
  );
};
