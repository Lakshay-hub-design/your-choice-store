"use client";

import { useState } from "react";

import ReviewCard from "./ReviewCard";
import ReviewPagination from "./ReviewPagination";

export default function ReviewList({ reviews = [], pagination, onPageChange }) {
  const [sort, setSort] = useState("newest");

  return (
    <section className="mt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-[#242424]">Customer Reviews</h2>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);

            onPageChange?.(1, e.target.value);
          }}
          className="h-11 rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#242424] outline-none focus:border-[#FF5A5F]"
        >
          <option value="newest">Newest</option>

          <option value="oldest">Oldest</option>

          <option value="highest">Highest Rating</option>

          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-14 text-center">
          <h3 className="text-lg font-semibold text-[#242424]">No Reviews Yet</h3>

          <p className="mt-2 text-sm text-[#6B7280]">
            Be the first customer to review this product.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>

          <ReviewPagination
            pagination={pagination}
            onPageChange={(page) => onPageChange?.(page, sort)}
          />
        </>
      )}
    </section>
  );
}
