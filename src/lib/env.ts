/**
 * 環境変数の検証と取得
 */

let hasValidated = false;

/**
 * 環境変数の妥当性をチェックする（初回のみ実行）
 */
export function validateEnv() {
  // 既にチェック済みなら何もしない
  if (hasValidated) return;
  hasValidated = true;

  // サーバーサイドのみで実行
  if (typeof window !== "undefined") return;

  // GITHUB_TOKEN のチェック（任意だが、設定推奨）
  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "⚠️  警告: GITHUB_TOKEN が設定されていません。\n" +
        "   レート制限が 60 req/hour に制限されます。\n" +
        "   Personal Access Token を .env.local に設定すると 5000 req/hour に向上します。\n" +
        "   詳細: https://github.com/settings/tokens"
    );
  } else {
    // トークンの形式チェック（最低限の長さ）
    if (process.env.GITHUB_TOKEN.length < 20) {
      console.error(
        "❌ エラー: GITHUB_TOKEN の形式が不正です。\n" +
          "   正しい Personal Access Token を設定してください。"
      );
    }
  }

  // NEXT_PUBLIC_SITE_URL のチェック（任意）
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.info(
      "ℹ️  情報: NEXT_PUBLIC_SITE_URL が設定されていません。\n" +
        "   デフォルト値 (http://localhost:3000) を使用します。\n" +
        "   本番環境では .env.local に設定することを推奨します。"
    );
  }
}
