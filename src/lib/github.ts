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

// 汎用的なResult型（成功またはエラーを表現）
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// 検索結果とリポジトリ取得結果の型エイリアス
export type SearchResult = Result<GitHubSearchResponse>;
export type RepositoryResult = Result<GitHubRepository>;

const GITHUB_API_BASE = "https://api.github.com";

/**
 * GitHub のリポジトリを検索する
 * @param query 検索クエリ
 * @param page ページ番号（デフォルト: 1）
 * @param perPage 1ページあたりの結果数（デフォルト: 30）
 * @returns 検索結果（成功時はデータ、失敗時はエラー情報）
 */
export async function searchRepositories(
  query: string,
  page: number = 1,
  perPage: number = 30
): Promise<SearchResult> {
  try {
    if (!query.trim()) {
      return {
        success: true,
        data: {
          total_count: 0,
          incomplete_results: false,
          items: [],
        },
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
      // GitHub API のエラーレスポンスから詳細を取得
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message ||
        `GitHub API エラー (ステータス: ${response.status})`;

      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    // ネットワークエラーなど、予期しないエラーをキャッチ
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "検索中に予期しないエラーが発生しました",
    };
  }
}

/**
 * 指定したリポジトリの詳細情報を取得する
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @returns リポジトリの詳細情報（成功時はデータ、失敗時はエラー情報）
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<RepositoryResult> {
  try {
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
      // GitHub API のエラーレスポンスから詳細を取得
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message ||
        `GitHub API エラー (ステータス: ${response.status})`;

      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    // ネットワークエラーなど、予期しないエラーをキャッチ
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "リポジトリ取得中に予期しないエラーが発生しました",
    };
  }
}
