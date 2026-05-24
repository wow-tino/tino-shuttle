import { useState } from "react";

import { useQueries } from "@tanstack/react-query";

import type { GetSubwayTimetableRequest } from "../api/models";
import { SUBWAY_QUERIES } from "../api/queries";

import refreshIcon from "/icons/refresh.svg";
import { SubwayRealtimeSection } from "#/domain/subway/components/subway-realtime-section";
import { SubwayTimetableSection } from "#/domain/subway/components/subway-timetable-section";
import { Loading } from "#/shared/components/loading";
import { Txt } from "#/shared/components/txt";
import { cn } from "#/shared/utils";
import { formatUpdatedTime } from "#/shared/utils/time";

const TIMETABLE_TABS = ["realtime", "timetable"] as const;
type TimetableTab = (typeof TIMETABLE_TABS)[number];

const LINE_CONFIG = {
  "4호선": {
    color: "text-line-number4",
    other: "수인분당선" as GetSubwayTimetableRequest,
    uphillLabel: "신길온천 방면",
    downwardLabel: "오이도 방면",
  },
  수인분당선: {
    color: "text-line-suin-bundang",
    other: "4호선" as GetSubwayTimetableRequest,
    uphillLabel: "왕십리 방면",
    downwardLabel: "인천 방면",
  },
} as const;

export function SubwayScreen() {
  const [selectedLine, setSelectedLine] = useState<GetSubwayTimetableRequest>("4호선");
  const [selectedTab, setSelectedTab] = useState<TimetableTab>("realtime");
  const config = LINE_CONFIG[selectedLine];

  const [
    {
      data: realtimeData,
      isLoading: realtimeIsLoading,
      isError: realtimeIsError,
      refetch: realtimeRefetch,
      dataUpdatedAt: realtimeDataUpdatedAt,
      isFetching: realtimeIsFetching,
    },
    {
      data: timetableData,
      isLoading: timetableIsLoading,
      isError: timetableIsError,
      refetch: timetableRefetch,
      dataUpdatedAt: timetableDataUpdatedAt,
      isFetching: timetableIsFetching,
    },
  ] = useQueries({
    queries: [
      SUBWAY_QUERIES.GetSubwayRealtime(selectedLine),
      SUBWAY_QUERIES.GetSubwayTimetable(selectedLine),
    ],
  });

  const updateTime = formatUpdatedTime(
    selectedTab === "realtime" ? realtimeDataUpdatedAt : timetableDataUpdatedAt
  );

  const isLoading = selectedTab === "realtime" ? realtimeIsLoading : timetableIsLoading;
  const isError = selectedTab === "realtime" ? realtimeIsError : timetableIsError;

  const onRefreshClick = () => {
    if (selectedTab === "realtime") {
      realtimeRefetch();
      return;
    }
    timetableRefetch();
  };

  const isFetching = selectedTab === "realtime" ? realtimeIsFetching : timetableIsFetching;

  return (
    <main className="flex flex-col px-5 py-8">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <Txt typography="h1-title">
            정왕역 <span className={config.color}>{selectedLine}</span>
          </Txt>
          <Txt
            as="button"
            onClick={() => setSelectedLine(config.other)}
            className={cn(
              "shrink-0 rounded-full border-[1.5px] border-current px-3 py-2 leading-none",
              LINE_CONFIG[config.other].color
            )}
            aria-label={`${config.other}으로 노선 변경`}
          >
            {config.other}
          </Txt>
        </div>
        <Txt typography="p">
          서울시 열린데이터 기준으로 갱신되며,
          <br />
          원천 지연에 따라 실제와 차이가 날 수 있습니다.
        </Txt>
      </div>

      <div className="bg-light-gray -mx-5 mt-6 mb-5 h-px" />

      <div className="mb-9 flex items-center justify-between gap-3">
        <div className="border-dark-gray flex rounded-full bg-white">
          {TIMETABLE_TABS.map((tab) => (
            <Txt
              as="button"
              typography={selectedTab === tab ? "p-bold" : "body"}
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "text-dark-gray px-2.5 py-1.5 leading-none",
                selectedTab === tab &&
                  "border-tu-blue text-tu-blue -m-px rounded-full border-[1.5px]"
              )}
            >
              {tab === "realtime" ? "실시간" : "시간표"}
            </Txt>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Txt className="text-dark-gray" typography="caption">
            {updateTime}
          </Txt>
          <button
            aria-label="전철 도착 정보 새로고침"
            disabled={isFetching}
            onClick={onRefreshClick}
            className={cn(isFetching && "animate-spin opacity-50")}
          >
            <img src={refreshIcon} alt="refresh" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loading containerClassName="min-h-app-main" title="전철 정보를 불러오는 중이에요..." />
      ) : isError ? (
        <Txt className="mx-auto">전철 정보를 불러오는 중 오류가 발생했어요</Txt>
      ) : selectedTab === "realtime" && realtimeData ? (
        <SubwayRealtimeSection
          uphill={realtimeData.data.uphill}
          downward={realtimeData.data.downward}
          uphillLabel={config.uphillLabel}
          downwardLabel={config.downwardLabel}
        />
      ) : selectedTab === "timetable" && timetableData ? (
        <SubwayTimetableSection
          uphill={timetableData.data.uphill}
          downward={timetableData.data.downward}
          uphillLabel={config.uphillLabel}
          downwardLabel={config.downwardLabel}
        />
      ) : null}
    </main>
  );
}
