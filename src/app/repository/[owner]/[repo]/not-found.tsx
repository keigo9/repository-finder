import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";

/**
 * リポジトリが見つからない時の404ページ
 */
export default function RepositoryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <BackButton />

        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 text-7xl">🔍</div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            リポジトリが見つかりません
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            指定されたリポジトリは存在しないか、
            <br />
            アクセス権限がない可能性があります。
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-gray-900 px-8 py-3 font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            検索に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
