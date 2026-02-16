import Link from "next/link";

/**
 * 404 Not Found ページ
 * 存在しないページへのアクセス時に表示
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 text-9xl">🔍</div>
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-white">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          ページが見つかりません
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-gray-900 px-8 py-3 font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
