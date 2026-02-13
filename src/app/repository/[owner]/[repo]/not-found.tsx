import Link from "next/link";

/**
 * リポジトリが見つからない場合の404ページ
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            リポジトリが見つかりませんでした
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            指定されたリポジトリは存在しないか、アクセスできません。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
