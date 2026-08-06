"use client";

export default function WriteReviewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FF5A5F] px-5 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
    >
      Write a Review
    </button>
  );
}
