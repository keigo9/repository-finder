// GitHub API のレスポンス型定義
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

const GITHUB_API_BASE = "https://api.github.com";

/**
 * GitHub のリポジトリを検索する
 * @param query 検索クエリ
 * @param page ページ番号（デフォルト: 1）
 * @param perPage 1ページあたりの結果数（デフォルト: 30）
 * @returns 検索結果
 */
export async function searchRepositories(
  query: string,
  page: number = 1,
  perPage: number = 30
): Promise<GitHubSearchResponse> {
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

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    // Next.js のキャッシュ戦略: 検索結果は5分間キャッシュ
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API エラー: ${response.status}`);
  }

  return response.json();
}

/**
 * 指定したリポジトリの詳細情報を取得する
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @returns リポジトリの詳細情報
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<GitHubRepository> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    // Next.js のキャッシュ戦略: リポジトリ詳細は10分間キャッシュ
    next: {
      revalidate: 600,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API エラー: ${response.status}`);
  }

  return response.json();
}
