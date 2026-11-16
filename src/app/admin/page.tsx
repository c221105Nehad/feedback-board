import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, user, statusEnum } from "@/db/schema";
import { auth } from "@/lib/auth";
import { updatePostStatus } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "admin") notFound();

  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      authorName: user.name,
    })
    .from(posts)
    .innerJoin(user, eq(posts.authorId, user.id))
    .orderBy(desc(posts.createdAt));

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Admin</h1>

      <ul className="space-y-3">
        {allPosts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-gray-300 p-4"
          >
            <div className="min-w-0">
              <Link
                href={`/posts/${post.id}`}
                className="block truncate font-semibold hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-xs text-gray-500">by {post.authorName}</p>
            </div>

            <form action={updatePostStatus} className="flex items-center gap-2">
              <input type="hidden" name="postId" value={post.id} />
              <select
                name="status"
                defaultValue={post.status}
                className="rounded border border-gray-300 bg-transparent p-1 text-sm"
              >
                {statusEnum.enumValues.map((s) => (
                  <option key={s} value={s} className="text-black">
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
              >
                Save
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}