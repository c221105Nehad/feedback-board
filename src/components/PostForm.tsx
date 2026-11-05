"use client";

import { useActionState } from "react";
import { createPost, type FormState } from "@/app/actions";

const initialState: FormState = {};

export default function PostForm() {
  const [state, formAction, isPending] = useActionState(
    createPost,
    initialState
  );

  return (
    <form
      action={formAction}
      className="mb-8 space-y-4 rounded-lg border border-gray-300 p-4"
    >
      <h2 className="text-lg font-semibold">Suggest a feature</h2>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={state.values?.title}
          className="w-full rounded border border-gray-300 bg-transparent p-2"
          placeholder="Short summary of your idea"
        />
        {state.errors?.title && (
          <p className="mt-1 text-sm text-red-500">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={state.values?.description}
          className="w-full rounded border border-gray-300 bg-transparent p-2"
          placeholder="Explain what you would like and why"
        />
        {state.errors?.description && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit"}
      </button>

      {state.message && (
        <p className="text-sm text-green-500">{state.message}</p>
      )}
    </form>
  );
}