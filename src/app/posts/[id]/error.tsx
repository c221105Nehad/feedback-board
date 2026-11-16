"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-500">
        We couldn&apos;t load this post. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white"
      >
        Try again
      </button>
    </main>
  );
}