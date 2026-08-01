export default function CategorySkeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-xl bg-[#F3F4F6]" />
      ))}
    </div>
  );
}
