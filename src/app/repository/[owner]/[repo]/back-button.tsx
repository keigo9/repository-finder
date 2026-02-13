"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * sessionStorage から検索状態を取得して、戻るURLを生成する
 */
function getBackUrl(): string {
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
}

/**
 * 検索ページに戻るボタン（検索状態を保持）
 */
export function BackButton() {
  const [backUrl] = useState(getBackUrl);

  return (
    <Link
      href={backUrl}
      className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      ← 検索に戻る
    </Link>
  );
}
