# 🎯 実装の工夫点・凝った点

## 1. 🚀 パフォーマンス

### Partial Pre Rendering (PPR) の導入

- **Next.js 16 の最新機能を活用** (`next.config.ts:5`)
- 静的シェル（BackButtonなど）を即座に表示し、動的コンテンツをストリーミング配信
- ユーザー体験を損なわずにパフォーマンスを最適化

### 適切なキャッシュ戦略

- **`"use cache"` ディレクティブの活用** (`lib/github.ts:60,111`)
  - Next.js 16 ではデータ取得がデフォルトで非キャッシュなので、明示的に付与

- **段階的な revalidate 設定**
  - **検索結果: 5分間キャッシュ** (`revalidate: 300`)
    - 検索結果は比較的頻繁に更新される可能性がある
    - しかし毎回APIを叩くと無駄が多い
    - 5分間という短めの期間で新鮮さとパフォーマンスのバランスを取る

  - **リポジトリ詳細: 10分間キャッシュ** (`revalidate: 600`)
    - リポジトリの基本情報（stars, forks など）は頻繁には変わらない
    - 検索結果より長めの10分間キャッシュで API リクエストを削減
    - リアルタイム性を求められない情報なので、やや長めの設定が適切

- **API レート制限への対策**
  - **GitHub API の制約と認証による改善**:
    - 未認証: 60 req/hour（1時間あたり60リクエスト）
    - **Personal Access Token による認証**: 5000 req/hour に向上
    - 環境変数 `GITHUB_TOKEN` にトークンを設定するだけ (`lib/github.ts:81-85, 127-130`)

  - **認証 + キャッシュの二重対策**:
    - **認証**: 5000 req/hour の大容量
    - **キャッシュ**: 同じリクエストを5〜10分間再利用
    - 複数ユーザーが同じコンテンツにアクセスしても、キャッシュがヒットすれば API リクエストは発生しない

  - **認証の実装方法**:
    - `.env.local` に `GITHUB_TOKEN` を設定
    - GitHub の Personal Access Token を取得（スコープ: `public_repo`）
    - サーバーサイド（Server Components）で自動的に認証ヘッダーを付与
    - ユーザー側でのログイン不要（サーバー側で完結）

  - **結果**: 認証 + キャッシュにより、実質的に無制限に近い使用が可能

### Server/Client Components の最適な分離

- **デフォルトで Server Component を採用**
  - データフェッチは全て Server Component で実行
  - JavaScriptバンドルサイズを最小化
- **Client Component は必要最小限**
  - インタラクティブな UI のみ（SearchForm, BackButton, Error）
  - `"use client"` を最小粒度で使用

### ストリーミングレンダリング

- **Suspense による段階的レンダリング** (`app/page.tsx:30`)
  - 検索結果を待たずにページシェルを表示
  - スケルトン UI で読み込み状態を可視化
  - 体感的なパフォーマンス向上

### 画像最適化

- **Next.js Image コンポーネントの活用** (`app/repository/[owner]/[repo]/page.tsx:79`)
  - 自動的な画像サイズ最適化
  - 遅延読み込み（Lazy Loading）
  - リモート画像のホワイトリスト設定 (`next.config.ts:7-13`)

### ページネーションによるデータ取得の最適化

- **無限スクロールではなくページネーション採用** (`components/ui/pagination.tsx`)
  - **一度に取得するデータ量を制限**: 1ページあたり30件固定
  - **API リクエスト削減**: 必要なページのみをリクエスト
  - **メモリ効率**: 大量のデータを一度にレンダリングしない

- **キャッシュとの相乗効果**
  - ページごとに独立してキャッシュされる
  - よく閲覧される最初のページはキャッシュヒット率が高い
  - トータルで API リクエスト数を大幅削減

---

## 2. ♿ アクセシビリティ（a11y）

### セマンティックHTML

- **適切な HTML タグの使用**
  - `<header>`, `<form>`, `<button>` など意味のあるタグ構成
  - スクリーンリーダーでの読み上げに配慮

### フォーカス管理

- **視覚的なフォーカスインジケータ** (`components/ui/search-form.tsx:29`)
  - `focus:ring-2` による明確なフォーカス表示
  - キーボード操作ユーザーへの配慮
- **autoFocus によるUX改善** (`components/ui/search-form.tsx:30`)
  - ページ読み込み時に検索フィールドに自動フォーカス

### 支援技術への対応

- **aria-hidden の適切な使用** (`app/repository/[owner]/[repo]/page.tsx:156`)
  - 装飾的なSVGアイコンをスクリーンリーダーから隠す
- **alt 属性の必須化** (`app/repository/[owner]/[repo]/page.tsx:82`)
  - 画像の代替テキストを適切に設定

### キーボード操作対応

- **フォーム送信のハンドリング** (`components/ui/search-form.tsx:14`)
  - Enter キーでの検索実行
  - ボタンクリックとキーボード操作の両対応

---

## 3. 🔍 SEO

### Server-Side Rendering

- **Server Components によるSSR**
  - 初回アクセス時に完全なHTMLを生成
  - クローラーが正しくコンテンツを認識可能

### 動的メタデータの実装

- **検索ページの動的メタデータ** (`app/page.tsx:16-58`)
  - 検索クエリに応じた title/description の生成
    - 例: `"react" の検索結果 - 2ページ目 | GitHub Repository Finder`
  - ページ番号も含めた詳細な SEO 対応
  - 検索クエリがない場合はデフォルトのメタデータを表示

- **リポジトリ詳細ページの動的メタデータ** (`app/repository/[owner]/[repo]/page.tsx:23-74`)
  - リポジトリ情報を反映した title/description
    - 例: `facebook/react | GitHub Repository Finder`
  - リポジトリの description を活用した詳細な説明文
  - エラー時も適切なメタデータを返す（404、API エラー）

### OGP（Open Graph Protocol）対応

- **SNS シェア最適化** (`app/layout.tsx:20-26`, `app/page.tsx:28-37`, `app/repository/[owner]/[repo]/page.tsx:36-49`)
  - ページごとに最適化された OGP タグ
  - リポジトリ詳細ページではリポジトリオーナーのアバター画像を使用
  - `og:title`, `og:description`, `og:type`, `og:image`, `og:locale` を適切に設定
  - Twitter でもリッチプレビューが表示される

- **metadataBase の設定** (`app/layout.tsx:19`)
  - OGP 画像などの相対 URL を絶対 URL に変換
  - canonical URL の基準となる URL を設定

### Twitter カード対応

- **Twitter シェア最適化** (`app/layout.tsx:27-32`, `app/page.tsx:33-37`, `app/repository/[owner]/[repo]/page.tsx:51-58`)
  - `summary` カードタイプで画像付きプレビュー
  - ページごとに最適化された title/description/images
  - リポジトリ詳細ページではリポジトリオーナーのアバター画像を使用

### robots 設定

- **クローラー制御** (`app/layout.tsx:33-36`)
  - `index: true` - 検索エンジンにインデックス許可
  - `follow: true` - リンクのクロール許可
  - 検索エンジンに適切にコンテンツを認識させる

### セマンティックな構造

- **適切な見出し階層**
  - `<h1>` はページに1つのみ
  - 論理的な情報階層の構築

---

## 4. 🎨 UI/UX

### 検索状態の保持（sessionStorage 活用）

- **戻るボタンで元のページに正確に戻れる UX** (`components/ui/back-button.tsx`, `components/home/repository-list.tsx`)
  - **問題**: 通常、詳細ページから戻ると検索結果の1ページ目に戻ってしまう
  - **解決策**: sessionStorage で検索クエリとページ番号を記録

- **なぜ sessionStorage なのか？**

  他の選択肢と比較した上で、sessionStorage が最適と判断：
  1. **localStorage との比較**
     - ❌ localStorage: ブラウザを閉じても永続的に残る → 古い検索履歴が残り続ける
     - ✅ sessionStorage: タブを閉じたら自動削除 → プライバシー配慮 & ストレージ容量節約
     - 検索状態は「一時的な閲覧セッション」に紐づくべきなので sessionStorage が適切

  2. **URL パラメータとの比較**
     - ❌ URL パラメータ: 戻るボタンの URL に `?from=search&q=react&page=3` のように埋め込む必要がある
     - 詳細ページの URL が複雑化・冗長化してしまう
     - ✅ sessionStorage: URL はシンプルなまま、状態は裏側で保持

  3. **React Context/State との比較**
     - ❌ React Context: ページ遷移（フルリロード）で状態が消える
     - ❌ クライアントサイド状態管理: リロード時に消える、複数タブで共有されない
     - ✅ sessionStorage: ページ遷移・リロードしても状態が保持される

  4. **Cookie との比較**
     - ❌ Cookie: 毎回サーバーに送信される → 不要なオーバーヘッド
     - ✅ sessionStorage: クライアント側のみで完結 → サーバーリクエストに影響なし

- **ユーザー体験への効果**:
  - 「検索 → 3ページ目を見る → リポジトリ詳細 → 戻る」の流れで、ちゃんと3ページ目に戻れる
  - 検索条件を再入力する手間がゼロ
  - ブラウザのタブを閉じるまで状態が保持される（sessionStorage の特性）
  - タブごとに独立した検索セッションを保持（複数タブで異なる検索結果を見る場合も混在しない）

### レスポンシブデザイン

- **モバイルファーストアプローチ** (`app/repository/[owner]/[repo]/page.tsx:105`)
  - `grid-cols-2 sm:grid-cols-4` による段階的レイアウト
  - あらゆるデバイスサイズで最適表示

### ローディング状態の可視化

- **スケルトンUI の実装** (`app/page.tsx:88-112`)
  - アニメーション付きプレースホルダー
  - ローディング中でもレイアウトシフトなし
  - 体感速度の大幅改善

### エラー状態の親切な表示

- **階層的なエラーハンドリング** (`app/error.tsx`)
  - 開発環境ではエラー詳細を表示

### ページネーション

- **無限スクロールではなくページネーション採用**
  - URL に page パラメータを含む
  - 特定ページへの直接アクセスが可能
  - ブラウザの戻る/進むボタンが正常動作

---

## 5. 🔒 セキュリティ

### GitHub API 認証のセキュリティ

- **環境変数によるシークレット管理** (`.env.local.example`, `lib/github.ts:81-85, 127-130`)
  - **Personal Access Token をサーバー側で管理**:
    - `.env.local` に `GITHUB_TOKEN` を保存
    - クライアントに露出しない（`NEXT_PUBLIC_` プレフィックスを使わない）
    - Server Components でのみアクセス可能

  - **トークンの最小権限設定**:
    - スコープ: `public_repo` のみ（パブリックリポジトリの読み取り専用）
    - プライベートリポジトリへのアクセス権限は付与しない
    - 万が一漏洩しても被害を最小化

  - **ユーザー認証不要の設計**:
    - サーバー側で共通のトークンを使用
    - ユーザーがログインする必要がない
    - OAuth フローの実装不要 → セキュリティリスク削減

- **レート制限の改善**:
  - 未認証: 60 req/hour → 認証: 5000 req/hour
  - DoS 攻撃のリスク低減
  - サービスの安定性向上

### Zod によるランタイムバリデーション

- **API レスポンスの厳格な検証** (`lib/github.ts:28-56, 119-129, 181-191`)
  - **Zod スキーマによる型定義**:
    - `GitHubRepositorySchema`: リポジトリ情報のスキーマ
    - `GitHubSearchResponseSchema`: 検索結果のスキーマ
    - TypeScript の型を Zod スキーマから導出 (`z.infer`)

  - **ランタイムバリデーションの実装**:
    - API レスポンスを受け取った時点でバリデーション実行
    - `safeParse()` で安全にパース
    - 不正なデータ形式を即座に検出

  - **なぜランタイムバリデーションが必要か？**:
    - TypeScript はコンパイル時のみ型チェック
    - 実行時には外部 API からどんなデータが来るか保証されない
    - GitHub API の仕様変更やバグによる予期しないレスポンスを防御
    - 悪意のある中間者攻撃による改ざんデータを検出

  - **エラーハンドリング**:
    - バリデーション失敗時は `GitHubValidationError` をスロー
    - エラー詳細をコンソールに出力（デバッグ支援）
    - ユーザーには適切なエラー画面を表示

  - **セキュリティへの貢献**:
    - 不正なデータによるアプリケーションクラッシュを防止
    - XSS 攻撃のベクターとなる可能性のある不正データを排除
    - データ構造の検証により、予期しないフィールドやデータ型を拒否

### 外部リンク対策

- **rel="noopener noreferrer" の付与** (`app/repository/[owner]/[repo]/page.tsx:149`)
  - タブナビング攻撃への対策
  - リファラー情報の漏洩防止

### XSS 対策

- **URL パラメータのエスケープ** (`components/ui/search-form.tsx:21`)
  - `encodeURIComponent()` による適切なエンコード
  - React の自動エスケープも併用

### セキュリティヘッダー

- **包括的なセキュリティヘッダーの設定** (`next.config.ts:14-56`)
  - **Content-Security-Policy (CSP)**:
    - XSS 攻撃への多層防御
    - 許可するリソース元を明示的に制限
    - GitHub API と画像のみを許可リストに登録
    - iframe での埋め込みを禁止 (`frame-ancestors 'none'`)

  - **X-Frame-Options: DENY**:
    - クリックジャッキング攻撃への対策
    - iframe での表示を完全に禁止

  - **X-Content-Type-Options: nosniff**:
    - MIME スニッフィング攻撃への対策
    - ブラウザによる Content-Type の推測を防止

  - **Referrer-Policy: strict-origin-when-cross-origin**:
    - リファラー情報の適切な制御
    - クロスオリジンリクエスト時はオリジンのみ送信

  - **Permissions-Policy**:
    - 不要なブラウザ機能を無効化
    - カメラ、マイク、位置情報へのアクセスを禁止

### 入力バリデーション

- **検索クエリの長さ制限** (`components/ui/search-form.tsx:7, lib/github.ts:60`)
  - **多層防御の実装**:
    - **フロントエンド**: `maxLength` 属性で 256 文字に制限
    - **バックエンド**: サーバーサイドでも同じ検証を実施
    - クライアント側のバリデーションをバイパスされても防御

  - **DoS 攻撃対策**:
    - 極端に長いクエリによるリクエスト負荷を防止
    - GitHub API への過大なリクエストを回避
    - サーバーリソースの保護

  - **エラーハンドリング**:
    - 長さ制限超過時は `GitHubValidationError` をスロー
    - ユーザーに適切なエラーメッセージを表示

### 環境変数のバリデーション

- **起動時チェック機能** (`lib/env.ts`)
  - **GITHUB_TOKEN の検証**:
    - トークン未設定時に警告を表示
    - レート制限の影響をユーザーに通知
    - トークン形式の妥当性チェック（最低限の長さ）

  - **NEXT_PUBLIC_SITE_URL の確認**:
    - 未設定時はデフォルト値を使用
    - 本番環境での設定を推奨

  - **初回のみ実行**:
    - パフォーマンスへの影響を最小化
    - 複数回の重複チェックを防止

  - **開発体験の向上**:
    - 設定ミスを早期発見
    - 適切なログメッセージで解決方法を提示

### 型安全性

- **TypeScript による堅牢な型システム**
  - 全コンポーネント・関数で型定義
  - `strict: true` による厳格な型チェック (`tsconfig.json:7`)
  - ランタイムエラーの事前防止

### カスタムエラークラス

- **エラー種別の明確化** (`lib/github.ts:2-17`)
  - `GitHubNotFoundError`: 404 専用
  - `GitHubAPIError`: その他の API エラー
  - 適切なエラーハンドリングを実現

---

## 6. 🧪 テスト

### テスト環境のセットアップ

- **Jest + React Testing Library の導入** (`jest.config.ts`)
  - コンポーネントのユニットテスト準備
  - jsdom 環境でのブラウザ API エミュレーション

### パスエイリアス設定

- **テストでも `@/` エイリアスが使用可能** (`jest.config.ts:14-16`)
  - 本番コードと同じ import パス
  - リファクタリング時の変更容易性

### CI/CD パイプライン

- **GitHub Actions による自動テスト** (`.github/workflows/test.yml`)
  - PR/push 時の自動実行
  - テスト失敗時の早期検知

---

## 7. 🛠️ DX（Developer Experience）

### TypeScript による開発体験向上

- **厳格な型システム**
  - 自動補完による開発速度向上
  - リファクタリングの安全性
  - ドキュメントとしての型定義

### コード品質管理

- **ESLint + Prettier の統合** (`eslint.config.mjs`)
  - `eslint-config-next` による Next.js ベストプラクティス適用
  - `eslint-plugin-prettier` でフォーマットとリントを統合
  - 自動修正機能による手間削減
- **npm スクリプトの充実** (`package.json:5-14`)
  - `lint:fix`, `format` による一発修正
  - `test:watch` による開発効率化

### パスエイリアス

- **`@/` による簡潔な import** (`tsconfig.json:21-23`)
  - 相対パス地獄からの解放
  - ファイル移動時の変更最小化

### コンポーネント設計

- **責務の明確な分離**
  - UI コンポーネント (`components/ui/`)
  - ページ固有コンポーネント (`components/home/`)
  - ユーティリティ (`lib/`)
- **小さなコンポーネントへの分解** (`app/repository/[owner]/[repo]/page.tsx`)
  - `RepositoryHeader`, `RepositoryStats` など単一責任
  - 再利用性とテスタビリティの向上

### JSDoc コメント

- **関数の役割を明確に記述** (`lib/github.ts:47-54`)
  - IDE での自動補完時にドキュメント表示
  - TypeScript の型情報と併用

### ファイル構成

- **Next.js App Router の規約に準拠**
  - `page.tsx`, `error.tsx`, `not-found.tsx` の階層配置
  - 直感的なルーティング構造

---

## 8. 📊 監視・分析

### CI/CD パイプライン

- **4段階の品質チェック** (`.github/workflows/test.yml:28-38`)
  1. ESLint によるコード品質チェック
  2. Prettier によるフォーマットチェック
  3. Jest によるテスト実行
  4. ビルド確認
- **main ブランチへのマージ前に自動検証**
  - コード品質の維持
  - リグレッションの早期発見

### エラーロギング

- **開発時のデバッグ支援** (`app/error.tsx:17-21`)
  - `console.error` によるエラー詳細出力
  - エラーバウンダリでのキャッチ
  - ブラウザの開発者ツールで即座に確認可能

- **本番環境での情報隠蔽** (`app/error.tsx:33-39`)
  - 開発環境のみでエラーメッセージ表示
  - 本番環境ではユーザーにエラー詳細を見せない
  - セキュリティリスクの低減

### パフォーマンス監視の準備

- **Next.js の組み込み Analytics 対応可能**
  - Vercel Analytics への拡張容易
  - Web Vitals の計測準備完了

---

## 9. 🏗️ アーキテクチャ設計の意思決定

### BFF（Backend for Frontend）を採用しない判断

- **採用しなかった理由**:
  - **Next.js Server Components が BFF の役割を果たす** (`lib/github.ts`)
    - Server Components 内で GitHub API を直接呼び出し
    - サーバーサイドでのデータフェッチ・整形が可能
    - 追加のBFFサーバーを立てる必要がない

  - **シンプルなアプリケーション要件**:
    - 外部 API は GitHub API のみ
    - 複数の API を組み合わせる必要がない
    - 複雑なビジネスロジックや認証が不要

  - **運用コストの削減**:
    - BFF サーバーのデプロイ・管理が不要
    - インフラが単純化（Next.js アプリだけで完結）
    - Vercel などへのデプロイが容易

- **Next.js との整合性**:
  - Next.js 16 の Server Components は「サーバーサイドロジック」を自然に書ける
  - BFF を挟むと、Server Component の利点が薄れる
  - フレームワークの思想（Server Components でのデータフェッチ）に沿った設計

### API クライアントライブラリの不採用（React Query / SWR / Axios）

- **採用しなかった理由**:
  - **Server Components でのデータフェッチは `fetch` で完結** (`lib/github.ts`)
    - Next.js 16 の `fetch` は自動的にキャッシュ・再検証をサポート
    - `"use cache"` ディレクティブと `revalidate` オプションで十分
    - React Query や SWR のようなクライアント側のキャッシュ機構が不要

  - **React Query / SWR はクライアント側のデータフェッチ用**:
    - これらのライブラリは「Client Components でのデータ取得」を想定
    - Server Components では、サーバーサイドで完結するため利点が薄い
    - クライアントバンドルサイズが増える（React Query: 約40KB）

  - **Axios は過剰**:
    - ブラウザの `fetch` API で十分な機能
    - Axios の利点（インターセプター、リクエスト変換）は、シンプルな GitHub API 呼び出しでは不要
    - 追加の依存関係を増やすコストが価値を上回る

- **Next.js 16 との整合性**:
  - Next.js 16 では `fetch` がファーストクラスサポート
  - `"use cache"` と組み合わせた自動キャッシュ
  - React Query を使うと、Next.js のキャッシュ戦略と二重管理になる

- **今後の拡張性**:
  - クライアント側でのリアルタイム更新が必要になれば、React Query を検討
  - 現時点では「Server Components + fetch + use cache」で十分

### UI ライブラリの選択：Tailwind CSS 単体採用

- **Tailwind CSS を選んだ理由**:
  - **軽量・高速**: ビルド時に使用していないクラスを削除（Purge）
  - **カスタマイズ性が高い**: デザインシステムの制約がない
  - **学習コスト**: ユーティリティクラスで直感的にスタイリング可能
  - **Next.js との相性**: 公式ドキュメントでも推奨

- **コンポーネントライブラリ（MUI/Shadcn/ui/Chakra UI）を採用しなかった理由**:
  - **バンドルサイズ**: MUI は重い（200KB〜）、Tailwind CSS は必要な分だけ
  - **カスタマイズの手間**: 既存のコンポーネントを上書きする手間 > 自作の手間
  - **学習曲線**: 各ライブラリ固有の API を学ぶ必要がある
  - **プロジェクト規模**: 小規模アプリなので、フルスタックUIライブラリは過剰

- **フレームワーク特性との整合性**:
  - Next.js Server Components では、インタラクティブな UI 以外は静的 HTML
  - 大規模な UI ライブラリは Client Components 化を強制する場合がある
  - Tailwind CSS は Server/Client どちらでも自然に使える

- **AI 開発との相性**:
  - **Claude Code などの AI エージェントが UI を生成しやすい**
    - Tailwind CSS はユーティリティクラスの組み合わせだけ
    - AI が HTML + Tailwind クラスを自然に生成できる

  - **開発効率の向上**:
    - このプロジェクト自体も Claude Code を活用して開発
    - Tailwind CSS により、AI が デザイン要件がきっちり決まっていないものに対して UI を素早く実装できた
    - デザイン調整も AI に自然言語で指示するだけで即座に反映

### コンポーネント設計：ui / home 分割（Atomic Design 不採用）

- **採用した設計**:
  - `components/ui/`: 汎用的な再利用可能コンポーネント（SearchForm, BackButton, Pagination）
  - `components/home/`: ページ固有のコンポーネント（RepositoryList）
  - `lib/`: ユーティリティ・API クライアント

- **Atomic Design を採用しなかった理由**:
  1. **Next.js App Router の特性と不整合**:
     - App Router は「ページ単位」でのファイル配置（page.tsx, layout.tsx）
     - Atoms/Molecules/Organisms という抽象的な階層は、ページ中心の構造と相性が悪い

  2. **小規模プロジェクトには過剰**:
     - Atomic Design は大規模デザインシステム向け
     - コンポーネント数が少ない場合、階層が冗長になる
     - 「このコンポーネントは Atom か Molecule か？」の判断コストが高い

  3. **実用性重視**:
     - `ui/` = 「どこでも使える」
     - `home/` = 「このページでしか使わない」
     - シンプルで判断しやすい基準

- **レイヤー分割の根拠**:
  - **UI 層（Client Components）**: ユーザーインタラクション、ルーティング
  - **ページ層（Server Components）**: データフェッチ、レイアウト構成
  - **ビジネスロジック層（lib/）**: API 呼び出し、データ変換
  - Server/Client の境界を意識した責務分離

### 状態管理ライブラリの不採用（Redux / Zustand / Jotai）

- **採用しなかった理由**:
  - **Server Components でデータを取得**:
    - ページごとに Server Component で GitHub API を呼び出し
    - サーバーサイドで完結するため、グローバル状態管理が不要

  - **URL を Single Source of Truth に**:
    - 検索クエリ: URL の `?q=` パラメータ
    - ページ番号: URL の `?page=` パラメータ
    - 状態を URL で管理することで、リロードしても保持される

  - **sessionStorage で十分な部分**:
    - 戻るボタンの状態保持は sessionStorage で実現
    - グローバルな状態管理ライブラリを導入する必要がない

- **Next.js との整合性**:
  - Next.js 16 の思想は「Server Components でデータを取得し、Client Components には必要最小限の状態だけ」
  - Redux のような大規模な状態管理は、フレームワークの意図と逆行する

### テスト戦略：ユニットテスト中心（E2E テスト不採用）

- **E2E テスト（Playwright / Cypress）を採用しなかった理由**:
  - **プロジェクト規模**: 小規模アプリで複雑なユーザーフローがない
  - **コスト対効果**: E2E テストの導入・メンテナンスコスト > 得られる価値
  - **GitHub API への依存**: E2E テストで外部 API を叩くとレート制限に引っかかる
  - **CI/CD の速度**: E2E テストを入れると CI が遅くなる

- **今後の拡張性**:
  - ユーザー認証や決済など、クリティカルなフローが追加される場合は E2E を導入検討
  - 現時点では「Lint + Format + Unit Test + Build」で品質担保

### エラートラッキング（Sentry）の不採用

- **採用しなかった理由**:
  - **Vercel の標準ログ機能で十分**:
    - デプロイ先（Vercel）が提供するログ機能が充実
    - Server Components のエラーは Vercel のダッシュボードで確認可能
    - リアルタイムログストリーミング、検索、フィルタリング機能が標準で使える
    - 追加のサービス連携・料金が不要

  - **シンプルなアプリケーション特性**:
    - エラーパターンが限定的（GitHub API エラー、404 など）
    - 複雑なユーザーフローがない
    - エラーの再現が容易
    - 外部 API（GitHub API）のエラーが主で、アプリ側のバグは少ない

  - **開発段階のため**:
    - まだ大規模な本番運用前
    - エラー発生頻度が低い
    - 問題が発生したら開発者が直接ログを確認できる
    - ユーザー数が少ない段階で高度な監視は過剰

  - **導入コスト vs 価値**:
    - Sentry の導入コスト（セットアップ、学習、料金）
    - 得られる価値（エラー通知、スタックトレース）は Vercel ログで代替可能
    - 現時点ではコストが価値を上回る

- **現状のエラー対処方法**:
  - 開発環境: `console.error` + ブラウザ開発者ツール
  - 本番環境: Vercel ダッシュボードのログ確認
  - エラーバウンダリ（error.tsx）で適切にキャッチ
  - ユーザーには親切なエラー画面を表示

- **今後の拡張性**:
  - ユーザー数が増えて、エラー発生頻度が高くなった場合は Sentry を検討
  - エラーの自動通知（Slack 連携など）が必要になった場合に導入
  - 複雑なエラーパターンが出てきた段階で再評価

### 型生成・バリデーション：Zod の採用

- **Zod を選んだ理由**:
  - **ランタイムバリデーション + 型生成を同時実現** (`lib/github.ts:28-56`)
    - Zod スキーマから TypeScript の型を自動導出 (`z.infer`)
    - 型定義とバリデーションロジックを一元管理
    - 二重メンテナンスの必要がない

  - **外部 API との統合に最適**:
    - GitHub API のレスポンスは外部から来るため型保証されない
    - ランタイムで実際のデータ構造を検証
    - API 仕様変更や予期しないレスポンスを即座に検出

  - **軽量でシンプル**:
    - バンドルサイズが小さい（約 10KB gzipped）
    - 学習コストが低い
    - TypeScript との統合が自然

- **他の選択肢との比較**:
  1. **手動型定義（採用前の状態）**:
     - ❌ TypeScript の型定義のみ（コンパイル時のみチェック）
     - ❌ ランタイムバリデーションがない
     - ❌ 外部 API からの不正データを防げない
     - ✅ Zod: ランタイムで確実に検証

  2. **OpenAPI Generator**:
     - ✅ OpenAPI 仕様から型生成
     - ❌ GitHub API の OpenAPI 仕様を別途管理する必要
     - ❌ ランタイムバリデーションは別途実装が必要
     - ❌ プロジェクト規模に対して過剰
     - ✅ Zod: スキーマ定義も簡潔、バリデーションも一緒

  3. **io-ts**:
     - ✅ ランタイムバリデーション + 型生成
     - ❌ 学習曲線が急（関数型プログラミングの知識が必要）
     - ❌ エラーメッセージが読みにくい
     - ✅ Zod: 直感的な API、わかりやすいエラー

  4. **Yup**:
     - ✅ バリデーションライブラリ
     - ❌ TypeScript の型生成が弱い
     - ❌ フォームバリデーションに特化
     - ✅ Zod: TypeScript ファーストで型推論が強力

- **Next.js との整合性**:
  - Server Components で使用（バンドルサイズへの影響なし）
  - エラーバウンダリと組み合わせた適切なエラーハンドリング
  - TypeScript の strict モードと相性が良い

- **セキュリティ面での利点**:
  - データ型と構造の厳密な検証
  - 不正なデータ形式の即座の検出
  - XSS 攻撃のベクターとなるデータを排除
  - 予期しないフィールドやデータ型を拒否
