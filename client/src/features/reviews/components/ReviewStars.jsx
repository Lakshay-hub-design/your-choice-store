"use client";

import { Star } from "lucide-react";

export default function ReviewStars({ rating = 0, size = 18 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <Star
          key={index}
          size={size}
          className={index < rating ? "fill-[#FFC83D] text-[#FFC83D]" : "text-[#D1D5DB]"}
        />
      ))}
    </div>
  );
}
