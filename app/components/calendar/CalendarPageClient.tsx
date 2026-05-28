"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarView } from "@/app/components/calendar/CalendarView";
import type { CalendarEvent } from "@/lib/calendar-events";
import { parseDateParam } from "@/lib/dates";

type CalendarPageClientProps = {
  events: CalendarEvent[];
};

export function CalendarPageClient({ events }: CalendarPageClientProps) {
  const searchParams = useSearchParams();
  const dateFromUrl = searchParams.get("date");
  const [initialModalDate, setInitialModalDate] = useState<string | null>(null);

  useEffect(() => {
    if (dateFromUrl && parseDateParam(dateFromUrl)) {
      setInitialModalDate(dateFromUrl);
    }
  }, [dateFromUrl]);

  return (
    <CalendarView
      events={events}
      initialModalDate={initialModalDate}
      onInitialModalConsumed={() => setInitialModalDate(null)}
    />
  );
}
