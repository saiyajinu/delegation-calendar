import Link from "next/link";
import {
  eachDayInclusive,
  formatDateParam,
  formatShortWeekday,
  isToday,
} from "@/lib/dates";

type TripDayNavProps = {
  startDate: Date;
  endDate: Date;
  currentDateParam: string;
};

export function TripDayNav({
  startDate,
  endDate,
  currentDateParam,
}: TripDayNavProps) {
  const days = eachDayInclusive(startDate, endDate);

  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Business trip day navigation"
    >
      {days.map((day) => {
        const param = formatDateParam(day);
        const isCurrent = param === currentDateParam;
        const today = isToday(day);

        return (
          <Link
            key={param}
            href={`/day/${param}`}
            prefetch
            className={`flex min-w-[4.5rem] flex-col items-center rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
              isCurrent
                ? "border-rose-500 bg-rose-500 text-white shadow-sm shadow-rose-200"
                : "border-rose-200 bg-white text-rose-800 hover:border-pink-300 hover:bg-pink-50"
            }`}
            aria-current={isCurrent ? "page" : undefined}
          >
            <span className={`text-xs font-medium ${isCurrent ? "text-rose-100" : "text-rose-500"}`}>
              {formatShortWeekday(day)}
            </span>
            <span className="text-lg font-semibold leading-tight">
              {day.getDate()}
            </span>
            {today && !isCurrent && (
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-pink-600">
                Today
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
