export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl animate-pulse p-6">
      <div className="h-4 w-32 rounded bg-gray-300/40" />
      <div className="mt-4 space-y-3 rounded-lg border border-gray-300 p-6">
        <div className="h-7 w-2/3 rounded bg-gray-300/40" />
        <div className="h-4 w-full rounded bg-gray-300/40" />
        <div className="h-4 w-5/6 rounded bg-gray-300/40" />
      </div>
    </main>
  );
}