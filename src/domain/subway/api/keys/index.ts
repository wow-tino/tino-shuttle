export const subwayKeys = {
  all: ["subway"] as const,
  list: () => [...subwayKeys.all, "list"] as const,
  detail: (stationName: string) => [...subwayKeys.all, "detail", stationName] as const,
  arrival: (stationName: string) => [...subwayKeys.all, "arrival", stationName] as const,
};
