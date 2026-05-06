import Link from 'next/link';

export default function SessionNotFound() {
  return (
    <div className="min-h-screen bg-[#FAF6E9] flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-[#1E2A5E] mb-2">Session not found</h1>
      <p className="text-[#1E2A5E]/70 mb-6">
        It may have been deleted, or you don&apos;t have access.
      </p>
      <Link href="/dashboard" className="text-[#1E2A5E] underline">
        Back to dashboard
      </Link>
    </div>
  );
}
