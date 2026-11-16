"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleVote } from "@/app/actions";

type VoteState = { count: number; voted: boolean };

export default function VoteButton({
  postId,
  count,
  voted,
  signedIn,
}: {
  postId: string;
  count: number;
  voted: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic<VoteState, boolean>(
    { count, voted },
    (current, nextVoted) => ({
      count: current.count + (nextVoted ? 1 : -1),
      voted: nextVoted,
    })
  );

  function handleClick() {
    if (!signedIn) {
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      setOptimistic(!optimistic.voted);
      await toggleVote(postId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimistic.voted ? "Remove your vote" : "Upvote"}
      className={`flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded border text-sm ${
        optimistic.voted
          ? "border-blue-500 bg-blue-500/10 text-blue-500"
          : "border-gray-300"
      }`}
    >
      <span>▲</span>
      <span className="font-semibold">{optimistic.count}</span>
    </button>
  );
}