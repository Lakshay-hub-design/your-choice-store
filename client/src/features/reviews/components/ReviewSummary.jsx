import ReviewStars from "./ReviewStars";

export default function ReviewSummary({
  averageRating = 0,
  totalReviews = 0,
  ratingBreakdown = {},
}) {
  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Left */}

        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FFF8F5] p-6">
          <h2 className="text-6xl font-bold tracking-tight text-[#242424]">
            {averageRating.toFixed(1)}
          </h2>

          <div className="mt-4">
            <ReviewStars rating={Math.round(averageRating)} size={24} />
          </div>

          <p className="mt-3 text-sm text-[#6B7280]">
            Based on <span className="font-semibold text-[#242424]">{totalReviews}</span> reviews
          </p>
        </div>

        {/* Rating Breakdown */}

        <div className="flex flex-col justify-center space-y-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown?.[star] ?? ratingBreakdown?.[String(star)] ?? 0;

            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-4">
                <div className="flex w-14 items-center gap-1">
                  <span className="font-medium text-[#242424]">{star}</span>

                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC83D">
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.417 8.265L12 19.771 4.583 23.86 6 15.596 0 9.748l8.332-1.73z" />
                  </svg>
                </div>

                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#EEF2F7]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FFC83D] to-[#FFB800] transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="w-14 text-right text-sm font-medium text-[#6B7280]">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
