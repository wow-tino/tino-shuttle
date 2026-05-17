import type {
  TimetableMinuteStatus,
  TimetableNotice,
} from "#/domain/timetable/utils/build-timetable-hour-groups";
import { Txt } from "#/shared/components/txt";
import { cn } from "#/shared/utils";

interface TimetableNoticeRowProps {
  notice: TimetableNotice;
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

function getNoticeLabelClassName(status: TimetableMinuteStatus) {
  if (status === "current") {
    return "text-tu-blue";
  }

  return "text-dark-gray";
}

export function TimetableNoticeRow({ notice, isFirst, isLast }: TimetableNoticeRowProps) {
  return (
    <li
      className="grid grid-cols-[14px_minmax(0,1fr)] gap-1.5 pb-9 last:pb-0"
      aria-label={notice.label}
    >
      <div className="relative flex min-h-5 items-center justify-center">
        {!isFirst ? (
          <span className="bg-gray absolute top-0 bottom-1/2 left-1/2 w-px -translate-x-1/2" />
        ) : null}
        {!isLast ? (
          <span className="bg-gray absolute top-1/2 -bottom-9 left-1/2 w-px -translate-x-1/2" />
        ) : null}
        {notice.status === "current" ? (
          <div className="bg-tu-blue/30 relative z-10 flex size-3.5 items-center justify-center rounded-full">
            <div className="bg-tu-blue flex size-2.5 items-center justify-center rounded-full">
              <div className="size-1 rounded-full bg-white" />
            </div>
          </div>
        ) : (
          <span
            className={cn(
              "relative z-10 size-2 rounded-full",
              notice.status === "past" ? "bg-dark-gray" : "bg-black"
            )}
          />
        )}
      </div>
      <div className="flex min-h-5 min-w-0 items-center">
        <p
          className={cn(
            "w-28 text-base leading-none font-bold",
            getHourTextClassName(notice.status)
          )}
        >
          {notice.label}
        </p>
        <Txt
          typography={notice.status === "current" ? "body-bold" : "body"}
          className={cn(getNoticeLabelClassName(notice.status))}
        >
          {notice.message}
        </Txt>
      </div>
    </li>
  );
}
