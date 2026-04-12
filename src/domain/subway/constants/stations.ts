/** 시간표 화면에서 지하철 도착정보를 표시할 역 (서울 Open API 역명과 동일해야 함) */
export const SUBWAY_ARRIVAL_STATION_NAMES = ["정왕", "오이도"] as const;

export type SubwayArrivalStationName = (typeof SUBWAY_ARRIVAL_STATION_NAMES)[number];
