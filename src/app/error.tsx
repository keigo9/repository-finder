"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * アプリ全体のエラーバウンダリ
 * 予期しないエラーをキャッチして表示
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
          <div className="mb-4 text-6xl">😵</div>
          <h1 className="mb-4 text-2xl font-bold text-red-900 dark:text-red-100">
            エラーが発生しました
          </h1>
          <p className="mb-6 text-sm text-red-700 dark:text-red-300">
            予期しないエラーが発生しました。
            <br />
            もう一度お試しください。
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 rounded bg-red-100 p-4 text-left dark:bg-red-900/40">
              <p className="break-all text-xs text-red-800 dark:text-red-200">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
            >
              もう一度試す
            </button>
            <Link
              href="/"
              className="flex-1 rounded-lg border border-red-300 bg-white px-6 py-3 font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-gray-700"
            >
              ホームへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
