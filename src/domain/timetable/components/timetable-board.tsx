import { useEffect, useState } from "react";

import { TimetableHourRow } from "./timetable-hour-row";

import type { GetShuttleTimesResponse } from "#/domain/shuttle/api/models";
import { buildTimetableHourGroups } from "#/domain/timetable/utils/build-timetable-hour-groups";
import { Txt } from "#/shared/components/txt";
import type { ShuttleServiceDay } from "#/shared/types/shuttle";

const TIMETABLE_CLOCK_SYNC_MS = 30_000;

interface TimetableBoardProps {
  shuttleTimes?: GetShuttleTimesResponse | undefined;
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
        <div className="space-y-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="size-2 rounded-full bg-gray-200" />
              <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
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

  if (timetableViewModel.hourGroups.length === 0 && timetableViewModel.notices.length === 0) {
    return (
      <section className="content-border mx-5 bg-white px-4 py-8 text-center">
        <Txt typography="body-bold">선택한 노선의 시간표가 없어요.</Txt>
      </section>
    );
  }

  return (
    <section className="content-border mx-5 bg-white px-4 py-6" aria-label="셔틀 전체 시간표">
      {timetableViewModel.hourGroups.length > 0 ? (
        <ol>
          {timetableViewModel.hourGroups.map((group, index) => (
            <TimetableHourRow
              key={group.hour}
              group={group}
              isFirst={index === 0}
              isLast={index === timetableViewModel.hourGroups.length - 1}
            />
          ))}
        </ol>
      ) : null}

      {timetableViewModel.notices.length > 0 ? (
        <div className="mt-2 space-y-2 border-t border-[#edf0f3] pt-4">
          {timetableViewModel.notices.map((notice) => (
            <div key={notice.id} className="rounded-lg bg-[#f8f9fb] px-3 py-2">
              <p className="text-dark-gray text-sm font-semibold">{notice.label}</p>
              <p className="text-xs text-gray-500">{notice.message}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
