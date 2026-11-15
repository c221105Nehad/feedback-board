import { db } from "@/db";
import { posts, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import PostForm from "@/components/PostForm";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  open: "bg-gray-100 text-gray-700",
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-700",
};

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

const allPosts = await db
  .select({
    id: posts.id,
    title: posts.title,
    description: posts.description,
    status: posts.status,
    createdAt: posts.createdAt,
    authorName: user.name,
  })
  .from(posts)
  .innerJoin(user, eq(posts.authorId, user.id))
  .orderBy(desc(posts.createdAt));

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        {session ? (
  <PostForm />
) : (
  <p className="mb-8 rounded-lg border border-gray-300 p-4 text-sm">
    <Link href="/sign-in" className="text-blue-500 underline">
      Sign in
    </Link>{" "}
    or{" "}
    <Link href="/sign-up" className="text-blue-500 underline">
      create an account
    </Link>{" "}
    to suggest a feature.
  </p>
)}
      </h1>

      <ul className="space-y-4">
        {allPosts.map((post) => (
          <li key={post.id} className="rounded-lg border border-gray-300 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[post.status]}`}
              >
                {post.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{post.description}</p>
            <p className="mt-2 text-xs text-gray-500">by {post.authorName}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}