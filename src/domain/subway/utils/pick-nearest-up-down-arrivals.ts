import type { RealtimeArrivalItem } from "#/domain/subway/api/models";

/** 전철 탭: 방향당 최대 열차 수 */
export const MAX_ARRIVALS_PER_DIRECTION = 3;

/**
 * API가 반환한 순서를 유지하며 상행·내선 / 하행·외선으로 나누는 만큼씩만 수집합니다.
 */
export function takeUpDownArrivalsByDirection(
  items: readonly RealtimeArrivalItem[],
  maxPerDirection: number
) {
  const upLines = [];
  const downLines = [];

  for (const item of items) {
    const direction = item.updnLine ?? "";
    if (isUpDirection(direction) && upLines.length < maxPerDirection) {
      upLines.push(item);
    } else if (isDownDirection(direction) && downLines.length < maxPerDirection) {
      downLines.push(item);
    }
  }

  return { upLines, downLines };
}

export interface PickNearestUpDownArrivalsResult {
  readonly upLine: RealtimeArrivalItem | null;
  readonly downLine: RealtimeArrivalItem | null;
}

/**
 * 동일 역에 대해 상행·하행(또는 내선·외선) 방향별로 API가 반환한 순서를 유지하며,
 * 각 방향의 첫 번째(가장 임박) 열차 1건씩 고릅니다.
 */
export function pickNearestUpDownArrivals(
  items: readonly RealtimeArrivalItem[]
): PickNearestUpDownArrivalsResult {
  const { upLines, downLines } = takeUpDownArrivalsByDirection(items, 1);
  return {
    upLine: upLines[0] ?? null,
    downLine: downLines[0] ?? null,
  };
}

function isUpDirection(updnLine: string): boolean {
  return updnLine === "상행" || updnLine === "내선";
}

function isDownDirection(updnLine: string): boolean {
  return updnLine === "하행" || updnLine === "외선";
}
