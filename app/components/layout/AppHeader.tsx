import Link from "next/link";
import { Calendar } from "lucide-react";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

export function AppHeader({
  backHref = "/",
  backLabel = "← Calendar",
}: AppHeaderProps) {
  return (
    <header className="border-b border-rose-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-rose-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-200">
            <Calendar className="h-4 w-4" />
          </span>
          Delegation Calendar
        </Link>
        {backLabel && backHref !== "/" && (
          <Link
            href={backHref}
            className="text-sm font-medium text-rose-700 transition-colors hover:text-rose-950"
          >
            {backLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
