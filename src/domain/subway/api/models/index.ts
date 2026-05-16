import { z } from "zod";

/** 서울시 지하철 실시간 도착 API `realtimeArrivalList` 원본 항목 중 앱에서 쓰는 필드 */
export const SeoulRealtimeArrivalItemSchema = z.object({
  subwayId: z.string().optional(),
  updnLine: z.string().optional(),
  trainLineNm: z.string().optional(),
  bstatnNm: z.string().optional(),
  arvlMsg2: z.string().optional(),
  btrainSttus: z.string().optional(),
});

export type SeoulRealtimeArrivalItem = z.infer<typeof SeoulRealtimeArrivalItemSchema>;

/** 앱 프론트에서 실제로 사용하는 실시간 도착 정보 */
export const RealtimeArrivalItemSchema = z.object({
  subwayId: z.string(),
  updnLine: z.string(),
  trainLineNm: z.string(),
  bstatnNm: z.string(),
  arvlMsg2: z.string(),
  btrainSttus: z.string(),
});

export type RealtimeArrivalItem = z.infer<typeof RealtimeArrivalItemSchema>;

export const SeoulRealtimeStationArrivalApiResponseSchema = z.object({
  errorMessage: z
    .object({
      status: z.number().optional(),
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  realtimeArrivalList: z.array(SeoulRealtimeArrivalItemSchema).optional(),
});

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
