import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { posts, comments, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import CommentForm from "@/components/CommentForm";
import { cache } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  open: "bg-gray-100 text-gray-700",
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-700",
};

const getPost = cache(async (id: string) => {
  const [post] = await db
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
    .where(eq(posts.id, id))
    .limit(1);

  return post;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!z.uuid().safeParse(id).success) return { title: "Post not found" };

  const post = await getPost(id);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.description.slice(0, 160),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });

  const post = await getPost(id);
  if (!post) {
    notFound();
  }

  const postComments = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      authorName: user.name,
    })
    .from(comments)
    .innerJoin(user, eq(comments.authorId, user.id))
    .where(eq(comments.postId, id))
    .orderBy(asc(comments.createdAt));

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm text-blue-500 underline">
        ← Back to all posts
      </Link>

      <article className="mt-4 rounded-lg border border-gray-300 p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[post.status]}`}
          >
            {post.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-gray-600 dark:text-gray-300">
          {post.description}
        </p>
        <p className="mt-4 text-xs text-gray-500">
          by {post.authorName} ·{" "}
          {post.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
        </p>
      </article>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          Comments ({postComments.length})
        </h2>

        <ul className="mb-6 space-y-3">
          {postComments.map((c) => (
            <li key={c.id} className="rounded-lg border border-gray-300 p-3">
              <p className="whitespace-pre-wrap text-sm">{c.body}</p>
              <p className="mt-2 text-xs text-gray-500">
                {c.authorName} ·{" "}
                {c.createdAt.toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })}
              </p>
            </li>
          ))}
          {postComments.length === 0 && (
            <li className="text-sm text-gray-500">No comments yet.</li>
          )}
        </ul>

        {session ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm">
            <Link href="/sign-in" className="text-blue-500 underline">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        )}
      </section>
    </main>
  );
}