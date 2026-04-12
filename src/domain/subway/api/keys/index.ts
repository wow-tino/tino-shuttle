export const subwayKeys = {
  all: ["subway"] as const,
  list: () => [...subwayKeys.all, "list"] as const,
  detail: (stationName: string) => [...subwayKeys.all, "detail", stationName] as const,
  create: () => [...subwayKeys.all, "create"] as const,
  update: () => [...subwayKeys.all, "update"] as const,
  delete: () => [...subwayKeys.all, "delete"] as const,
};
