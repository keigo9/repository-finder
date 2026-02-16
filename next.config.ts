import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true, // Partial Prerendering を有効化 (Next.js 16+)
  // クライアント側のルータキャッシュ保持時間
  experimental: {
    staleTimes: {
      dynamic: 300, // 動的ページを5分間キャッシュ（検索結果・詳細ページ）
      static: 180, // 静的ページを3分間キャッシュ
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        // すべてのページに適用
        source: "/:path*",
        headers: [
          // Content Security Policy - XSS 対策
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " + // Next.js の HMR と React Hydration に必要
              "style-src 'self' 'unsafe-inline'; " + // Tailwind CSS の inline スタイルに必要
              "img-src 'self' data: https://avatars.githubusercontent.com; " + // GitHub アバター画像を許可
              "font-src 'self'; " +
              "connect-src 'self' https://api.github.com; " + // GitHub API への接続を許可
              "frame-ancestors 'none';", // iframe での埋め込みを禁止
          },
          // クリックジャッキング攻撃への対策
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // MIME スニッフィング対策
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // リファラー情報の制御
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // ブラウザ機能の制限（位置情報、カメラ、マイクなど不要な機能を無効化）
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
