"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  perPage: number;
}

/**
 * ページネーションコンポーネント
 */
export function Pagination({
  currentPage,
  totalCount,
  perPage,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // GitHub API は検索結果を最大1000件までしか返さない
  const maxResults = 1000;
  const totalPages = Math.min(
    Math.ceil(totalCount / perPage),
    Math.ceil(maxResults / perPage)
  );

  const getHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `/?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(getHref(page));
    });
  };

  // ページ番号のボタンを生成
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // 表示する最大ページ数

    if (totalPages <= maxVisible) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 省略表示
      if (currentPage <= 4) {
        // 最初の方
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 最後の方
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 中間
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {/* 前へボタン */}
      {currentPage === 1 ? (
        <span className="cursor-not-allowed rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium opacity-50 dark:border-gray-600">
          ← 前へ
        </span>
      ) : (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isPending}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          ← 前へ
        </button>
      )}

      {/* ページ番号 */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return isActive ? (
            <span
              key={pageNum}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white dark:bg-blue-500"
            >
              {pageNum}
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              disabled={isPending}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* 次へボタン */}
      {currentPage === totalPages ? (
        <span className="cursor-not-allowed rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium opacity-50 dark:border-gray-600">
          次へ →
        </span>
      ) : (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isPending}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          次へ →
        </button>
      )}
    </div>
  );
}
