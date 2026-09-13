"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">We couldn’t load your dashboard.</h1>
        <button className="mt-4 rounded bg-slate-900 px-4 py-2 text-white" onClick={reset} type="button">Try again</button>
      </div>
    </main>
  );
}
