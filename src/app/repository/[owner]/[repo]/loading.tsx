/**
 * リポジトリ詳細ページのローディング UI
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>

        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          {/* ヘッダー */}
          <div className="mb-6 flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-6 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg bg-gray-300 dark:bg-gray-700"
              ></div>
            ))}
          </div>

          {/* 詳細情報 */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-gray-300 dark:bg-gray-700"></div>
            ))}
          </div>

          {/* ボタン */}
          <div className="mt-8">
            <div className="h-12 w-40 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
