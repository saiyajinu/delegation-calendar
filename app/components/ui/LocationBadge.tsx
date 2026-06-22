import Link from "next/link";
import { MapPin } from "lucide-react";

type LocationBadgeProps = {
  name: string;
  className?: string;
};

export function LocationBadge({ name, className = "" }: LocationBadgeProps) {
  return (
    <Link
      href="/map"
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 ${className}`}
    >
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <span>{name}</span>
    </Link>
  );
}
