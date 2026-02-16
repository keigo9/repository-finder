# GitHub Repository Finder

GitHub のリポジトリを検索・詳細表示できるウェブアプリケーション 🔍✨

## 概要

GitHub API を使用してリポジトリを検索し、詳細情報を表示するウェブアプリケーション。
Next.js 16 の App Router、Server Components、PPR（Partial Prerendering）などの最新機能を活用。

## セットアップ

### 1. インストール

```bash
git clone <repository-url>
cd repository-finder
npm install
```

### 2. 環境変数の設定（推奨）

GitHub API のレート制限を改善するため、Personal Access Token の設定を推奨:

```bash
cp .env.local.example .env.local
# .env.local に GITHUB_TOKEN を設定
```

**トークン取得方法:**

1. https://github.com/settings/tokens にアクセス
2. "Generate new token (classic)" を選択
3. スコープ: `public_repo` のみ
4. 生成したトークンを `.env.local` に貼り付け

**レート制限:**

- 未認証: 60 req/hour
- **認証あり: 5000 req/hour** ← 推奨！

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 で起動 🚀

## 主なコマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint:fix     # Lint 自動修正
npm run format       # コードフォーマット
npm test             # テスト実行
```

## プロジェクトの詳細

- **[ACHIEVEMENTS.md](./ACHIEVEMENTS.md)** - 実装の工夫点・技術的な意思決定
  - パフォーマンス最適化（PPR、キャッシュ戦略）
  - セキュリティ対策（Zod バリデーション、CSP、DoS 対策）
  - アクセシビリティ、SEO、UI/UX の工夫
  - アーキテクチャ選定の理由（BFF 不採用、Tailwind 採用など）

- **[AI_INSTRUCTION.md](./AI_INSTRUCTION.md)** - Claude Code の活用方法
  - 開発フローと指示方法
  - 段階的な品質改善プロセス
