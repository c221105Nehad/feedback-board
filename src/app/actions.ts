"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, votes } from "@/db/schema";
import { auth } from "@/lib/auth";

const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or fewer"),
});

export type FormState = {
  errors?: {
    title?: string[];
    description?: string[];
  };
  message?: string;
  values?: { title: string; description: string };
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { message: "You must be signed in to post." };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const parsed = postSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
    };
  }

  await db.insert(posts).values({
    title: parsed.data.title,
    description: parsed.data.description,
    authorId: session.user.id,
  });

  revalidatePath("/");
  return { message: "Post created!" };
}

export async function toggleVote(postId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  const id = z.uuid().safeParse(postId);
  if (!id.success) return;

  const userId = session.user.id;

  const inserted = await db
    .insert(votes)
    .values({ userId, postId: id.data })
    .onConflictDoNothing()
    .returning({ postId: votes.postId });

  if (inserted.length === 0) {
    await db
      .delete(votes)
      .where(and(eq(votes.userId, userId), eq(votes.postId, id.data)));
  }

  revalidatePath("/");
}