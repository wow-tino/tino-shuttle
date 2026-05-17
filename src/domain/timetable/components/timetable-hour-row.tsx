import { TimetableMinuteList } from "./timetable-minute-list";

import type {
  TimetableHourGroup,
  TimetableMinuteStatus,
} from "#/domain/timetable/utils/build-timetable-hour-groups";
import { cn } from "#/shared/utils";

interface TimetableHourRowProps {
  group: TimetableHourGroup;
  isFirst: boolean;
  isLast: boolean;
}

function getHourTextClassName(status: TimetableMinuteStatus): string {
  if (status === "current") {
    return "text-tu-blue font-extrabold";
  }

  if (status === "past") {
    return "text-dark-gray";
  }

  return "text-black";
}

function getDotClassName(status: TimetableMinuteStatus): string {
  if (status === "current") {
    return "border-tu-blue bg-white";
  }

  return "border-dark-gray bg-dark-gray";
}

export function TimetableHourRow({ group, isFirst, isLast }: TimetableHourRowProps) {
  return (
    <li
      className="grid grid-cols-[14px_minmax(0,1fr)] gap-1.5 pb-9 last:pb-0"
      aria-label={group.hourLabel}
    >
      <div className="relative flex min-h-5 items-center justify-center">
        {!isFirst ? (
          <span className="bg-gray absolute top-0 bottom-1/2 left-1/2 w-px -translate-x-1/2" />
        ) : null}
        {!isLast ? (
          <span className="bg-gray absolute top-1/2 -bottom-9 left-1/2 w-px -translate-x-1/2" />
        ) : null}
        <span
          className={cn(
            "relative z-10 size-2 rounded-full border-2",
            getDotClassName(group.status)
          )}
          aria-hidden
        />
      </div>
      <div className="flex min-h-5 min-w-0 items-center">
        <span
          className={cn(
            "w-10 shrink-0 text-base leading-none font-bold",
            getHourTextClassName(group.status)
          )}
        >
          {group.hourLabel}
        </span>
        <TimetableMinuteList minutes={group.minutes} />
      </div>
    </li>
  );
}
