"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { deleteReview, getProductReviews, getReviewStatus } from "../services/reviewService";

import ReviewSummary from "./ReviewSummary";
import ReviewList from "./ReviewList";
import ReviewSkeleton from "./ReviewSkeleton";
import WriteReviewButton from "./WriteReviewButton";
import WriteReviewModal from "./WriteReviewModal";

import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: {},
  });

  const [pagination, setPagination] = useState(null);

  const [reviewStatus, setReviewStatus] = useState(null);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    sort: "newest",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const loadReviews = useCallback(
    async (page = query.page, sort = query.sort) => {
      try {
        const data = await getProductReviews(productId, {
          page,
          sort,
        });
        setReviews(data.reviews);

        setSummary(data.summary);

        setPagination(data.pagination);

        setQuery({
          page,
          sort,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load reviews.");
      }
    },
    [productId, query.page, query.sort]
  );

  const loadReviewStatus = useCallback(async () => {
    try {
      const data = await getReviewStatus(productId);

      setReviewStatus(data);
    } catch (error) {
      console.error(error);
    }
  }, [productId]);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      await Promise.all([loadReviews(), loadReviewStatus()]);
    } finally {
      setLoading(false);
    }
  }, [loadReviews, loadReviewStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDeleteReview = async () => {
    if (!reviewStatus?.review) {
      return;
    }

    try {
      setDeleting(true);

      await deleteReview(reviewStatus.review._id);

      toast.success("Review deleted successfully.");

      setDeleteModalOpen(false);

      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-8">
        <ReviewSkeleton />
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-6">
      <ReviewSummary
        averageRating={summary.averageRating}
        totalReviews={summary.totalReviews}
        ratingBreakdown={summary.ratingBreakdown}
      />

      <div className="flex justify-end">
        {!reviewStatus?.isAuthenticated && (
          <p className="text-sm text-[#6B7280]">Login to write a review.</p>
        )}

        {reviewStatus?.canReview && <WriteReviewButton onClick={() => setModalOpen(true)} />}

        {reviewStatus?.hasReviewed && (
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-xl border border-gray-400 px-5 py-2 text-sm font-medium text-[#242424] transition hover:bg-[#F9FAFB]"
            >
              Edit Review
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="rounded-xl border border-red-200 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete Review
            </button>
          </div>
        )}

        {!reviewStatus?.canReview &&
          !reviewStatus?.hasReviewed &&
          reviewStatus?.isAuthenticated && (
            <p className="text-sm text-[#6B7280]">
              {reviewStatus.reason === "NOT_PURCHASED"
                ? "Only verified purchasers can review this product."
                : "You can submit a review after your order has been delivered."}
            </p>
          )}
      </div>

      <ReviewList reviews={reviews} pagination={pagination} onPageChange={loadReviews} />

      <WriteReviewModal
        open={modalOpen}
        productId={productId}
        orderId={reviewStatus?.orderId}
        review={reviewStatus?.review}
        onClose={() => setModalOpen(false)}
        onSuccess={refresh}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        loading={deleting}
        title="Delete Review"
        description="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Delete Review"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteReview}
      />
    </section>
  );
}
