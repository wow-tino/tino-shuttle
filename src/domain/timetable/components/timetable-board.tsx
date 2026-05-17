import { useEffect, useState } from "react";

import { TimetableHourRow } from "./timetable-hour-row";
import { TimetableNoticeRow } from "./timetable-notice-row";

import type { GetShuttleTimeProps } from "#/domain/shuttle/api/models";
import { buildTimetableHourGroups } from "#/domain/timetable/utils/build-timetable-hour-groups";
import { Txt } from "#/shared/components/txt";
import type { ShuttleServiceDay } from "#/shared/types/shuttle";

const TIMETABLE_CLOCK_SYNC_MS = 30_000;

interface TimetableBoardProps {
  shuttleTimes?: GetShuttleTimeProps[] | undefined;
  weekday: ShuttleServiceDay;
  isLoading: boolean;
  isError: boolean;
}

export function TimetableBoard({ shuttleTimes, weekday, isLoading, isError }: TimetableBoardProps) {
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());

  const timetableViewModel = buildTimetableHourGroups(shuttleTimes ?? [], new Date(currentTimeMs));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, TIMETABLE_CLOCK_SYNC_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (weekday === "SUNDAY") {
    return (
      <section className="content-border mx-5 bg-white px-4 py-8 text-center">
        <Txt typography="body-bold">일요일에는 셔틀이 운행되지 않아요.</Txt>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="content-border mx-5 bg-white px-4 py-6" aria-label="셔틀 시간표 로딩 중">
        <ol className="animate-pulse" aria-hidden>
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <li
              key={rowIndex}
              className="grid grid-cols-[14px_minmax(0,1fr)] gap-1.5 pb-9 last:pb-0"
            >
              <div className="relative flex min-h-5 items-center justify-center">
                {rowIndex > 0 ? (
                  <span className="absolute top-0 bottom-1/2 left-1/2 w-px -translate-x-1/2 bg-gray-200" />
                ) : null}
                {rowIndex < 9 ? (
                  <span className="absolute top-1/2 -bottom-9 left-1/2 w-px -translate-x-1/2 bg-gray-200" />
                ) : null}
                <span className="relative z-10 size-2 rounded-full bg-gray-200" />
              </div>
              <div className="flex min-h-5 min-w-0 items-center">
                <span className="h-4 w-10 shrink-0 rounded bg-gray-200" />
                <div className="flex min-w-0 items-center">
                  {Array.from({ length: rowIndex < 2 ? 3 : 5 }).map((__, minuteIndex) => (
                    <span
                      key={minuteIndex}
                      className="flex h-5 w-11 items-center justify-center border-l border-gray-200 first:border-l-0"
                    >
                      <span className="h-3 w-5 rounded bg-gray-200" />
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="content-border mx-5 bg-white px-4 py-8 text-center">
        <Txt typography="body-bold">셔틀 시간표를 불러오지 못했어요.</Txt>
      </section>
    );
  }

  if (timetableViewModel.timelineItems.length === 0) {
    return (
      <section className="content-border mx-5 bg-white px-4 py-8 text-center">
        <Txt typography="body-bold">선택한 노선의 시간표가 없어요.</Txt>
      </section>
    );
  }

  return (
    <section className="content-border mx-5 bg-white px-4 py-6" aria-label="셔틀 전체 시간표">
      <ol>
        {timetableViewModel.timelineItems.map((item, index) =>
          item.kind === "hour-group" ? (
            <TimetableHourRow
              key={item.id}
              group={item.group}
              isFirst={index === 0}
              isLast={index === timetableViewModel.timelineItems.length - 1}
            />
          ) : (
            <TimetableNoticeRow
              key={item.id}
              notice={item.notice}
              isFirst={index === 0}
              isLast={index === timetableViewModel.timelineItems.length - 1}
            />
          )
        )}
      </ol>
    </section>
  );
}
