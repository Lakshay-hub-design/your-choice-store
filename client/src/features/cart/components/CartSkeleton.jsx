export default function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-[#EDE9E6] bg-white p-5"
          >
            <div className="flex gap-4">
              <div className="h-28 w-28 shrink-0 rounded-xl bg-gray-100" />

              <div className="flex-1">
                <div className="h-4 w-2/3 rounded bg-gray-100" />

                <div className="mt-3 h-3 w-20 rounded bg-gray-100" />

                <div className="mt-4 h-6 w-28 rounded bg-gray-100" />

                <div className="mt-5 h-9 w-28 rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-2xl border border-[#EDE9E6] bg-white p-5">
        <div className="h-5 w-32 rounded bg-gray-100" />

        <div className="mt-8 space-y-5">
          <div className="h-4 rounded bg-gray-100" />
          <div className="h-4 rounded bg-gray-100" />
          <div className="h-4 rounded bg-gray-100" />
        </div>

        <div className="mt-8 h-12 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
