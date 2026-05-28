import Link from "next/link";
import { AppHeader } from "@/app/components/layout/AppHeader";

export default function DayNotFound() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-rose-950">Invalid date</h1>
        <p className="mt-2 text-rose-600">
          Use a date in YYYY-MM-DD format, for example 2026-05-28.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          Back to calendar
        </Link>
      </main>
    </>
  );
}
