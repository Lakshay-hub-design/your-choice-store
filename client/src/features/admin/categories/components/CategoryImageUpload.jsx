"use client";

import { useRef } from "react";

import Image from "next/image";

import { ImagePlus, Trash2 } from "lucide-react";

export default function CategoryImageUpload({ image, preview, onChange, onRemove }) {
  const inputRef = useRef(null);

  const imageSrc = preview || image?.url || image?.secure_url || "";

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onChange(file);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-[#242424]">Category Image</label>

      {imageSrc ? (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFF9F5]">
          <Image src={imageSrc} alt="Category" fill className="object-contain" />

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white p-2 shadow transition hover:bg-[#F3F4F6]"
            >
              <ImagePlus size={18} />
            </button>

            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg bg-red-500 p-2 text-white shadow transition hover:bg-red-600"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-[#FAFAFA] transition hover:border-[#FF5A5F]"
        >
          <ImagePlus size={42} className="text-[#9CA3AF]" />

          <p className="mt-3 text-sm font-medium text-[#242424]">Upload Category Image</p>

          <p className="mt-1 text-xs text-[#9CA3AF]">PNG, JPG or WEBP (Max 5 MB)</p>
        </button>
      )}

      <input ref={inputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
