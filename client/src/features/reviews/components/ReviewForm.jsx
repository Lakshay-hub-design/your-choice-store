"use client";

import { useState } from "react";

import { toast } from "sonner";

import InteractiveReviewStars from "./InteractiveReviewStars";

import { createReview, updateReview } from "../services/reviewService";

export default function ReviewForm({ productId, orderId, review, onSuccess, onClose }) {
  const [rating, setRating] = useState(review?.rating || 5);

  const [title, setTitle] = useState(review?.title || "");

  const [comment, setComment] = useState(review?.comment || "");

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("rating", rating);
      formData.append("title", title);
      formData.append("comment", comment);

      if (!review) {
        formData.append("orderId", orderId);
      }

      images.forEach((file) => {
        formData.append("images", file);
      });

      if (review) {
        review.images?.forEach((image) => {
          formData.append("keepImages", image.fileId);
        });

        await updateReview(review._id, formData);

        toast.success("Review updated successfully.");
      } else {
        await createReview(productId, formData);

        toast.success("Review submitted successfully.");
      }

      onSuccess?.();

      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* Rating */}

      <div>
        <label className="mb-3 block text-sm font-semibold text-[#242424]">Rating</label>

        <InteractiveReviewStars rating={rating} onChange={setRating} />

        <p className="mt-2 text-sm text-[#6B7280]">Click a star to rate this product.</p>
      </div>

      {/* Title */}

      <div>
        <label className="mb-2 block text-sm font-medium text-[#242424]">Title</label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title"
          className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
        />
      </div>

      {/* Comment */}

      <div>
        <label className="mb-2 block text-sm font-medium text-[#242424]">Review</label>

        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white p-3 text-[#242424] transition outline-none placeholder:text-[#9CA3AF] focus:border-[#FF5A5F] focus:ring-4 focus:ring-[#FF5A5F]/10"
        />
      </div>

      {/* Images */}

      <div>
        <label className="mb-3 block text-sm font-semibold text-[#242424]">
          Upload Images
          <span className="ml-1 font-normal text-[#6B7280]">(Optional)</span>
        </label>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#FAFAFA] px-4 py-6 transition hover:border-[#FF5A5F] hover:bg-[#FFF6F6]">
          <input
            hidden
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />

          <p className="text-sm font-medium text-[#FF5A5F]">Click to upload</p>

          <p className="mt-1 text-sm text-[#6B7280]">JPG, PNG up to 5MB each</p>
        </label>

        <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280]">
          <span>Maximum 5 images</span>

          <span>{images.length} / 5</span>
        </div>
      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[#242424] px-6 py-2.5 font-medium text-[#242424] transition hover:bg-[#F9FAFB]"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          className="rounded-xl bg-[#FF5A5F] px-6 py-2.5 font-semibold text-white transition hover:bg-[#F1494E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting..." : review ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
