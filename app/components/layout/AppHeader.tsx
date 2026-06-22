import Link from "next/link";
import { cookies } from "next/headers";
import { Calendar, MapPin } from "lucide-react";
import { normalizeUserCode } from "@/lib/user-code";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
  active?: "calendar" | "map";
};

export async function AppHeader({
  backHref = "/",
  backLabel = "← Calendar",
  active,
}: AppHeaderProps) {
  const requestCookies = await cookies();
  const userCode = normalizeUserCode(requestCookies.get("userCode")?.value ?? null);

  return (
    <header className="border-b border-rose-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-rose-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-200">
            <Calendar className="h-4 w-4" />
          </span>
          Delegation Calendar
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:inline-flex ${
              active === "calendar"
                ? "bg-rose-100 text-rose-950"
                : "text-rose-700 hover:bg-rose-50 hover:text-rose-950"
            }`}
          >
            Calendar
          </Link>
          <Link
            href="/map"
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-md transition-all sm:px-4 ${
              active === "map"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-300/50 ring-2 ring-emerald-300/60"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200/80 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Romania Map</span>
          </Link>
          {backLabel && backHref !== "/" && active !== "map" && (
            <Link
              href={backHref}
              className="text-sm font-medium text-rose-700 transition-colors hover:text-rose-950"
            >
              {backLabel}
            </Link>
          )}
          {userCode ? (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              {userCode}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
