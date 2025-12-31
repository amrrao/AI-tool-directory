import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="mb-4">Your payment was cancelled.</p>
        <Link href="/" className="text-blue-500 underline">
          Return to home
        </Link>
      </div>
    </div>
  );
}