import Link from "next/link";
import { statusEnum } from "@/db/schema";

export type ListParams = {
  status?: string;
  sort: "top" | "newest";
  page: number;
};

function href(current: ListParams, overrides: Partial<ListParams>) {
  const next = { ...current, ...overrides };
  const sp = new URLSearchParams();

  if (next.status) sp.set("status", next.status);
  if (next.sort !== "top") sp.set("sort", next.sort);
  if (next.page > 1) sp.set("page", String(next.page));

  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

function pill(active: boolean) {
  return `rounded border px-3 py-1 text-sm ${
    active ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-gray-300"
  }`;
}

export function Filters({ current }: { current: ListParams }) {
  const tabs = [
    { label: "All", value: undefined as string | undefined },
    ...statusEnum.enumValues.map((s) => ({
      label: s.replace("_", " "),
      value: s as string | undefined,
    })),
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={href(current, { status: tab.value, page: 1 })}
            className={pill(current.status === tab.value)}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Sort by:</span>
        <Link
          href={href(current, { sort: "top", page: 1 })}
          className={pill(current.sort === "top")}
        >
          Top
        </Link>
        <Link
          href={href(current, { sort: "newest", page: 1 })}
          className={pill(current.sort === "newest")}
        >
          Newest
        </Link>
      </div>
    </div>
  );
}

export function Pagination({
  current,
  hasNext,
}: {
  current: ListParams;
  hasNext: boolean;
}) {
  if (current.page === 1 && !hasNext) return null;

  return (
    <div className="mt-6 flex items-center justify-between text-sm">
      {current.page > 1 ? (
        <Link
          href={href(current, { page: current.page - 1 })}
          className={pill(false)}
        >
          ← Previous
        </Link>
      ) : (
        <span />
      )}

      <span className="text-gray-500">Page {current.page}</span>

      {hasNext ? (
        <Link
          href={href(current, { page: current.page + 1 })}
          className={pill(false)}
        >
          Next →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}