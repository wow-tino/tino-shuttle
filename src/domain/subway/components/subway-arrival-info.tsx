import { useQuery } from "@tanstack/react-query";

import lineNumber4Icon from "/icons/line-number4.svg";
import lineSuinBundangIcon from "/icons/line-suin-bundang.svg";
import refreshIcon from "/icons/refresh.svg";
import type { RealtimeArrivalItem } from "#/domain/subway/api/models";
import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { Txt } from "#/shared/components/txt";
import { cn } from "#/shared/utils";

const SHUTTLE_HOME_SUBWAY_STATION_NAME = "정왕";

type SubwayDirectionName = "상행" | "하행";

const SHUTTLE_HOME_SUBWAY_LINE_CONFIGS = [
  {
    subwayId: "1004",
    iconSrc: lineNumber4Icon,
    iconAlt: "4호선",
    arrivalTextClassName: "text-line-number4",
    directions: [
      {
        directionName: "상행" as const,
        fallbackDirectionStationName: "신길온천",
        fallbackDestinationStationName: "불암산",
      },
      {
        directionName: "하행" as const,
        fallbackDirectionStationName: "오이도",
        fallbackDestinationStationName: "오이도",
      },
    ],
  },
  {
    subwayId: "1075",
    iconSrc: lineSuinBundangIcon,
    iconAlt: "수인분당선",
    arrivalTextClassName: "text-line-suin-bundang",
    directions: [
      {
        directionName: "상행" as const,
        fallbackDirectionStationName: "왕십리",
        fallbackDestinationStationName: "왕십리",
      },
      {
        directionName: "하행" as const,
        fallbackDirectionStationName: "인천",
        fallbackDestinationStationName: "인천",
      },
    ],
  },
];

function findNearestArrival(input: {
  arrivals: RealtimeArrivalItem[];
  subwayId: string;
  directionName: SubwayDirectionName;
}): RealtimeArrivalItem | null {
  return (
    input.arrivals.find((arrival: RealtimeArrivalItem) => {
      return arrival.subwayId === input.subwayId && arrival.updnLine === input.directionName;
    }) ?? null
  );
}

function getDirectionLabel(input: {
  arrival: RealtimeArrivalItem | null;
  fallbackDirectionStationName: string;
  fallbackDestinationStationName: string;
}): string {
  const trainLineName = input.arrival ? input.arrival.trainLineNm.trim() : "";
  const trainLineNameMatch = trainLineName.match(/^(.+?)행\s*-\s*(.+?)방면$/);

  if (trainLineNameMatch?.[1] && trainLineNameMatch[2]) {
    return `${trainLineNameMatch[2]} 방면 (${trainLineNameMatch[1]}행)`;
  }

  const destinationStationName =
    input.arrival?.bstatnNm.trim() ?? input.fallbackDestinationStationName;

  return `${input.fallbackDirectionStationName} 방면 (${destinationStationName}행)`;
}

function getArrivalDisplayMessage(arrival: RealtimeArrivalItem | null) {
  const arrivalMessage = arrival ? arrival.arvlMsg2.trim() : "";
  if (arrivalMessage.length === 0) {
    return {
      mainText: "도착 정보 없음",
      suffixText: null,
    };
  }

  const afterArrivalMatch = arrivalMessage.match(/^(.+?)\s*후$/);
  if (afterArrivalMatch?.[1]) {
    return {
      mainText: afterArrivalMatch[1],
      suffixText: "후 도착",
    };
  }

  return {
    mainText: arrivalMessage,
    suffixText: null,
  };
}

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

function ShuttleHomeSubwayArrivalItem(input: {
  arrival: RealtimeArrivalItem | null;
  fallbackDirectionStationName: string;
  fallbackDestinationStationName: string;
  arrivalTextClassName: string;
}) {
  const directionLabel = getDirectionLabel({
    arrival: input.arrival,
    fallbackDirectionStationName: input.fallbackDirectionStationName,
    fallbackDestinationStationName: input.fallbackDestinationStationName,
  });
  const arrivalDisplayMessage = getArrivalDisplayMessage(input.arrival);

  return (
    <div className="bg-background space-y-1 rounded-md px-3 py-2.5">
      <p className="text-xs">{directionLabel}</p>
      <div className="flex items-end gap-1">
        <Txt typography="body-bold" className={input.arrivalTextClassName}>
          {arrivalDisplayMessage.mainText}
        </Txt>
        {arrivalDisplayMessage.suffixText ? (
          <p className="text-xxs text-dark-black font-light">{arrivalDisplayMessage.suffixText}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SubwayArrival() {
  const { data, refetch, dataUpdatedAt, isFetching } = useQuery(
    SUBWAY_QUERIES.GetRealtimeStationArrival(SHUTTLE_HOME_SUBWAY_STATION_NAME)
  );

  const arrivals = data?.arrivals ?? [];
  const updatedTime = formatUpdatedTime(dataUpdatedAt);

  const onRefreshClick = () => {
    refetch();
  };

  return (
    <div className="content-border bg-white px-5 py-6" aria-label="정왕역 전철 실시간 도착 정보">
      <div className="flex items-center justify-between">
        <Txt typography="headline">전철 시간표</Txt>
        <div className="flex items-center gap-2">
          <Txt className="text-dark-black" typography="caption">
            {updatedTime}
          </Txt>
          <button
            aria-label="전철 도착 정보 새로고침"
            disabled={isFetching}
            onClick={onRefreshClick}
            className={cn(isFetching && "opacity-50")}
          >
            <img src={refreshIcon} alt="refresh" />
          </button>
        </div>
      </div>
      <div className="bg-gray my-3 h-px" />
      <div className="flex gap-[18px]" role="list" aria-label="노선별 실시간 도착 정보">
        {SHUTTLE_HOME_SUBWAY_LINE_CONFIGS.map((lineConfig) => (
          <div key={lineConfig.subwayId} className="flex-1 space-y-1">
            <img src={lineConfig.iconSrc} alt={lineConfig.iconAlt} />
            {lineConfig.directions.map((directionConfig) => {
              const arrival = findNearestArrival({
                arrivals: arrivals,
                subwayId: lineConfig.subwayId,
                directionName: directionConfig.directionName,
              });

              return (
                <ShuttleHomeSubwayArrivalItem
                  key={`${lineConfig.subwayId}-${directionConfig.directionName}`}
                  arrival={arrival}
                  fallbackDirectionStationName={directionConfig.fallbackDirectionStationName}
                  fallbackDestinationStationName={directionConfig.fallbackDestinationStationName}
                  arrivalTextClassName={lineConfig.arrivalTextClassName}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
