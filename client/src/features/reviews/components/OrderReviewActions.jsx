"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import WriteReviewModal from "./WriteReviewModal";

export default function OrderReviewActions({ productId, orderId, review, onReviewUpdated }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!review) {
    return null;
  }

  const handleSuccess = async () => {
    setModalOpen(false);

    await onReviewUpdated?.();
  };

  return (
    <>
      {review.hasReviewed && review.review && (
        <div className="mt-4">
          {/* Rating */}

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={15}
                fill={star <= review.review.rating ? "#FFC83D" : "none"}
                className={star <= review.review.rating ? "text-[#FFC83D]" : "text-[#D1D5DB]"}
              />
            ))}

            <span className="ml-2 text-xs font-medium text-[#6B7280]">
              {review.review.rating}/5
            </span>
          </div>

          {/* Review text */}

          {review.review.comment && (
            <p className="mt-2 line-clamp-2 text-xs text-[#6B7280]">"{review.review.comment}"</p>
          )}

          {/* Edit */}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-3 rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#242424] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
          >
            Edit Review
          </button>
        </div>
      )}

      {review.canReview && !review.hasReviewed && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-[#6B7280]">Share your experience</p>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-[#FF5A5F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#E94F54]"
          >
            Write Review
          </button>
        </div>
      )}

      <WriteReviewModal
        open={modalOpen}
        productId={productId}
        orderId={orderId}
        review={review.review || null}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
