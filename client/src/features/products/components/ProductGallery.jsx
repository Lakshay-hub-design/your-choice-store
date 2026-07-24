"use client";

import { useState } from "react";

export default function ProductGallery({ images = [], productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex];

  const getImageUrl = (image) =>
    image?.url || image?.secure_url || "/images/product-placeholder.png";

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#FFF9F5]">
        <img
          src={getImageUrl(selectedImage)}
          alt={productName}
          className="h-full w-full object-contain p-4 sm:p-6"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image._id || image.publicId || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-[#FFF9F5] transition sm:h-20 sm:w-20 ${
                selectedIndex === index
                  ? "border-[#FF5A5F]"
                  : "border-[#EDE9E6] hover:border-[#FF5A5F]/40"
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`${productName} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
