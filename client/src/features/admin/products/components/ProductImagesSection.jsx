import { ImagePlus, X } from "lucide-react";

import FormCard from "@/components/ui/form/FormCard";

export default function ProductImagesSection({
  existingImages = [],
  removedImages = [],

  previews = [],

  onAddImages,
  onRemoveNewImage,
  onRemoveExistingImage,
}) {
  const visibleExistingImages = existingImages.filter(
    (image) => !removedImages.includes(image.fileId)
  );

  return (
    <FormCard
      title="Product Images"
      description="Upload product images. The first available image will be used as the primary image."
    >
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-6 py-10 text-center transition hover:border-[#FF5A5F]/50 hover:bg-[#FF5A5F]/[0.02]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5A5F]/10 text-[#FF5A5F]">
          <ImagePlus size={22} />
        </div>

        <p className="mt-3 text-sm font-semibold text-[#242424]">Upload product images</p>

        <p className="mt-1 text-xs text-[#9CA3AF]">Select one or multiple images</p>

        <input type="file" accept="image/*" multiple onChange={onAddImages} className="hidden" />
      </label>

      {(visibleExistingImages.length > 0 || previews.length > 0) && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {visibleExistingImages.map((image, index) => (
            <ImagePreview
              key={image.fileId}
              src={image.url}
              alt={`Existing product image ${index + 1}`}
              primary={index === 0}
              onRemove={() => onRemoveExistingImage?.(image.fileId)}
            />
          ))}

          {previews.map((preview, index) => (
            <ImagePreview
              key={preview}
              src={preview}
              alt={`New product image ${index + 1}`}
              primary={visibleExistingImages.length === 0 && index === 0}
              newImage
              onRemove={() => onRemoveNewImage(index)}
            />
          ))}
        </div>
      )}
    </FormCard>
  );
}

function ImagePreview({ src, alt, primary = false, newImage = false, onRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFF9F5]">
      <img src={src} alt={alt} className="h-full w-full object-cover" />

      {primary && (
        <span className="absolute bottom-2 left-2 rounded-full bg-[#242424] px-2 py-1 text-[9px] font-semibold text-white">
          Primary
        </span>
      )}

      {newImage && !primary && (
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#6B7280]">
          New
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow"
      >
        <X size={14} />
      </button>
    </div>
  );
}
