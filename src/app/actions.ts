"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { posts } from "@/db/schema";

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
    authorId: "anonymous",
  });

  revalidatePath("/");
  return { message: "Post created!" };
}