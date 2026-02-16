import { Suspense } from "react";
import { SearchForm } from "@/components/common/search-form";
import { RepositoryList } from "@/components/home/repository-list";
import { Pagination } from "@/components/common/pagination";
import { searchRepositories } from "@/lib/github";

interface HomeProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

/**
 * ホームページ（検索ページ）
 * Server Component として実装
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Number(params.page) || 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* ヘッダー */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            GitHub Repository Finder
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            GitHub のリポジトリを検索できるよ!
          </p>
        </header>

        {/* 検索フォーム */}
        <div className="mb-8">
          <SearchForm />
        </div>

        {/* 検索結果 */}
        <Suspense key={`${query}-${page}`} fallback={<LoadingSkeleton />}>
          <SearchResults query={query} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * 検索結果を表示するServer Component
 */
async function SearchResults({ query, page }: { query: string; page: number }) {
  if (!query) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        キーワードを入力して検索してね!
      </div>
    );
  }

  // データ取得（エラーは自然にスロー）
  const data = await searchRepositories(query, page);

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {data.total_count.toLocaleString()} 件の結果が見つかりました
      </div>
      <RepositoryList repositories={data.items} />
      <Pagination
        currentPage={page}
        totalCount={data.total_count}
        perPage={30}
      />
    </div>
  );
}

/**
 * ローディング中のスケルトンUI
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
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
  );
}
