"use client";

import { Star } from "lucide-react";

export default function InteractiveReviewStars({ rating, onChange, size = 34 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition hover:scale-110"
        >
          <Star
            size={size}
            strokeWidth={1.8}
            className={star <= rating ? "fill-[#FFC83D] text-[#FFC83D]" : "text-[#CBD5E1]"}
          />
        </button>
      ))}
    </div>
  );
}
