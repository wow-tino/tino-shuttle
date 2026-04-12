export const ms = {
  seconds: (seconds: number) => seconds * 1000,
  minutes: (minutes: number) => minutes * 60 * 1000,
  hours: (hours: number) => hours * 60 * 60 * 1000,
};

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

export function parsePgTimeOnLocalDay(dayStart: Date, time: string | null) {
  if (!time) {
    return null;
  }
  const parts = time.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1] ?? "0");
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }
  const d = new Date(dayStart.getTime());
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function formatHm(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
