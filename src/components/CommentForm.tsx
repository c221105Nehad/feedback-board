"use client";

import { useActionState } from "react";
import { addComment, type CommentState } from "@/app/actions";

const initialState: CommentState = {};

export default function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, isPending] = useActionState(
    addComment.bind(null, postId),
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="body"
        rows={3}
        defaultValue={state.value}
        placeholder="Add a comment..."
        className="w-full rounded border border-gray-300 bg-transparent p-2"
      />

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}