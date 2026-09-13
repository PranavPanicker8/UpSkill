export default function RoadmapDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-6 h-20 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-8 space-y-6">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
