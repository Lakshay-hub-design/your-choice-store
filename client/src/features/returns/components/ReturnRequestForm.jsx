"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";

import { createReturnRequest } from "@/features/returns/services/returnService";

const RETURN_REASONS = [
  {
    value: "DAMAGED",
    label: "Product arrived damaged",
  },
  {
    value: "WRONG_PRODUCT",
    label: "Wrong product received",
  },
  {
    value: "DEFECTIVE",
    label: "Product is defective",
  },
  {
    value: "MISSING_ITEM",
    label: "Item is missing",
  },
  {
    value: "NOT_AS_DESCRIBED",
    label: "Product is significantly different",
  },
  {
    value: "OTHER",
    label: "Other issue",
  },
];

export default function ReturnRequestForm({ order, onSuccess, onCancel }) {
  const [selectedItems, setSelectedItems] = useState({});

  const [reason, setReason] = useState("");

  const [description, setDescription] = useState("");

  const [images, setImages] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(null);

  /*
   * ==========================================
   * Select / unselect product
   * ==========================================
   */

  const toggleItem = (productId, maxQuantity) => {
    setSelectedItems((current) => {
      if (current[productId]) {
        const updated = { ...current };

        delete updated[productId];

        return updated;
      }

      return {
        ...current,
        [productId]: 1,
      };
    });
  };

  /*
   * ==========================================
   * Change return quantity
   * ==========================================
   */

  const updateQuantity = (productId, quantity, maxQuantity) => {
    const safeQuantity = Math.min(Math.max(Number(quantity), 1), maxQuantity);

    setSelectedItems((current) => ({
      ...current,
      [productId]: safeQuantity,
    }));
  };

  /*
   * ==========================================
   * Image selection
   * ==========================================
   *
   * NOTE:
   *
   * This first version keeps selected files
   * locally.
   *
   * We will connect this to your ImageKit
   * upload flow in the next step.
   */

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images.");

      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        return false;
      }

      return true;
    });

    if (validFiles.length !== files.length) {
      setError("Only images up to 5MB each are allowed.");

      return;
    }

    setImages((current) => [...current, ...validFiles]);

    setError("");
  };

  const removeImage = (index) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  /*
   * ==========================================
   * Submit
   * ==========================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /*
     * Selected products
     */

    const items = Object.entries(selectedItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (items.length === 0) {
      setError("Please select at least one item.");

      return;
    }

    if (!reason) {
      setError("Please select a reason.");

      return;
    }

    if (description.trim().length < 10) {
      setError("Please provide at least 10 characters describing the issue.");

      return;
    }

    try {
      setSubmitting(true);

      const returnRequest = await createReturnRequest({
        orderId: order._id,
        items,
        reason,
        description: description.trim(),
        images,
      });

      setSuccess(returnRequest);

      if (onSuccess) {
        onSuccess(returnRequest);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-white p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={25} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#242424]">Return request submitted</h2>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          We've received your request and will review it shortly.
        </p>

        {success.returnNumber && (
          <div className="mt-5 rounded-xl bg-[#FFF9F5] p-4">
            <p className="text-xs text-[#6B7280]">Return ID</p>

            <p className="mt-1 text-sm font-bold text-[#242424]">{success.returnNumber}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="mt-6 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#EDE9E6] bg-white p-5 sm:p-7"
    >
      {/* Header */}

      <div>
        <h2 className="text-xl font-bold text-[#242424]">Report an Issue</h2>

        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
          Select the item and tell us what went wrong with your order.
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

          <p className="text-sm leading-6 text-red-600">{error}</p>
        </div>
      )}

      {/* Products */}

      <section className="mt-7">
        <h3 className="text-sm font-bold text-[#242424]">Select item(s)</h3>

        <div className="mt-3 space-y-3">
          {order.items.map((item) => {
            const productId = item.product;

            const selected = selectedItems[productId] !== undefined;

            return (
              <div
                key={productId}
                className={`rounded-xl border p-4 transition ${
                  selected ? "border-[#FF5A5F]/40 bg-[#FF5A5F]/[0.03]" : "border-[#EDE9E6]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleItem(productId, item.quantity)}
                    className="mt-1 h-4 w-4 accent-[#FF5A5F]"
                  />

                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#242424]">{item.name}</p>

                    <p className="mt-1 text-xs text-[#6B7280]">
                      Quantity purchased: {item.quantity}
                    </p>

                    {selected && item.quantity > 1 && (
                      <div className="mt-3 flex items-center gap-2">
                        <label className="text-xs font-medium text-[#6B7280]">
                          Return quantity
                        </label>

                        <select
                          value={selectedItems[productId]}
                          onChange={(event) =>
                            updateQuantity(productId, event.target.value, item.quantity)
                          }
                          className="rounded-lg border border-[#EDE9E6] bg-white px-2 py-1.5 text-xs text-[#242424] outline-none focus:border-[#FF5A5F]"
                        >
                          {Array.from(
                            {
                              length: item.quantity,
                            },
                            (_, index) => index + 1
                          ).map((quantity) => (
                            <option key={quantity} value={quantity}>
                              {quantity}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reason */}

      <section className="mt-7">
        <h3 className="text-sm font-bold text-[#242424]">Reason</h3>

        <div className="mt-3 space-y-2">
          {RETURN_REASONS.map((item) => (
            <label
              key={item.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                reason === item.value
                  ? "border-[#FF5A5F]/40 bg-[#FF5A5F]/[0.03]"
                  : "border-[#EDE9E6]"
              }`}
            >
              <input
                type="radio"
                name="returnReason"
                value={item.value}
                checked={reason === item.value}
                onChange={(event) => setReason(event.target.value)}
                className="h-4 w-4 accent-[#FF5A5F]"
              />

              <span className="text-sm text-[#242424]">{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Description */}

      <section className="mt-7">
        <label htmlFor="return-description" className="text-sm font-bold text-[#242424]">
          Describe the issue
        </label>

        <textarea
          id="return-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="Please explain what went wrong with the product..."
          className="mt-3 w-full resize-none rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 text-sm text-[#242424] outline-none placeholder:text-[#9CA3AF] focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/10"
        />

        <p className="mt-1 text-right text-xs text-[#9CA3AF]">{description.length}/2000</p>
      </section>

      {/* Images */}

      <section className="mt-7">
        <div>
          <h3 className="text-sm font-bold text-[#242424]">Add photos</h3>

          <p className="mt-1 text-xs text-[#6B7280]">
            Photos can help us understand the issue. Maximum 5 images, 5MB each.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#EDE9E6]"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Issue photo ${index + 1}`}
                className="h-full w-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D9D3CF] bg-[#FFF9F5] text-[#6B7280] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]">
              <ImagePlus size={20} />

              <span className="mt-1 text-[10px] font-semibold">Add Photo</span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </section>

      {/* Buttons */}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-[#EDE9E6] px-5 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-[#FFF9F5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A5F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f1494e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}

          {submitting ? "Submitting..." : "Submit Issue"}
        </button>
      </div>
    </form>
  );
}
