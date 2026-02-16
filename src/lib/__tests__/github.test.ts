import { searchRepositories, getRepository } from "../github";

// グローバルの fetch をモック
global.fetch = jest.fn();

describe("GitHub API クライアント", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchRepositories", () => {
    it("検索クエリが空の場合、空の結果を返す", async () => {
      const result = await searchRepositories("");

      expect(result).toEqual({
        total_count: 0,
        incomplete_results: false,
        items: [],
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("正常に検索結果を取得できる", async () => {
      const mockResponse = {
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            id: 1,
            name: "test-repo",
            full_name: "owner/test-repo",
            owner: {
              login: "owner",
              avatar_url: "https://example.com/avatar.jpg",
            },
            description: "Test repository",
            language: "TypeScript",
            stargazers_count: 100,
            watchers_count: 50,
            forks_count: 10,
            open_issues_count: 5,
            html_url: "https://github.com/owner/test-repo",
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-02T00:00:00Z",
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchRepositories("test");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/search/repositories"),
        expect.objectContaining({
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("API エラーの場合、エラーをスローする", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(searchRepositories("test")).rejects.toThrow(
        "GitHub API エラー (ステータス: 404)"
      );
    });
  });

  describe("getRepository", () => {
    it("正常にリポジトリ詳細を取得できる", async () => {
      const mockRepository = {
        id: 1,
        name: "test-repo",
        full_name: "owner/test-repo",
        owner: {
          login: "owner",
          avatar_url: "https://example.com/avatar.jpg",
        },
        description: "Test repository",
        language: "TypeScript",
        stargazers_count: 100,
        watchers_count: 50,
        forks_count: 10,
        open_issues_count: 5,
        html_url: "https://github.com/owner/test-repo",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepository,
      });

      const result = await getRepository("owner", "test-repo");

      expect(fetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/owner/test-repo",
        expect.objectContaining({
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        })
      );
      expect(result).toEqual(mockRepository);
    });

    it("API エラーの場合、エラーをスローする", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(getRepository("owner", "not-found")).rejects.toThrow(
        "GitHub API エラー (ステータス: 404)"
      );
    });
  });
});
