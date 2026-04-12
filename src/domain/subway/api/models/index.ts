import { z } from "zod";

/** 서울시 지하철 실시간 도착 API `realtimeArrivalList` 항목 (필요 필드 위주) */
export const RealtimeArrivalItemSchema = z
  .object({
    subwayId: z.string().optional(),
    updnLine: z.string().optional(),
    statnNm: z.string().optional(),
    trainLineNm: z.string().optional(),
    bstatnNm: z.string().optional(),
    arvlMsg2: z.string().optional(),
    arvlMsg3: z.string().optional(),
    btrainSttus: z.string().optional(),
    arvlCd: z.string().optional(),
    recptnDt: z.string().optional(),
  })
  .passthrough();

export type RealtimeArrivalItem = z.infer<typeof RealtimeArrivalItemSchema>;

export const SeoulRealtimeStationArrivalApiResponseSchema = z
  .object({
    errorMessage: z
      .object({
        status: z.number().optional(),
        code: z.string().optional(),
        message: z.string().optional(),
      })
      .passthrough()
      .optional(),
    realtimeArrivalList: z.array(RealtimeArrivalItemSchema).optional(),
  })
  .passthrough();

export type SeoulRealtimeStationArrivalApiResponse = z.infer<
  typeof SeoulRealtimeStationArrivalApiResponseSchema
>;

export const GetRealtimeStationArrivalResponseSchema = z.object({
  stationName: z.string(),
  arrivals: z.array(RealtimeArrivalItemSchema),
});

export type GetRealtimeStationArrivalResponse = z.infer<
  typeof GetRealtimeStationArrivalResponseSchema
>;
