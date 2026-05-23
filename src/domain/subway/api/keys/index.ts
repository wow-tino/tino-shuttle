export const subwayKeys = {
  all: ["subway"] as const,
  list: () => [...subwayKeys.all, "list"] as const,
  preview: (stationName: string) => [...subwayKeys.all, "detail", stationName] as const,
  realtime: (lineName: string) => [...subwayKeys.all, "realtime", lineName] as const,
  timetable: (lineName: string) => [...subwayKeys.all, "timetable", "정왕", lineName] as const,
};
