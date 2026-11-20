"use server";

import { posts, votes, comments, statusEnum } from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
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

const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment must be 500 characters or fewer"),
});

export type CommentState = {
  error?: string;
  value?: string;
  success?: boolean;
};

export async function addComment(
  postId: string,
  prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "You must be signed in to comment." };
  }

  const id = z.uuid().safeParse(postId);
  if (!id.success) {
    return { error: "Invalid post." };
  }

  const raw = String(formData.get("body") ?? "");
  const parsed = commentSchema.safeParse({ body: raw });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, value: raw };
  }

  await db.insert(comments).values({
    postId: id.data,
    authorId: session.user.id,
    body: parsed.data.body,
  });

  revalidatePath(`/posts/${id.data}`);
  return { success: true };
}

const statusUpdateSchema = z.object({
  postId: z.uuid(),
  status: z.enum(statusEnum.enumValues),
});

export async function updatePostStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }

  const parsed = statusUpdateSchema.safeParse({
    postId: formData.get("postId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await db
    .update(posts)
    .set({ status: parsed.data.status })
    .where(eq(posts.id, parsed.data.postId));

  revalidatePath("/");
  revalidatePath(`/posts/${parsed.data.postId}`);
  revalidatePath("/admin");
}

const deletePostSchema = z.object({ postId: z.uuid() });

export async function deletePost(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }

  const parsed = deletePostSchema.safeParse({
    postId: formData.get("postId"),
  });
  if (!parsed.success) return;

  await db.delete(posts).where(eq(posts.id, parsed.data.postId));

  revalidatePath("/");
  revalidatePath("/admin");
}

const deleteCommentSchema = z.object({
  commentId: z.uuid(),
  postId: z.uuid(),
});

export async function deleteComment(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }

  const parsed = deleteCommentSchema.safeParse({
    commentId: formData.get("commentId"),
    postId: formData.get("postId"),
  });
  if (!parsed.success) return;

  await db.delete(comments).where(eq(comments.id, parsed.data.commentId));

  revalidatePath(`/posts/${parsed.data.postId}`);
}