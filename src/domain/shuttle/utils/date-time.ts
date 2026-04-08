export function startOfLocalDay(reference: Date): Date {
  const d = new Date(reference.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(reference: Date, days: number): Date {
  const d = new Date(reference.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

export function addMinutes(reference: Date, minutes: number): Date {
  return new Date(reference.getTime() + minutes * 60_000);
}

/**
 * Postgres `time` 문자열(`HH:mm:ss` 또는 `HH:mm`)을 해당 로컬 일의 시각으로 변환한다.
 */
export function parsePgTimeOnLocalDay(dayStart: Date, time: string | null): Date | null {
  if (!time) {
    return null;
  }
  const parts: string[] = time.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1] ?? "0");
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }
  const d = new Date(dayStart.getTime());
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function buildFixedDepartureOnDay(dayStart: Date, hour: number, minute: number): Date {
  const d = new Date(dayStart.getTime());
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function formatHm(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function minutesBetweenCeil(from: Date, to: Date): number {
  const diffMs: number = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(diffMs / 60_000));
}
