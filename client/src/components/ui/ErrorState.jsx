"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this information. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#EDE9E6] bg-white px-6 py-12 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertCircle size={25} strokeWidth={1.8} />
      </div>

      <h2 className="text-lg font-bold text-[#242424] sm:text-xl">{title}</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">{description}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#242424] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF5A5F]"
        >
          <RotateCcw size={15} />
          Try Again
        </button>
      )}
    </div>
  );
}
