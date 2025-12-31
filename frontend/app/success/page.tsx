"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Prevent prerendering - this page uses search params
export const dynamic = 'force-dynamic';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-4">Thank you for your purchase.</p>
        {sessionId && (
          <p className="text-sm text-gray-500 mb-4">Session ID: {sessionId}</p>
        )}
        <Link href="/" className="text-blue-500 underline">
          Return to home
        </Link>
      </div>
    </div>
  );
}

// Wrap in Suspense boundary as required by Next.js 15
// Official pattern: https://nextjs.org/docs/app/api-reference/functions/use-search-params
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}