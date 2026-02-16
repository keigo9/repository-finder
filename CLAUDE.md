# GitHub Repository Finder

GitHub API を使用してリポジトリを検索・詳細表示するウェブアプリケーション

## 開発コマンド

### 基本コマンド

- `npm run dev` - 開発サーバー起動 (http://localhost:3000)
- `npm run build` - 本番ビルド
- `npm start` - 本番サーバー起動

### コード品質

- `npm run lint` - ESLint実行
- `npm run lint:fix` - ESLint自動修正
- `npm run format` - Prettier実行
- `npm run format:check` - Prettierチェックのみ

### テスト

- `npm test` - Jestテスト実行
- `npm run test:watch` - ウォッチモードでテスト

## コードスタイル

### Git Commit ルール

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメントのみの変更
- `style:` コードの意味に影響しない変更（空白、フォーマット、セミコロンなど）
- `refactor:` バグ修正も機能追加もしないコード変更
- `perf:` パフォーマンス改善
- `test:` テストの追加や修正
- `chore:` ビルドプロセスやツールの変更

## アーキテクチャ

### ディレクトリ構成

- `app/`: Next.js App Router（デフォルトはServer Component）
- `components/ui/`: 再利用可能なUIコンポーネント
- `components/home/`: ホームページ固有のコンポーネント
- `lib/`: ユーティリティ関数・APIクライアント
- `__tests__/`: テストファイル

### データフェッチとキャッシュ

- `searchRepositories()`: 5分間キャッシュ (`revalidate: 300`)
- `getRepository()`: 10分間キャッシュ (`revalidate: 600`)
- 両関数に `"use cache"` ディレクティブを付与
- `Suspense` でストリーミング対応（PPRによる最適化）

### テスト構成

- Jest + React Testing Library
- パスエイリアス `@/` → `src/` (jest.config.ts:15)

## 重要事項

### Next.js 16 固有の注意点

- **キャッシュ**: デフォルトでキャッシュされない。`searchRepositories()`, `getRepository()` に `"use cache"` を付与済み
- **searchParams / params**: Promise型で async で受け取る
- **PPR (Partial Prerendering)**: 静的コンテンツと動的コンテンツを自動分離して最適化

### エラーハンドリング

- 3種類のカスタムエラークラス (lib/github.ts):
  - `GitHubNotFoundError` - 404エラー → `notFound()` で not-found.tsx へ
  - `GitHubAPIError` - APIエラー（レート制限など） → error.tsx でキャッチ
  - `GitHubValidationError` - バリデーションエラー → error.tsx でキャッチ

### データ品質とセキュリティ

- **Zodバリデーション**: GitHub APIレスポンスの型安全性を実行時に保証
- **環境変数チェック**: 起動時に `lib/env.ts` が自動で検証、トークン未設定時は警告表示
- **DoS攻撃対策**: 検索クエリの最大長を256文字に制限

### SEO最適化

- 検索ページ・詳細ページで動的メタデータ生成
- OGP, Twitter Card 対応

### GitHub API 認証

- `.env.local` に `GITHUB_TOKEN` を設定（推奨: 5000 req/hour、未認証: 60 req/hour）
- トークン取得: <https://github.com/settings/tokens> (スコープ: `public_repo`)

## CI/CD

GitHub Actions (`.github/workflows/test.yml`) で Lint, Format, Test, Build を自動実行 (main ブランチへの PR/push)
