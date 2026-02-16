import Image from "next/image";
import { getRepository } from "@/lib/github";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/common/back-button";

interface RepositoryPageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

/**
 * リポジトリ詳細ページ
 * Server Component として実装
 */
export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { owner, repo } = await params;

  let repository;
  try {
    repository = await getRepository(owner, repo);
  } catch (error) {
    console.error("Failed to fetch repository:", error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* ナビゲーション */}
        <BackButton />

        {/* リポジトリ情報 */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          {/* ヘッダー */}
          <div className="mb-6 flex items-start gap-6">
            <Image
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              width={80}
              height={80}
              className="rounded-full shrink-0"
            />
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">
                {repository.full_name}
              </h1>
              {repository.description && (
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  {repository.description}
                </p>
              )}
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon="⭐"
              label="Stars"
              value={repository.stargazers_count}
            />
            <StatCard
              icon="👁️"
              label="Watchers"
              value={repository.watchers_count}
            />
            <StatCard icon="🍴" label="Forks" value={repository.forks_count} />
            <StatCard
              icon="🐛"
              label="Issues"
              value={repository.open_issues_count}
            />
          </div>

          {/* 詳細情報 */}
          <div className="space-y-4">
            {repository.language && (
              <InfoRow label="言語">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                  {repository.language}
                </span>
              </InfoRow>
            )}

            <InfoRow label="作成日">
              {new Date(repository.created_at).toLocaleDateString("ja-JP")}
            </InfoRow>

            <InfoRow label="最終更新">
              {new Date(repository.updated_at).toLocaleDateString("ja-JP")}
            </InfoRow>
          </div>

          {/* アクションボタン */}
          <div className="mt-8">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHubで見る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 統計カードコンポーネント
 */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

/**
 * 情報行コンポーネント
 */
function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 border-t border-gray-200 py-3 dark:border-gray-700">
      <div className="w-24 font-medium text-gray-600 dark:text-gray-400">
        {label}
      </div>
      <div className="flex-1 text-gray-900 dark:text-white">{children}</div>
    </div>
  );
}
