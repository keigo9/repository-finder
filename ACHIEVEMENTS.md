# 🎯 実装の工夫点・凝った点

## 1. 🚀 パフォーマンス最適化（Next.js 16 特性の理解）

### Partial Pre Rendering (PPR) の導入

Next.js 16 の最新機能として PPR を有効化 (`next.config.ts:5`)。静的シェル（BackButtonなど）を即座に配信し、動的コンテンツ（検索結果）はストリーミングで後から送る。ユーザー体験を損なわずにパフォーマンスを最適化。

### キャッシュ戦略（"use cache" + revalidate + staleTimes）

#### "use cache" ディレクティブの理解

Next.js 16 では `fetch` がデフォルトで**非キャッシュ**に変更された。そのため `searchRepositories()` と `getRepository()` に明示的に `"use cache"` を付与 (`lib/github.ts:60,111`)。これはフレームワークの仕様変更を理解した上での対応。

#### 段階的な revalidate 設定

データの更新頻度に応じてキャッシュ時間を調整：

- **検索結果**: 5分間 (`revalidate: 300`) - 比較的頻繁に更新される可能性があるため短め
- **リポジトリ詳細**: 10分間 (`revalidate: 600`) - stars/forks などは頻繁に変わらないため長め

#### クライアント側 staleTimes による二段階キャッシュ

Next.js 15以降はルータキャッシュがデフォルトで0秒になったため、`staleTimes.dynamic: 300` を明示的に設定 (`next.config.ts:6-11`)。

**二段階キャッシュの狙い：**

- **サーバー側**: GitHub API レスポンスを5〜10分キャッシュ
- **クライアント側**: ページデータを5分キャッシュ

**UX への効果：**

- staleTimes なし → ページ遷移のたびに Suspense fallback（スケルトン）が表示される
- staleTimes あり → 5分以内に同じページに戻ると、キャッシュから即座に表示

「リポジトリ一覧 → 詳細 → 戻る」の流れでスケルトンが表示されず、体感パフォーマンスが大幅に向上。

#### GitHub API 認証によるレート制限対策

- 未認証: 60 req/hour → **Personal Access Token 認証**: 5000 req/hour
- 環境変数 `GITHUB_TOKEN` に設定するだけでサーバーサイドで自動付与
- 認証 + キャッシュの二重対策で、実質無制限に近い使用が可能

### Server/Client Components の最適な分離

Next.js の思想に沿って、デフォルトで Server Component を採用。データフェッチは全てサーバー側で実行し、JavaScriptバンドルサイズを最小化。Client Component は必要最小限（SearchForm, BackButton, Error）のみに限定。

### ページネーション採用

無限スクロールではなくページネーション採用により、一度に取得するデータ量を制限（1ページ30件）。API リクエスト削減とメモリ効率化を実現。ページごとに独立してキャッシュされるため、よく閲覧される最初のページはキャッシュヒット率が高い。

---

## 2. 🏗️ アーキテクチャ設計の意思決定（フレームワーク特性の理解）

### BFF 不採用の理由（Next.js Server Components との整合性）

**Next.js 16 Server Components が BFF の役割を果たす：**

- Server Components 内で GitHub API を直接呼び出し、サーバーサイドでデータフェッチ・整形が可能
- BFF を挟むと Server Component の利点（サーバーサイドロジックを自然に書ける）が薄れる
- フレームワークの思想に沿った設計を優先

**運用面のメリット：**

- 追加の BFF サーバーのデプロイ・管理が不要
- インフラが単純化（Next.js アプリだけで完結）
- 外部 API が GitHub API のみという要件に対して過剰な構成を避ける

### React Query / SWR / Axios 不採用の理由

**Next.js 16 の fetch + "use cache" で完結：**

- Next.js 16 の `fetch` は `"use cache"` ディレクティブと `revalidate` オプションでキャッシュ・再検証をサポート
- React Query/SWR はクライアント側データフェッチ用のライブラリで、Server Components では利点が薄い
- React Query を使うと Next.js のキャッシュ戦略と二重管理になり、冗長

**バンドルサイズへの配慮：**

- React Query: 約40KB のクライアントバンドル増加
- Server Components でデータフェッチを完結させることで、クライアント側のJSを最小化

**Axios も不要：**

- ブラウザの `fetch` API で十分
- シンプルな GitHub API 呼び出しに対して、インターセプターやリクエスト変換は過剰

### Tailwind CSS 単体採用の理由

**MUI / Shadcn/ui / Chakra UI を採用しなかった理由：**

- MUI は重い（200KB〜）、Tailwind CSS は必要な分だけビルド時に抽出（Purge）
- 大規模 UI ライブラリは Client Components 化を強制する場合があり、Server Components 中心の設計と相性が悪い
- 小規模アプリに対してフルスタック UI ライブラリは過剰

**Next.js Server Components との整合性：**

- Tailwind CSS は Server/Client どちらでも自然に使える
- インタラクティブな UI 以外は静的 HTML として配信される Server Components の思想に沿う

### コンポーネント設計：ui / home 分割（Atomic Design 不採用）

**採用した設計：**

- `components/ui/`: 汎用的な再利用可能コンポーネント
- `components/home/`: ページ固有のコンポーネント
- `lib/`: API クライアント・ユーティリティ

**Atomic Design を採用しなかった理由：**

- Next.js App Router は「ページ単位」のファイル配置（page.tsx, layout.tsx）
- Atoms/Molecules/Organisms という抽象的な階層は、App Router のページ中心構造と相性が悪い
- 小規模プロジェクトでは「ui/（どこでも使える）」「home/（ページ固有）」というシンプルな基準の方が判断しやすい

**Server/Client の境界を意識：**

- UI 層（Client Components）: ユーザーインタラクション
- ページ層（Server Components）: データフェッチ・レイアウト
- ビジネスロジック層（lib/）: API 呼び出し・データ変換

### Redux / Zustand / Jotai 不採用の理由

**Server Components + URL で状態管理が完結：**

- Server Components でデータを取得し、サーバーサイドで完結
- 検索クエリ・ページ番号は URL パラメータで管理（`?q=`, `?page=`）
- URL を Single Source of Truth にすることで、リロードしても状態が保持される

**sessionStorage で十分：**

- 戻るボタンの状態保持は sessionStorage で実現
- グローバルな状態管理ライブラリは不要

**Next.js 16 の思想との整合性：**

- 「Server Components でデータを取得し、Client Components には必要最小限の状態だけ」
- Redux のような大規模状態管理は、フレームワークの意図と逆行する

### Zod 採用の理由（ランタイムバリデーション）

**ランタイムバリデーション + 型生成を同時実現：**

- Zod スキーマから TypeScript の型を自動導出（`z.infer`）
- 型定義とバリデーションロジックを一元管理、二重メンテナンス不要

**外部 API との統合に最適：**

- TypeScript はコンパイル時のみ型チェック、実行時には外部 API からのデータ構造が保証されない
- Zod でランタイムバリデーションを実施し、GitHub API の仕様変更や不正レスポンスを即座に検出

**他の選択肢との比較：**

- 手動型定義：ランタイムバリデーションがなく、外部 API からの不正データを防げない
- OpenAPI Generator：プロジェクト規模に対して過剰、ランタイムバリデーションは別途実装が必要
- io-ts：学習曲線が急、エラーメッセージが読みにくい
- Yup：TypeScript の型生成が弱い、フォームバリデーション特化

**Next.js との整合性：**

- Server Components で使用するため、クライアントバンドルサイズへの影響なし
- TypeScript の strict モードと相性が良い

---

## 3. 🎨 UI/UX の工夫

### sessionStorage による検索状態の保持

**問題：**

- 通常、詳細ページから戻ると検索結果の1ページ目に戻ってしまう

**解決策：**

- sessionStorage で検索クエリとページ番号を記録
- 「検索 → 3ページ目 → リポジトリ詳細 → 戻る」の流れで、ちゃんと3ページ目に戻れる

**なぜ sessionStorage なのか？（他の選択肢との比較）**

1. **localStorage との比較：**
   - localStorage: ブラウザを閉じても永続的に残る → 古い検索履歴が残り続ける
   - sessionStorage: タブを閉じたら自動削除 → プライバシー配慮
   - 検索状態は「一時的な閲覧セッション」に紐づくべき

2. **URL パラメータとの比較：**
   - URL パラメータ: 戻るボタンの URL に `?from=search&q=react&page=3` と埋め込む必要
   - 詳細ページの URL が複雑化・冗長化
   - sessionStorage: URL はシンプルなまま、状態は裏側で保持

3. **React Context/State との比較：**
   - React Context: ページ遷移（フルリロード）で状態が消える
   - sessionStorage: ページ遷移・リロードしても状態が保持される

4. **Cookie との比較：**
   - Cookie: 毎回サーバーに送信される → 不要なオーバーヘッド
   - sessionStorage: クライアント側のみで完結

### useTransition によるローディングフィードバック

**検索ボタンクリック時の即時フィードバック：**

- `useTransition` フックで検索ボタンクリック時に即座に `isPending` 状態に
- ボタンが「検索」→「検索中...」に変化、`disabled` で連打防止
- 検索フィールドも無効化、スケルトン UI を即座に表示
- クリック成功の確信が得られ、UX が向上

**ページネーションクリック時の即時フィードバック：**

- Link コンポーネントから button + onClick に変更
- `startTransition` でナビゲーション開始、即座に全ボタンを無効化
- 連打防止とユーザーの混乱を防ぐ

---

## 4. 🔒 セキュリティ

### Zod によるランタイムバリデーション

**API レスポンスの厳格な検証：**

- Zod スキーマで GitHub API レスポンスをランタイムバリデーション
- TypeScript はコンパイル時のみ、実行時には外部データ構造が保証されない
- `safeParse()` で不正なデータ形式を即座に検出
- GitHub API の仕様変更や中間者攻撃による改ざんデータを検出

**セキュリティへの貢献：**

- 不正データによるアプリケーションクラッシュを防止
- XSS 攻撃のベクターとなる不正データを排除
- 予期しないフィールドやデータ型を拒否

### 入力バリデーション（DoS 対策）

**検索クエリの長さ制限：**

- フロントエンド: `maxLength` 属性で 256 文字に制限
- バックエンド: サーバーサイドでも同じ検証を実施
- 多層防御により、クライアント側バリデーションをバイパスされても防御
- 極端に長いクエリによるリクエスト負荷を防止

### 環境変数のバリデーション

**起動時チェック機能：**

- `lib/env.ts` で GITHUB_TOKEN の検証
- トークン未設定時に警告を表示、レート制限の影響を通知
- 設定ミスを早期発見し、適切なログメッセージで解決方法を提示

### セキュリティヘッダー

**包括的なセキュリティヘッダーの設定：**

- Content-Security-Policy (CSP): XSS 攻撃への多層防御、GitHub API と画像のみを許可
- X-Frame-Options: DENY - クリックジャッキング攻撃への対策
- X-Content-Type-Options: nosniff - MIME スニッフィング攻撃への対策
- Referrer-Policy: strict-origin-when-cross-origin - リファラー情報の適切な制御
