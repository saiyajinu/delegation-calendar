"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarEvent } from "@/lib/calendar-events";
import { ACTIVITY_COLOR, TRIP_COLOR } from "@/lib/calendar-events";
import { formatDateParam, parseDateParam } from "@/lib/dates";
import { DayActionModal } from "@/app/components/day/DayActionModal";
import { ExportButton } from "@/app/components/calendar/ExportButton";

type CalendarViewProps = {
  events: CalendarEvent[];
  initialModalDate?: string | null;
  onInitialModalConsumed?: () => void;
};

export function CalendarView({
  events: initialEvents,
  initialModalDate,
  onInitialModalConsumed,
}: CalendarViewProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (initialModalDate && parseDateParam(initialModalDate)) {
      setSelectedDate(initialModalDate);
      setModalOpen(true);
      onInitialModalConsumed?.();
    }
  }, [initialModalDate, onInitialModalConsumed]);

  const todayStr = useMemo(() => formatDateParam(new Date()), []);

  const handleDateClick = useCallback((info: DateClickArg) => {
    setSelectedDate(info.dateStr);
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const props = info.event.extendedProps as {
        type?: string;
        date?: string;
      };
      const date =
        props.type === "activity" && props.date
          ? props.date
          : info.event.start
            ? formatDateParam(info.event.start)
            : info.event.startStr?.slice(0, 10);
      if (date) router.push(`/day/${date}`);
    },
    [router],
  );

  const refreshEvents = useCallback(() => {
    router.refresh();
    setEvents(initialEvents);
  }, [router, initialEvents]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-rose-950">
            Calendar
          </h1>
          <p className="text-sm text-rose-600">
            Click a day to add entries · click an event for details
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: ACTIVITY_COLOR }}
              />
              Activities
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: TRIP_COLOR }}
              />
              Business trips
            </span>
          </div>
          <ExportButton />
        </div>
      </div>

      <div className="fc-theme-custom min-h-0 flex-1 overflow-hidden rounded-xl border border-rose-200 bg-white p-2 shadow-sm shadow-rose-100/50">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          height="100%"
          fixedWeekCount={false}
          firstDay={1}
          events={events}
          eventDisplay="block"
          dayMaxEvents={3}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          dayCellClassNames={(arg) =>
            arg.dateStr === todayStr ? ["fc-day-today-custom"] : []
          }
        />
      </div>

      <DayActionModal
        open={modalOpen}
        dateParam={selectedDate}
        onClose={() => setModalOpen(false)}
        onCreated={refreshEvents}
      />
    </div>
  );
}
