import Image from "next/image";

import ReviewStars from "./ReviewStars";
import ReviewImageGallery from "./ReviewImageGallery";

export default function ReviewCard({ review }) {
  const avatar = review.user?.avatar?.url || "/images/avatar-placeholder.png";

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      {/* Header */}

      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#E5E7EB]">
          <Image src={avatar} alt={review.user?.fullName} fill className="object-cover" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-[#242424]">{review.user?.fullName}</h3>

            {review.isVerifiedPurchase && (
              <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                Verified Purchase
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[#9CA3AF]">
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Rating */}

      <div className="mt-5">
        <ReviewStars rating={review.rating} />
      </div>

      {/* Title */}

      {review.title && (
        <h4 className="mt-4 text-lg font-semibold text-[#242424]">{review.title}</h4>
      )}

      {/* Comment */}

      <p className="mt-3 leading-7 whitespace-pre-line text-[#4B5563]">{review.comment}</p>

      {/* Images */}

      <ReviewImageGallery images={review.images} />
    </article>
  );
}
