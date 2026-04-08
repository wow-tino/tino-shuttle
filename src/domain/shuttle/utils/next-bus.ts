import type { ShuttleServiceDay, ShuttleTimetableRuleDto } from "#/domain/shuttle/api/models";
import {
  addDays,
  addMinutes,
  buildFixedDepartureOnDay,
  formatHm,
  minutesBetweenCeil,
  parsePgTimeOnLocalDay,
  startOfLocalDay,
} from "#/domain/shuttle/utils/date-time";
import { getServiceDayForLocalDate } from "#/domain/shuttle/utils/service-day";

const MAX_LINK_DEPTH = 6;

export type ShuttleBoardStatus = "waiting" | "in_service_adhoc" | "ended_today";

export interface ShuttleBoardViewModel {
  readonly patternCode: string;
  readonly patternNameKo: string;
  readonly departureTimeLabel: string | null;
  readonly minutesRemaining: number | null;
  readonly status: ShuttleBoardStatus;
  readonly detailNote: string | null;
  readonly nextDayFirstLabel: string | null;
}

function filterRules(
  rules: ShuttleTimetableRuleDto[],
  patternId: number,
  serviceDay: ShuttleServiceDay
): ShuttleTimetableRuleDto[] {
  return rules.filter((r) => r.patternId === patternId && r.serviceDay === serviceDay);
}

function collectFixedDeparturesOnDay(
  patternId: number,
  serviceDay: ShuttleServiceDay,
  rules: ShuttleTimetableRuleDto[],
  dayStart: Date
): Date[] {
  const list: Date[] = [];
  for (const r of rules) {
    if (r.patternId !== patternId || r.serviceDay !== serviceDay || r.mode !== "FIXED") {
      continue;
    }
    if (r.hour === null || r.minute === null) {
      continue;
    }
    list.push(buildFixedDepartureOnDay(dayStart, r.hour, r.minute));
  }
  return list.sort((a, b) => a.getTime() - b.getTime());
}

function earliestFixedOnDay(
  patternId: number,
  serviceDay: ShuttleServiceDay,
  rules: ShuttleTimetableRuleDto[],
  dayStart: Date
): Date | null {
  const candidates: Date[] = collectFixedDeparturesOnDay(patternId, serviceDay, rules, dayStart);
  if (candidates.length === 0) {
    return null;
  }
  return candidates[0] ?? null;
}

function isInFrequencyWindow(rule: ShuttleTimetableRuleDto, now: Date, dayStart: Date): boolean {
  if (rule.mode !== "FREQUENCY") {
    return false;
  }
  const start = parsePgTimeOnLocalDay(dayStart, rule.startTime);
  const end = parsePgTimeOnLocalDay(dayStart, rule.endTime);
  if (!start || !end) {
    return false;
  }
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

function nextFrequencySlot(rule: ShuttleTimetableRuleDto, now: Date, dayStart: Date): Date | null {
  if (rule.mode !== "FREQUENCY" || rule.headwayMin === null || rule.headwayMin <= 0) {
    return null;
  }
  const start = parsePgTimeOnLocalDay(dayStart, rule.startTime);
  const end = parsePgTimeOnLocalDay(dayStart, rule.endTime);
  if (!start || !end) {
    return null;
  }
  if (now.getTime() > end.getTime()) {
    return null;
  }
  const effectiveStartMs: number = Math.max(start.getTime(), now.getTime());
  const headwayMs: number = rule.headwayMin * 60_000;
  const delta: number = effectiveStartMs - start.getTime();
  const slotsPassed: number = Math.ceil(delta / headwayMs);
  let candidate: Date = new Date(start.getTime() + slotsPassed * headwayMs);
  if (candidate.getTime() <= now.getTime()) {
    candidate = new Date(candidate.getTime() + headwayMs);
  }
  if (candidate.getTime() > end.getTime()) {
    return null;
  }
  return candidate;
}

function getNextDepartureInstant(
  patternId: number,
  now: Date,
  rules: ShuttleTimetableRuleDto[],
  depth: number
): Date | null {
  if (depth > MAX_LINK_DEPTH) {
    return null;
  }

  const dayStart: Date = startOfLocalDay(now);
  const serviceDay: ShuttleServiceDay = getServiceDayForLocalDate(now);
  const subset: ShuttleTimetableRuleDto[] = filterRules(rules, patternId, serviceDay);

  const candidates: Date[] = [];

  for (const r of subset) {
    if (r.mode === "FIXED" && r.hour !== null && r.minute !== null) {
      const at: Date = buildFixedDepartureOnDay(dayStart, r.hour, r.minute);
      if (at.getTime() > now.getTime()) {
        candidates.push(at);
      }
    }
    if (r.mode === "FREQUENCY") {
      const slot = nextFrequencySlot(r, now, dayStart);
      if (slot) {
        candidates.push(slot);
      }
    }
    if (r.mode === "ARRIVAL_LINKED" && r.linkedPatternId !== null) {
      const start: Date | null = parsePgTimeOnLocalDay(dayStart, r.startTime);
      const end: Date | null = parsePgTimeOnLocalDay(dayStart, r.endTime);
      if (!start || !end) {
        continue;
      }
      if (now.getTime() > end.getTime()) {
        continue;
      }

      // ARRIVAL_LINKED는 "현재가 윈도우 안"이 아니더라도, 윈도우 시작 시점부터의 다음 출발을 탐색해야 한다.
      // (자정 직후처럼 start 이전에 조회하면 next가 없다고 판단해 ended_today로 떨어지는 케이스를 방지)
      const effectiveNow: Date = now.getTime() < start.getTime() ? start : now;
      const linkedNext: Date | null = getNextDepartureInstant(
        r.linkedPatternId,
        effectiveNow,
        rules,
        depth + 1
      );
      if (!linkedNext) {
        continue;
      }
      const candidate: Date = addMinutes(linkedNext, r.offsetMin);
      if (candidate.getTime() <= now.getTime()) {
        continue;
      }
      if (candidate.getTime() > end.getTime()) {
        continue;
      }
      candidates.push(candidate);
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((a, b) => (a.getTime() <= b.getTime() ? a : b));
}

function hasAdhocFrequencyNow(
  patternId: number,
  now: Date,
  rules: ShuttleTimetableRuleDto[]
): { readonly note: string | null } | null {
  const dayStart: Date = startOfLocalDay(now);
  const serviceDay: ShuttleServiceDay = getServiceDayForLocalDate(now);
  const subset: ShuttleTimetableRuleDto[] = filterRules(rules, patternId, serviceDay);
  for (const r of subset) {
    if (r.mode !== "FREQUENCY") {
      continue;
    }
    if (r.headwayMin !== null && r.headwayMin > 0) {
      continue;
    }
    if (isInFrequencyWindow(r, now, dayStart)) {
      return { note: r.note };
    }
  }
  return null;
}

function getTomorrowFirstDepartureLabel(
  patternId: number,
  rules: ShuttleTimetableRuleDto[],
  fromNow: Date
): string | null {
  for (let add = 1; add <= 7; add += 1) {
    const day: Date = addDays(startOfLocalDay(fromNow), add);
    const sd: ShuttleServiceDay = getServiceDayForLocalDate(day);
    const first: Date | null = earliestFixedOnDay(patternId, sd, rules, day);
    if (first) {
      return formatHm(first);
    }
  }
  return null;
}

export interface BuildShuttleBoardInput {
  readonly patternCode: string;
  readonly patternNameKo: string;
  readonly patternId: number;
  readonly rules: ShuttleTimetableRuleDto[];
  readonly now: Date;
}

export function computeNextShuttleDepartureAt(
  patternId: number,
  now: Date,
  rules: ShuttleTimetableRuleDto[]
): Date | null {
  return getNextDepartureInstant(patternId, now, rules, 0);
}

export function computeLastShuttleDepartureAt(
  patternId: number,
  now: Date,
  rules: ShuttleTimetableRuleDto[]
): Date | null {
  const dayStart: Date = startOfLocalDay(now);
  const dayEnd: Date = addDays(dayStart, 1);

  let cursor: Date = new Date(dayStart.getTime());
  let last: Date | null = null;

  // nextDeparture 계산 로직을 그대로 재사용해 "오늘의 마지막 출발"을 찾는다.
  // (규칙/연결 모드가 섞여 있어도 일관되게 동작)
  for (let i = 0; i < 512; i += 1) {
    const next: Date | null = getNextDepartureInstant(patternId, cursor, rules, 0);
    if (!next) {
      break;
    }
    if (next.getTime() >= dayEnd.getTime()) {
      break;
    }
    last = next;
    cursor = new Date(next.getTime() + 1_000);
  }

  return last;
}

export function buildShuttleBoardViewModel(input: BuildShuttleBoardInput): ShuttleBoardViewModel {
  const { patternCode, patternNameKo, patternId, rules, now } = input;
  // 수시 운행(FREQUENCY + headway 없음) 구간과 고정 시각이 같은 날에 겹치면,
  // 다음 고정 출발을 먼저 보면 항상 waiting으로 떨어져 수시 UI가 안 보인다.
  const adhoc = hasAdhocFrequencyNow(patternId, now, rules);
  if (adhoc) {
    return {
      patternCode,
      patternNameKo,
      departureTimeLabel: null,
      minutesRemaining: null,
      status: "in_service_adhoc",
      detailNote: adhoc.note,
      nextDayFirstLabel: null,
    };
  }

  const nextInstant: Date | null = getNextDepartureInstant(patternId, now, rules, 0);

  if (nextInstant) {
    return {
      patternCode,
      patternNameKo,
      departureTimeLabel: formatHm(nextInstant),
      minutesRemaining: minutesBetweenCeil(now, nextInstant),
      status: "waiting",
      detailNote: null,
      nextDayFirstLabel: null,
    };
  }

  const tomorrowLabel: string | null = getTomorrowFirstDepartureLabel(patternId, rules, now);
  return {
    patternCode,
    patternNameKo,
    departureTimeLabel: null,
    minutesRemaining: null,
    status: "ended_today",
    detailNote: null,
    nextDayFirstLabel: tomorrowLabel,
  };
}

/** 테스트·디버깅용 */
export const __testExports = {
  getNextDepartureInstant,
  getServiceDayForLocalDate,
  startOfLocalDay,
  computeLastShuttleDepartureAt,
};
