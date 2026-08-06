"use client";

import { X } from "lucide-react";

import ReviewForm from "./ReviewForm";

export default function WriteReviewModal({ open, onClose, productId, orderId, review, onSuccess }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
          <h2 className="text-xl font-semibold text-[#242424]">
            {review ? "Edit Review" : "Write Review"}
          </h2>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[#F3F4F6]">
            <X size={20} />
          </button>
        </div>

        <ReviewForm
          productId={productId}
          orderId={orderId}
          review={review}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
