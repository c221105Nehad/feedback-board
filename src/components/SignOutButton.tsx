"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded border border-gray-300 px-3 py-1 text-sm"
    >
      Sign out
    </button>
  );
}