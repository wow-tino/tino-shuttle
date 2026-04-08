import type { ShuttleServiceDay } from "#/domain/shuttle/api/models";

export function getServiceDayForLocalDate(reference: Date): ShuttleServiceDay {
  const day: number = reference.getDay();
  if (day === 0) {
    return "SUNDAY";
  }
  if (day === 6) {
    return "SATURDAY";
  }
  return "WEEKDAY";
}
