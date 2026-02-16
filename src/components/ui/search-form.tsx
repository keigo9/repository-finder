"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

// 検索クエリの最大文字数（DoS 攻撃対策）
const MAX_QUERY_LENGTH = 256;

/**
 * リポジトリ検索フォームコンポーネント
 */
export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery && trimmedQuery.length <= MAX_QUERY_LENGTH) {
      startTransition(() => {
        router.push(`/?q=${encodeURIComponent(trimmedQuery)}`);
      });
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="リポジトリを検索..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            autoFocus
            maxLength={MAX_QUERY_LENGTH}
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isPending ? "検索中..." : "検索"}
          </button>
        </div>
      </form>

      {/* ローディング中のスケルトンUI */}
      {isPending && (
        <div className="mt-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex gap-4">
                    <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
