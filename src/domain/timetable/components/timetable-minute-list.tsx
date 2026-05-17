import type { TimetableMinuteItem } from "#/domain/timetable/utils/build-timetable-hour-groups";
import { Txt } from "#/shared/components/txt";
import { cn } from "#/shared/utils";

interface TimetableMinuteListProps {
  minutes: TimetableMinuteItem[];
}

function getMinuteTextClassName(minute: TimetableMinuteItem): string {
  if (minute.isCurrentHour) {
    return "text-tu-blue not-first:border-l-tu-blue";
  }

  if (minute.status === "past") {
    return "text-gray not-first:border-l-gray";
  }

  return "text-dark-gray not-first:border-l-dark-gray";
}

export function TimetableMinuteList({ minutes }: TimetableMinuteListProps) {
  return (
    <div className="flex min-w-0 items-center" aria-label="출발 분 목록">
      {minutes.map((minute) => (
        <Txt
          key={minute.id}
          as="span"
          typography={minute.status === "current" ? "body-bold" : "body"}
          className={cn(
            "w-11 text-center leading-none not-first:border-l",
            getMinuteTextClassName(minute)
          )}
          aria-label={`${minute.minuteLabel}분${minute.isFirstDeparture ? " 첫차" : ""}${
            minute.isLastDeparture ? " 막차" : ""
          }`}
        >
          {minute.minuteLabel}
        </Txt>
      ))}
    </div>
  );
}
