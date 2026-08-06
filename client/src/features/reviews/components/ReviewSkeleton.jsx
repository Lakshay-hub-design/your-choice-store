export default function ReviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary */}

      <div className="h-56 animate-pulse rounded-2xl bg-[#F3F4F6]" />

      {/* Reviews */}

      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-2xl bg-[#F3F4F6]" />
      ))}
    </div>
  );
}
