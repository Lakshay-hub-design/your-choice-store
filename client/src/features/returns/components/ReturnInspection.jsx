"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { inspectReturn } from "@/features/returns/services/adminReturnService";

const INSPECTION_OPTIONS = [
  {
    value: "ACCEPTED",
    label: "Accepted",
  },
  {
    value: "DAMAGED",
    label: "Damaged",
  },
  {
    value: "USED",
    label: "Used",
  },
  {
    value: "WRONG_PRODUCT",
    label: "Wrong Product",
  },
  {
    value: "MISSING_PARTS",
    label: "Missing Parts",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

export default function ReturnInspection({ returnId, onSuccess }) {
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!result) {
      setError("Please select an inspection result.");
      return;
    }

    if (result !== "ACCEPTED" && !note.trim()) {
      setError("Please provide an inspection note.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await inspectReturn({
        returnId,
        inspectionResult: result,
        inspectionNote: note.trim(),
      });

      onSuccess?.();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to complete inspection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#EDE9E6] bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#FFF9F5] p-2">
          <ClipboardCheck size={22} className="text-[#7C5CFC]" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#242424]">Product Inspection</h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            Inspect the returned product before processing the refund.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[#242424]">Inspection Result</label>

        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="w-full rounded-xl border border-[#EDE9E6] bg-white px-4 py-3 text-sm text-gray-600 outline-none focus:border-[#7C5CFC]"
        >
          <option value="">Select inspection result</option>

          {INSPECTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[#242424]">
          Inspection Note
          {result !== "ACCEPTED" && <span className="text-red-500"> *</span>}
        </label>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Describe the condition of the returned product..."
          className="w-full rounded-xl border border-[#EDE9E6] px-4 py-3 text-sm text-gray-600 outline-none focus:border-[#7C5CFC]"
        />

        <p className="mt-1 text-right text-xs text-[#6B7280]">{note.length}/1000</p>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !result}
        className="mt-5 rounded-xl bg-[#242424] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Completing Inspection..." : "Complete Inspection"}
      </button>
    </div>
  );
}
