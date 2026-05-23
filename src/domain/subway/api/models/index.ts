import { z } from "zod";

const DataGoKrOptionalStringSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);

/** 서울시 지하철 실시간 도착 API `realtimeArrivalList` 원본 항목 중 앱에서 쓰는 필드 */
export const SeoulRealtimeArrivalItemSchema = z.object({
  subwayId: z.string().optional(),
  updnLine: z.string().optional(),
  trainLineNm: z.string().optional(),
  bstatnNm: z.string().optional(),
  arvlMsg2: z.string().optional(),
  btrainSttus: z.string().optional(),
});

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

export const SubwayHomePreviewDirectionArrivalSchema = z.object({
  directionName: z.enum(["상행", "하행"]),
  directionLabel: z.string(),
  arrivalMainText: z.string(),
  arrivalSuffixText: z.string().nullable(),
});

export type SubwayHomePreviewDirectionArrival = z.infer<
  typeof SubwayHomePreviewDirectionArrivalSchema
>;

export const SubwayHomePreviewLineSchema = z.object({
  subwayId: z.string(),
  directions: z.array(SubwayHomePreviewDirectionArrivalSchema),
});

export type SubwayHomePreviewLine = z.infer<typeof SubwayHomePreviewLineSchema>;

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

export const GetSubwayHomePreviewResponseSchema = z.object({
  stationName: z.string(),
  arrivals: z.array(RealtimeArrivalItemSchema),
  lines: z.array(SubwayHomePreviewLineSchema),
});

export type GetSubwayHomePreviewResponse = z.infer<typeof GetSubwayHomePreviewResponseSchema>;

export const GetSubwayRealtimeTrainRowSchema = z.object({
  toward: z.string(),
  location: z.string(),
  subwwayType: z.string(),
});

export type GetSubwayRealtimeTrainRow = z.infer<typeof GetSubwayRealtimeTrainRowSchema>;

export const GetSubwayRealtimeResponseSchema = z.object({
  station: z.string(),
  uphill: z.array(GetSubwayRealtimeTrainRowSchema),
  downward: z.array(GetSubwayRealtimeTrainRowSchema),
});

export const GetSubwayTimetableTrainRowSchema = z.object({
  toward: z.string(),
  time: z.string(),
});

export type GetSubwayTimetableTrainRow = z.infer<typeof GetSubwayTimetableTrainRowSchema>;

export const GetSubwayTimetableResponseSchema = z.object({
  station: z.string(),
  uphill: z.array(GetSubwayTimetableTrainRowSchema),
  downward: z.array(GetSubwayTimetableTrainRowSchema),
});

export type GetSubwayRealtimeResponse = z.infer<typeof GetSubwayRealtimeResponseSchema>;
export type GetSubwayTimetableRequest = "4호선" | "수인분당선";
export type GetSubwayTimetableResponse = z.infer<typeof GetSubwayTimetableResponseSchema>;

export const DataGoKrTrainScheduleItemSchema = z.object({
  dptreTm: DataGoKrOptionalStringSchema,
  arvlTm: DataGoKrOptionalStringSchema,
  trainDptreTm: DataGoKrOptionalStringSchema,
  trainArvlTm: DataGoKrOptionalStringSchema,
  stnNm: DataGoKrOptionalStringSchema,
  upbdnbSe: DataGoKrOptionalStringSchema,
  arvlStnNm: DataGoKrOptionalStringSchema,
  dptreStnNm: DataGoKrOptionalStringSchema,
  trainKnd: DataGoKrOptionalStringSchema,
  trainno: DataGoKrOptionalStringSchema,
  trainNo: DataGoKrOptionalStringSchema,
  etrnYn: DataGoKrOptionalStringSchema,
});

export type DataGoKrTrainScheduleItem = z.infer<typeof DataGoKrTrainScheduleItemSchema>;

export const DataGoKrTrainScheduleItemsSchema = z
  .union([
    z.object({ item: z.array(DataGoKrTrainScheduleItemSchema).optional() }),
    z.object({ item: DataGoKrTrainScheduleItemSchema.optional() }),
    z.literal(""),
  ])
  .optional();

export const DataGoKrTrainScheduleApiResponseSchema = z.object({
  response: z.object({
    header: z
      .object({
        resultCode: z.string().optional(),
        resultMsg: z.string().optional(),
      })
      .optional(),
    body: z
      .object({
        items: DataGoKrTrainScheduleItemsSchema,
        numOfRows: z.number().optional(),
        pageNo: z.number().optional(),
        totalCount: z.number().optional(),
      })
      .optional(),
  }),
});

export type DataGoKrTrainScheduleApiResponse = z.infer<
  typeof DataGoKrTrainScheduleApiResponseSchema
>;
