"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 検索ページに戻るボタン（検索状態を保持）
 */
export function BackButton() {
  const [backUrl, setBackUrl] = useState("/");

  useEffect(() => {
    // sessionStorage から検索状態を取得
    const savedState = sessionStorage.getItem("searchState");
    if (savedState) {
      try {
        const { query, page } = JSON.parse(savedState);
        if (query) {
          setBackUrl(`/?q=${encodeURIComponent(query)}${page ? `&page=${page}` : ""}`);
        }
      } catch (e) {
        console.error("Failed to parse search state:", e);
      }
    }
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
