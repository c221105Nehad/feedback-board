import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="border-b border-gray-300">
      <nav className="mx-auto flex max-w-2xl items-center justify-between p-4">
        <Link href="/" className="font-bold">
          Feedback Board
        </Link>

        {session ? (
          <div className="flex items-center gap-3 text-sm">
            {session.user.role === "admin" && (
              <Link href="/admin" className="underline">
                Admin
              </Link>
            )}
            <span>{session.user.name}</span>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>
            <Link href="/sign-up" className="underline">
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}