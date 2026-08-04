export default function CustomerDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-[#F3F4F6]" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-72 animate-pulse rounded-2xl bg-[#F3F4F6]" />

        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-2xl bg-[#F3F4F6]" />

          <div className="h-32 animate-pulse rounded-2xl bg-[#F3F4F6]" />
        </div>
      </div>

      <div className="h-80 animate-pulse rounded-2xl bg-[#F3F4F6]" />

      <div className="h-64 animate-pulse rounded-2xl bg-[#F3F4F6]" />
    </div>
  );
}
