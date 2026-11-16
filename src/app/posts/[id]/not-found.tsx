import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-bold">Post not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        This post doesn&apos;t exist or was removed.
      </p>
      <Link href="/" className="mt-4 inline-block text-blue-500 underline">
        ← Back to all posts
      </Link>
    </main>
  );
}