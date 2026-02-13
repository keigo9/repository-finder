import Link from "next/link";
import Image from "next/image";
import { GitHubRepository } from "@/lib/github";

interface RepositoryListProps {
  repositories: GitHubRepository[];
}

/**
 * リポジトリ一覧表示コンポーネント（Server Component）
 */
export function RepositoryList({ repositories }: RepositoryListProps) {
  if (repositories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        検索結果が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
}

/**
 * リポジトリカードコンポーネント（Server Component）
 */
function RepositoryCard({ repository }: { repository: GitHubRepository }) {
  return (
    <Link
      href={`/repository/${repository.owner.login}/${repository.name}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 w-full overflow-hidden"
    >
      <div className="flex items-start gap-4">
        {/* オーナーのアイコン */}
        <Image
          src={repository.owner.avatar_url}
          alt={repository.owner.login}
          width={48}
          height={48}
          className="rounded-full"
        />

        <div className="flex-1 min-w-0">
          {/* リポジトリ名 */}
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 truncate overflow-hidden">
            {repository.full_name}
          </h3>

          {/* 説明 */}
          {repository.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
              {repository.description}
            </p>
          )}

          {/* メタ情報 */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            {repository.language && (
              <div className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                <span>{repository.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{repository.stargazers_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span>{repository.watchers_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🍴</span>
              <span>{repository.forks_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🐛</span>
              <span>{repository.open_issues_count.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
