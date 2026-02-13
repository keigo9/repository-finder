import { render, screen } from "@testing-library/react";
import { RepositoryList } from "../repository-list";
import { GitHubRepository } from "@/lib/github";

describe("RepositoryList", () => {
  const mockRepositories: GitHubRepository[] = [
    {
      id: 1,
      name: "test-repo-1",
      full_name: "owner1/test-repo-1",
      owner: {
        login: "owner1",
        avatar_url: "https://example.com/avatar1.jpg",
      },
      description: "Test repository 1",
      language: "TypeScript",
      stargazers_count: 100,
      watchers_count: 50,
      forks_count: 10,
      open_issues_count: 5,
      html_url: "https://github.com/owner1/test-repo-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    },
    {
      id: 2,
      name: "test-repo-2",
      full_name: "owner2/test-repo-2",
      owner: {
        login: "owner2",
        avatar_url: "https://example.com/avatar2.jpg",
      },
      description: "Test repository 2",
      language: "JavaScript",
      stargazers_count: 200,
      watchers_count: 100,
      forks_count: 20,
      open_issues_count: 10,
      html_url: "https://github.com/owner2/test-repo-2",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    },
  ];

  it("リポジトリ一覧が正しく表示される", () => {
    render(<RepositoryList repositories={mockRepositories} />);

    expect(screen.getByText("owner1/test-repo-1")).toBeInTheDocument();
    expect(screen.getByText("owner2/test-repo-2")).toBeInTheDocument();
    expect(screen.getByText("Test repository 1")).toBeInTheDocument();
    expect(screen.getByText("Test repository 2")).toBeInTheDocument();
  });

  it("空の配列の場合、メッセージが表示される", () => {
    render(<RepositoryList repositories={[]} />);

    expect(
      screen.getByText("検索結果が見つかりませんでした")
    ).toBeInTheDocument();
  });

  it("言語情報が表示される", () => {
    render(<RepositoryList repositories={mockRepositories} />);

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
  });

  it("統計情報が表示される", () => {
    render(<RepositoryList repositories={mockRepositories} />);

    // 複数のリポジトリに統計情報が存在する
    const allNumbers = screen.getAllByText("100");
    expect(allNumbers.length).toBeGreaterThan(0);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });
});
