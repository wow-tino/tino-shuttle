export const shuttleKeys = {
  all: ["shuttle"] as const,
  list: () => [...shuttleKeys.all, "list"] as const,
  detail: (id: string) => [...shuttleKeys.all, "detail", id] as const,
  timetableRules: () => [...shuttleKeys.all, "timetableRules"] as const,
};
