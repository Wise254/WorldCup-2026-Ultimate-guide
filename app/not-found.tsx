import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="text-center max-w-md">
        {/* 404 visual */}
        <div className="relative mb-8">
          <div className="text-[120px] sm:text-[160px] font-black leading-none bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent opacity-80">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl sm:text-6xl">⚽</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Maybe it went to watch the World Cup? 🏆
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            🏠 Back to Home
          </Link>
          <Link
            href="/schedule"
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
          >
            📅 View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}