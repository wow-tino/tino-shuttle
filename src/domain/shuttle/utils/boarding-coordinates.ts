import type { ShuttlePatternDto } from "#/domain/shuttle/api/models";

export type BoardingCoordinateSource = "day" | "evening";

export interface ResolvedBoardingCoordinates {
  readonly latitude: number;
  readonly longitude: number;
  readonly source: BoardingCoordinateSource;
}

/**
 * 노선별 주간/저녁 탑승 위치 좌표를 현재 시각 기준으로 고른다.
 * 저녁 좌표가 있고 로컬 시각이 `eveningStartHourLocal` 이상이면 저녁 좌표를 쓴다.
 */
export function resolveBoardingCoordinates(
  pattern: ShuttlePatternDto,
  reference: Date,
  eveningStartHourLocal: number,
): ResolvedBoardingCoordinates | null {
  const hourLocal: number = reference.getHours();
  const hasEvening: boolean =
    pattern.boardingEveningLatitude !== null && pattern.boardingEveningLongitude !== null;
  const hasDay: boolean =
    pattern.boardingLatitude !== null && pattern.boardingLongitude !== null;

  if (hourLocal >= eveningStartHourLocal && hasEvening) {
    return {
      latitude: pattern.boardingEveningLatitude as number,
      longitude: pattern.boardingEveningLongitude as number,
      source: "evening",
    };
  }

  if (hasDay) {
    return {
      latitude: pattern.boardingLatitude as number,
      longitude: pattern.boardingLongitude as number,
      source: "day",
    };
  }

  if (hasEvening) {
    return {
      latitude: pattern.boardingEveningLatitude as number,
      longitude: pattern.boardingEveningLongitude as number,
      source: "evening",
    };
  }

  return null;
}
