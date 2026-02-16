import { Suspense } from "react";
import { SearchForm } from "@/components/ui/search-form";
import { RepositoryList } from "@/components/home/repository-list";
import { Pagination } from "@/components/ui/pagination";
import { searchRepositories } from "@/lib/github";

interface HomeProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

/**
 * ホームページ（検索ページ）
 *
 * PPR (Partial Prerendering) により以下のように最適化される：
 * 1. Header（静的）→ ビルド時に事前レンダリング
 * 2. SearchForm（Client Component + Suspense）→ useSearchParams が動的データのため Suspense で囲む
 * 3. SearchResults（Suspense）→ 動的データをストリーミングで段階的に配信
 *
 * Next.js 16 では useSearchParams() などの動的データアクセスも Suspense が必要
 */
export default function Home({ searchParams }: HomeProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 静的コンテンツ：PPR により事前レンダリング */}
        <Header />

        {/* Client Component：useSearchParams を使用するため Suspense で囲む */}
        <div className="mb-8">
          <Suspense fallback={<SearchFormSkeleton />}>
            <SearchForm />
          </Suspense>
        </div>

        {/* 動的コンテンツ：searchParams の await と検索結果を Suspense 内で処理 */}
        <Suspense fallback={<LoadingSkeleton />}>
          <SearchResultsWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * 検索結果ラッパー
 * searchParams を await して SearchResults に渡す
 */
async function SearchResultsWrapper({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Number(params.page) || 1;

  return <SearchResults query={query} page={page} />;
}

/**
 * ヘッダーコンポーネント
 */
function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        GitHub Repository Finder
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        GitHub のリポジトリを検索できるよ!
      </p>
    </header>
  );
}

/**
 * 検索結果を表示するServer Component
 * エラーは自然にスローされ、error.tsx でキャッチされる
 */
async function SearchResults({ query, page }: { query: string; page: number }) {
  if (!query) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        キーワードを入力して検索してね!
      </div>
    );
  }

  // データ取得（エラーは error.tsx でキャッチされる）
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
 * 検索フォームのローディングスケルトン
 */
function SearchFormSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
      <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
    </div>
  );
}

/**
 * 検索結果のローディングスケルトン
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
