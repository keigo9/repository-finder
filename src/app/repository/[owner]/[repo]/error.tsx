"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BackButton } from "@/components/common/back-button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * リポジトリページのエラーバウンダリ
 * リポジトリ取得時のエラーをキャッチして表示
 */
export default function RepositoryError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Repository page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <BackButton />

        <div className="rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-4">
            <div className="text-4xl">❌</div>
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-100">
                リポジトリの読み込みに失敗しました
              </h2>
              <p className="mb-4 text-sm text-red-700 dark:text-red-300">
                リポジトリ情報の取得中にエラーが発生しました。
                <br />
                時間をおいて再度お試しください。
              </p>
              {process.env.NODE_ENV === "development" && (
                <div className="mb-4 rounded bg-red-100 p-3 dark:bg-red-900/40">
                  <p className="break-all text-xs text-red-800 dark:text-red-200">
                    {error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => reset()}
                  className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  再試行
                </button>
                <Link
                  href="/"
                  className="rounded-lg border border-red-300 bg-white px-6 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-gray-700"
                >
                  検索に戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
