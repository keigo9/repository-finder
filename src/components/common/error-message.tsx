interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

/**
 * エラーメッセージを表示するコンポーネント
 */
export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start gap-3">
        <div className="text-2xl">❌</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-100">
            エラーが発生しました
          </h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {message}
          </p>
          {retry && (
            <button
              onClick={retry}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
            >
              再試行する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
