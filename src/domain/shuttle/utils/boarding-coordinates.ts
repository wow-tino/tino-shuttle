import type { ShuttlePatternDto } from "#/domain/shuttle/api/models";

export type BoardingCoordinateSource = "day" | "evening";

export interface ResolvedBoardingCoordinates {
  latitude: number;
  longitude: number;
  source: BoardingCoordinateSource;
}

/**
 * 노선별 주간/저녁 탑승 위치 좌표를 현재 시각 기준으로 고른다.
 * 저녁 좌표가 있고 로컬 시각이 `eveningStartHourLocal` 이상이면 저녁 좌표를 쓴다.
 */
export function resolveBoardingCoordinates(
  pattern: ShuttlePatternDto,
  reference: Date,
  eveningStartHourLocal: number
): ResolvedBoardingCoordinates {
  const hourLocal = reference.getHours();
  const {
    boardingLatitude,
    boardingLongitude,
    boardingEveningLatitude,
    boardingEveningLongitude,
  } = pattern;

  if (
    hourLocal >= eveningStartHourLocal &&
    boardingEveningLatitude !== null &&
    boardingEveningLongitude !== null
  ) {
    return {
      latitude: boardingEveningLatitude,
      longitude: boardingEveningLongitude,
      source: "evening",
    };
  }

  if (boardingLatitude !== null && boardingLongitude !== null) {
    return {
      latitude: boardingLatitude,
      longitude: boardingLongitude,
      source: "day",
    };
  }

  if (boardingEveningLatitude !== null && boardingEveningLongitude !== null) {
    return {
      latitude: boardingEveningLatitude,
      longitude: boardingEveningLongitude,
      source: "evening",
    };
  }

  throw new Error("탑승 위치 좌표를 찾을 수 없습니다. 관리자에게 문의해 주세요.");
}
