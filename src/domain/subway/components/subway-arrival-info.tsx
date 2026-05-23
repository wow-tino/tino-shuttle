import { useQuery } from "@tanstack/react-query";

import lineNumber4Icon from "/icons/line-number4.svg";
import lineSuinBundangIcon from "/icons/line-suin-bundang.svg";
import refreshIcon from "/icons/refresh.svg";
import type {
  SubwayHomePreviewDirectionArrival,
  SubwayHomePreviewLine,
} from "#/domain/subway/api/models";
import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { Spinner } from "#/shared/components/spinner";
import { Txt } from "#/shared/components/txt";
import { cn } from "#/shared/utils";

const SHUTTLE_HOME_SUBWAY_STATION_NAME = "정왕";

const SHUTTLE_HOME_SUBWAY_LINE_PRESENTATIONS = [
  {
    subwayId: "1004",
    iconSrc: lineNumber4Icon,
    iconAlt: "4호선",
    arrivalTextClassName: "text-line-number4",
  },
  {
    subwayId: "1075",
    iconSrc: lineSuinBundangIcon,
    iconAlt: "수인분당선",
    arrivalTextClassName: "text-line-suin-bundang",
  },
];

function formatUpdatedTime(dataUpdatedAt: number) {
  if (dataUpdatedAt <= 0) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dataUpdatedAt));
}

function getSubwayHomeLinePresentation(subwayLine: SubwayHomePreviewLine) {
  return SHUTTLE_HOME_SUBWAY_LINE_PRESENTATIONS.find((linePresentation) => {
    return linePresentation.subwayId === subwayLine.subwayId;
  });
}

function ShuttleHomeSubwayArrivalItem(input: {
  arrival: SubwayHomePreviewDirectionArrival;
  arrivalTextClassName: string;
}) {
  return (
    <div className="bg-background space-y-1 rounded-md px-3 py-2.5">
      <p className="text-xs">{input.arrival.directionLabel}</p>
      <div className="flex items-end gap-1">
        <Txt typography="body-bold" className={input.arrivalTextClassName}>
          {input.arrival.arrivalMainText}
        </Txt>
        {input.arrival.arrivalSuffixText ? (
          <p className="text-xxs text-dark-gray font-light">{input.arrival.arrivalSuffixText}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SubwayArrival() {
  const { data, refetch, dataUpdatedAt, isLoading, isFetching } = useQuery(
    SUBWAY_QUERIES.GetSubwayHomePreview(SHUTTLE_HOME_SUBWAY_STATION_NAME)
  );

  const subwayLines = data?.lines ?? [];
  const updatedTime = formatUpdatedTime(dataUpdatedAt);

  const onRefreshClick = () => {
    refetch();
  };

  return (
    <div className="content-border bg-white px-5 py-6" aria-label="정왕역 전철 실시간 도착 정보">
      <div className="flex items-center justify-between">
        <Txt typography="headline">전철 시간표</Txt>
        <div className="flex items-center gap-2">
          <Txt className="text-dark-gray" typography="caption">
            {updatedTime}
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
      <div className="bg-gray my-3 h-px" />
      <div className="flex gap-[18px]" role="list" aria-label="노선별 실시간 도착 정보">
        {isLoading ? (
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <Spinner />
            <Txt typography="caption">전철 시간표를 불러오는 중이에요...</Txt>
          </div>
        ) : (
          subwayLines.map((subwayLine) => {
            const linePresentation = getSubwayHomeLinePresentation(subwayLine);
            if (!linePresentation) {
              return null;
            }

            return (
              <div key={subwayLine.subwayId} className="flex-1 space-y-1">
                <img src={linePresentation.iconSrc} alt={linePresentation.iconAlt} />
                {subwayLine.directions.map((arrival) => (
                  <ShuttleHomeSubwayArrivalItem
                    key={`${subwayLine.subwayId}-${arrival.directionName}`}
                    arrival={arrival}
                    arrivalTextClassName={linePresentation.arrivalTextClassName}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
