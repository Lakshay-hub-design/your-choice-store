"use client";

import { useState } from "react";

import WriteReviewModal from "./WriteReviewModal";

export default function OrderReviewActions({ item, onReviewUpdated }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!item.review) {
    return null;
  }

  return (
    <>
      {item.review.canReview && (
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg border border-[#FF5A5F] px-4 py-2 text-sm font-medium text-[#FF5A5F] transition hover:bg-[#FFF5F5]"
        >
          Write Review
        </button>
      )}

      {item.review.hasReviewed && (
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium transition hover:bg-[#F9FAFB]"
        >
          Edit Review
        </button>
      )}

      <WriteReviewModal
        open={modalOpen}
        productId={item.product}
        orderId={item.orderId}
        review={item.review.review || null}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          onReviewUpdated?.();
        }}
      />
    </>
  );
}
