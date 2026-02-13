# GitHub Repository Finder

GitHub のリポジトリを検索できるウェブアプリケーション 🔍✨

## 概要

このプロジェクトは、GitHub API を使用してリポジトリを検索し、詳細情報を表示するウェブアプリケーションです。
Next.js 14+ の App Router を活用し、モダンな技術スタックで構築されています。

## 主な機能

- 🔍 **リポジトリ検索**: キーワードでGitHubリポジトリを検索
- 📊 **詳細情報表示**: スター数、フォーク数、Issue数などの統計情報
- ⚡ **高速なレスポンス**: Next.js のキャッシュ戦略を活用
- 🎨 **レスポンシブデザイン**: モバイルにも対応
- 🌙 **ダークモード対応**: ライト/ダークテーマに対応

## 技術スタック

### フレームワーク・ライブラリ

- **Next.js 16.1+**: React フレームワーク（App Router使用）
- **React 19**: UI ライブラリ
- **TypeScript**: 型安全な開発

### スタイリング

- **Tailwind CSS 4**: ユーティリティファーストの CSS フレームワーク

### 開発ツール

- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマッター
- **Jest**: テストフレームワーク
- **React Testing Library**: React コンポーネントのテスト

### CI/CD

- **GitHub Actions**: 自動テストとビルド

## プロジェクト構成

```
.
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # ホームページ（検索ページ）
│   │   └── repository/          # リポジトリ詳細ページ
│   │       └── [owner]/[repo]/
│   │           ├── page.tsx     # 詳細ページ
│   │           ├── loading.tsx  # ローディング UI
│   │           └── not-found.tsx # 404 ページ
│   ├── components/              # コンポーネント
│   │   ├── search-form.tsx      # 検索フォーム (Client Component)
│   │   └── repository-list.tsx  # リポジトリ一覧 (Server Component)
│   └── lib/                     # ユーティリティ
│       └── github.ts            # GitHub API クライアント
├── jest.config.ts               # Jest 設定
└── .github/
    └── workflows/
        └── test.yml             # GitHub Actions ワークフロー
```

## セットアップ

### 必要な環境

- Node.js 20 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd repository-finder

# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Linter 実行
npm run lint

# Linter 実行（自動修正）
npm run lint:fix

# フォーマット実行
npm run format

# フォーマットチェック
npm run format:check

# テスト実行
npm test

# テスト実行（watch モード）
npm run test:watch
```

## Next.js App Router の活用ポイント

### Server Components

- `app/page.tsx`: 検索結果を Server Component で取得
- `components/repository-list.tsx`: リポジトリ一覧を Server Component で描画

### Client Components

- `components/search-form.tsx`: 検索フォームは Client Component（`useRouter`, `useState` を使用）

### キャッシュ戦略

GitHub API のリクエストに Next.js の `revalidate` オプションを使用:

- 検索結果: 5分間キャッシュ（`revalidate: 300`）
- リポジトリ詳細: 10分間キャッシュ（`revalidate: 600`）

### Dynamic Routes

- `/repository/[owner]/[repo]`: Dynamic Route でリポジトリ詳細ページを実装

### Streaming & Suspense

- `Suspense` でローディング UI を表示
- スケルトン UI でユーザー体験を向上

## テスト

全てのコアロジックとコンポーネントにテストを実装しています:

- `src/lib/__tests__/github.test.ts`: GitHub API クライアントのテスト
- `src/components/__tests__/repository-list.test.tsx`: コンポーネントのテスト

## CI/CD

GitHub Actions で以下を自動実行:

- Linter チェック
- フォーマットチェック
- テスト実行
- ビルド確認

main ブランチへの Pull Request および push 時に実行されます。

## AI の使用について

このプロジェクトの実装には、Claude Code（Anthropic の AI アシスタント）を使用しました。
コードの生成、テストの作成、ドキュメント作成などを AI の支援を受けて行っています。

## ライセンス

MIT

## 作成者

作成日: 2026年2月13日

🤖 Generated with [Claude Code](https://claude.com/claude-code)
