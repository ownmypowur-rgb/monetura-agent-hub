import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-400 mb-6">Page not found</p>
      <Link href="/hub" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
        Go to Hub
      </Link>
    </div>
  );
}
