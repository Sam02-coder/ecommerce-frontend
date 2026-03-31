import { useState } from 'react'
import { Star } from 'lucide-react'

/**
 * StarRating
 *
 * Renders a row of 5 stars.
 *
 * Props:
 *  rating     — current rating (0–5, decimals supported for display)
 *  size       — icon size in px (default 16)
 *  interactive — if true, stars are clickable/keyboard-navigable
 *  onChange   — callback(newRating: number) when user picks a star
 *  className  — extra classes on the wrapper
 */
export default function StarRating({
  rating = 0,
  size = 16,
  interactive = false,
  onChange,
  className = '',
}) {
  const [hovered, setHovered] = useState(null)

  const display = hovered ?? rating

  return (
    <div
      className={`flex gap-0.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Select a rating' : `${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1
        const filled = display >= value
        const halfFilled = !filled && display >= value - 0.5

        return interactive ? (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={Math.round(rating) === value}
            aria-label={`${value} star${value !== 1 ? 's' : ''}`}
            onClick={() => onChange?.(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' && value < 5) onChange?.(value + 1)
              if (e.key === 'ArrowLeft' && value > 1) onChange?.(value - 1)
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={size}
              className={filled || hovered >= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span key={i} aria-hidden="true">
            <Star
              size={size}
              className={
                filled
                  ? 'text-yellow-400 fill-yellow-400'
                  : halfFilled
                  ? 'text-yellow-400 fill-yellow-200'
                  : 'text-gray-200 fill-gray-200'
              }
            />
          </span>
        )
      })}
    </div>
  )
}
