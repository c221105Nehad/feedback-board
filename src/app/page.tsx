import { db } from "@/db";
import { posts, user, votes, statusEnum } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { z } from "zod";
import { auth } from "@/lib/auth";
import PostForm from "@/components/PostForm";
import VoteButton from "@/components/VoteButton";
import { Filters, Pagination } from "@/components/Filters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const querySchema = z.object({
  status: z.enum(statusEnum.enumValues).optional().catch(undefined),
  sort: z.enum(["top", "newest"]).catch("top"),
  page: z.coerce.number().int().min(1).catch(1),
});

const statusStyles: Record<string, string> = {
  open: "bg-gray-100 text-gray-700",
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-700",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { status, sort, page } = querySchema.parse(await searchParams);

  const session = await auth.api.getSession({ headers: await headers() });

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      status: posts.status,
      createdAt: posts.createdAt,
      authorName: user.name,
      voteCount: count(votes.userId),
    })
    .from(posts)
    .innerJoin(user, eq(posts.authorId, user.id))
    .leftJoin(votes, eq(votes.postId, posts.id))
    .where(status ? eq(posts.status, status) : undefined)
    .groupBy(posts.id, user.id)
    .orderBy(
      ...(sort === "top"
        ? [desc(count(votes.userId)), desc(posts.createdAt)]
        : [desc(posts.createdAt)])
    )
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);

  const hasNext = rows.length > PAGE_SIZE;
  const visiblePosts = rows.slice(0, PAGE_SIZE);

  const myVotes = session
    ? await db
        .select({ postId: votes.postId })
        .from(votes)
        .where(eq(votes.userId, session.user.id))
    : [];
  const votedIds = new Set(myVotes.map((v) => v.postId));

  const current = { status, sort, page };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Feedback Board</h1>

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

      <Filters current={current} />

      <ul className="space-y-4">
        {visiblePosts.map((post) => (
          <li
            key={post.id}
            className="flex gap-4 rounded-lg border border-gray-300 p-4"
          >
            <VoteButton
              postId={post.id}
              count={post.voteCount}
              voted={votedIds.has(post.id)}
              signedIn={!!session}
            />

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">
                  <Link href={`/posts/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[post.status]}`}
                >
                  {post.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {post.description}
              </p>
              <p className="mt-2 text-xs text-gray-500">by {post.authorName}</p>
            </div>
          </li>
        ))}

        {visiblePosts.length === 0 && (
          <li className="text-sm text-gray-500">
            No posts match this filter.
          </li>
        )}
      </ul>

      <Pagination current={current} hasNext={hasNext} />
    </main>
  );
}