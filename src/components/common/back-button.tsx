"use client";

import Link from "next/link";
import { useMemo } from "react";

/**
 * 検索ページに戻るボタン（検索状態を保持）
 */
export function BackButton() {
  const backUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "/";
    }

    const savedState = sessionStorage.getItem("searchState");
    if (!savedState) {
      return "/";
    }

    try {
      const { query, page } = JSON.parse(savedState);
      if (query) {
        return `/?q=${encodeURIComponent(query)}${page ? `&page=${page}` : ""}`;
      }
    } catch (e) {
      console.error("Failed to parse search state:", e);
    }

    return "/";
  }, []);

  return (
    <Link
      href={backUrl}
      className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      ← 検索に戻る
    </Link>
  );
}
