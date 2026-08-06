"use client";

import Image from "next/image";

export default function ReviewImageGallery({ images = [] }) {
  if (!images.length) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {images.map((image) => (
        <div
          key={image.fileId}
          className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#E5E7EB]"
        >
          <Image src={image.url} alt="Review" fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
