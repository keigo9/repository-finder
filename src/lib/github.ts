import { z } from "zod";

// カスタムエラークラス
export class GitHubNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubNotFoundError";
  }
}

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "GitHubAPIError";
  }
}

export class GitHubValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubValidationError";
  }
}

// Zod スキーマによる型定義とランタイムバリデーション
const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  html_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const GitHubSearchResponseSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(GitHubRepositorySchema),
});

// Zod スキーマから型を導出
export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubSearchResponse = z.infer<typeof GitHubSearchResponseSchema>;

const GITHUB_API_BASE = "https://api.github.com";

/**
 * GitHub のリポジトリを検索する
 * @param query 検索クエリ
 * @param page ページ番号（デフォルト: 1）
 * @param perPage 1ページあたりの結果数（デフォルト: 30）
 * @returns 検索結果
 * @throws {GitHubAPIError} GitHub API エラー
 */
export async function searchRepositories(
  query: string,
  page: number = 1,
  perPage: number = 30
): Promise<GitHubSearchResponse> {
  "use cache";

  if (!query.trim()) {
    return {
      total_count: 0,
      incomplete_results: false,
      items: [],
    };
  }

  const url = new URL(`${GITHUB_API_BASE}/search/repositories`);
  url.searchParams.set("q", query);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("per_page", perPage.toString());
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // GitHub Personal Access Token が設定されている場合は認証ヘッダーを追加
  // レート制限が 60 req/hour → 5000 req/hour に向上
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    // Next.js のキャッシュ戦略: 検索結果は5分間キャッシュ
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    // GitHub API のエラーレスポンスから詳細を取得
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message || `GitHub API エラー (ステータス: ${response.status})`;

    throw new GitHubAPIError(errorMessage, response.status);
  }

  const data = await response.json();

  // Zod によるランタイムバリデーション
  const validationResult = GitHubSearchResponseSchema.safeParse(data);

  if (!validationResult.success) {
    console.error("GitHub API レスポンスの検証エラー:", validationResult.error);
    throw new GitHubValidationError(
      "GitHub API からの応答が期待される形式と異なります"
    );
  }

  return validationResult.data;
}

/**
 * 指定したリポジトリの詳細情報を取得する
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @returns リポジトリの詳細情報
 * @throws {GitHubNotFoundError} リポジトリが見つからない（404）
 * @throws {GitHubAPIError} その他の GitHub API エラー
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<GitHubRepository> {
  "use cache";

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // GitHub Personal Access Token が設定されている場合は認証ヘッダーを追加
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    // Next.js のキャッシュ戦略: リポジトリ詳細は10分間キャッシュ
    next: {
      revalidate: 600,
    },
  });

  if (!response.ok) {
    // GitHub API のエラーレスポンスから詳細を取得
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message || `GitHub API エラー (ステータス: ${response.status})`;

    // 404の場合は専用のエラーをthrow
    if (response.status === 404) {
      throw new GitHubNotFoundError(errorMessage);
    }

    throw new GitHubAPIError(errorMessage, response.status);
  }

  const data = await response.json();

  // Zod によるランタイムバリデーション
  const validationResult = GitHubRepositorySchema.safeParse(data);

  if (!validationResult.success) {
    console.error("GitHub API レスポンスの検証エラー:", validationResult.error);
    throw new GitHubValidationError(
      "GitHub API からの応答が期待される形式と異なります"
    );
  }

  return validationResult.data;
}
