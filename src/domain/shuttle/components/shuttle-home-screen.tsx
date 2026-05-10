import { useSuspenseQuery } from "@tanstack/react-query";

import lineNumber4Icon from "/icons/line-number4.svg";
import lineSuinBundangIcon from "/icons/line-suin-bundang.svg";
import reloadIcon from "/icons/reload.svg";
import swapIcon from "/icons/swap.svg";
import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { Button } from "#/shared/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/select";
import { Txt } from "#/shared/components/txt";

export function ShuttleHomeScreen() {
  const { data } = useSuspenseQuery(SHUTTLE_QUERIES.GetShuttlePatterns());

  const patterns = data.patterns;

  return (
    <main className="flex flex-col py-8">
      <section className="space-y-[25px] px-7">
        <div className="space-y-2">
          <Txt typography="h1-title">티노 셔틀</Txt>
          <Txt typography="p">등/하교 셔틀을 한눈에 확인하세요.</Txt>
        </div>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5">
          <div className="col-start-1 row-span-2 row-start-1 grid min-h-0 min-w-0 grid-rows-subgrid">
            <div className="relative row-start-1 flex items-center justify-center">
              <div
                aria-hidden
                className="absolute top-1/2 -bottom-1.5 left-1/2 w-0.5 -translate-x-1/2 bg-[#d0d0d0]"
              />
              <div className="relative z-10 flex size-3.5 items-center justify-center rounded-full bg-[#2959A34D]">
                <div className="bg-tu-blue flex size-2.5 items-center justify-center rounded-full">
                  <div className="size-1 rounded-full bg-white" />
                </div>
              </div>
            </div>
            <div className="relative row-start-2 flex items-center justify-center">
              <div
                aria-hidden
                className="absolute -top-1.5 bottom-1/2 left-1/2 w-0.5 -translate-x-1/2 bg-[#d0d0d0]"
              />
              <div className="relative z-10 flex size-3.5 items-center justify-center rounded-full bg-[#4EB1CA4D]">
                <div className="bg-tu-mint flex size-2.5 items-center justify-center rounded-full">
                  <div className="size-1 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-start-2 row-start-1 min-w-0">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="노선을 선택하세요" />
              </SelectTrigger>
              <SelectContent position="popper">
                {patterns.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.nameKo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="row-span-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="출발지와 도착지 바꾸기"
            >
              <img src={swapIcon} alt="swap" />
            </Button>
          </div>
          <div className="col-start-2 row-start-2 min-w-0">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="노선을 선택하세요" />
              </SelectTrigger>
              <SelectContent position="popper">
                {patterns.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.nameKo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      <div className="bg-light-gray mt-6 mb-5 h-px" />
      <div className="space-y-4 px-5">
        <div className="content-border bg-white px-5 py-6">
          <div className="flex items-center justify-between">
            <Txt typography="headline">셔틀버스</Txt>
            <div className="flex items-center gap-2">
              <Txt className="text-dark-black" typography="caption">
                18:22
              </Txt>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="border-gray bg-light-gray rounded-full border-[0.5px]"
              >
                <img src={reloadIcon} alt="reload" />
              </Button>
            </div>
          </div>
          <div className="bg-gray my-3 h-px" />
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Txt typography="caption">가장 빠른 셔틀</Txt>
              <div className="flex items-end gap-2">
                <Txt className="text-tu-blue text-[32px] font-semibold">6분 45초</Txt>
                <Txt typography="p" className="text-dark-black">
                  후 출발
                </Txt>
              </div>
            </div>
            <div className="border-light-gray flex items-center justify-between rounded-md bg-[#f8f8f8] px-3.5 py-2.5">
              <div className="flex items-center gap-1">
                <Txt typography="caption">다음 셔틀</Txt>
                <Txt typography="body-bold" className="text-tu-blue">
                  12분 20초
                </Txt>
              </div>
              <button className="border-tu-blue text-tu-blue text-xxs rounded-full border bg-white px-3 py-1.5 font-medium">
                셔틀 시간표
              </button>
            </div>
          </div>
        </div>
        <div className="content-border bg-white px-5 py-6">
          <div className="flex items-center justify-between">
            <Txt typography="headline">전철 시간표</Txt>
            <div className="flex items-center gap-2">
              <Txt className="text-dark-black" typography="caption">
                18:22
              </Txt>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="border-gray bg-light-gray rounded-full border-[0.5px]"
              >
                <img src={reloadIcon} alt="reload" />
              </Button>
            </div>
          </div>
          <div className="bg-gray my-3 h-px" />
          <div className="flex gap-[18px]">
            <div className="flex-1 space-y-1">
              <img src={lineNumber4Icon} alt="line-number4" />
              <div className="bg-background space-y-1 rounded-md px-3 py-2.5">
                <p className="text-xs">신길온천 방면 (불암산행)</p>
                <div className="flex items-end gap-1">
                  <Txt typography="body-bold" className="text-line-number4">
                    6분 45초
                  </Txt>
                  <p className="text-xxs text-dark-black font-light">후 도착</p>
                </div>
              </div>
              <div className="bg-background space-y-1 rounded-md px-3 py-2.5">
                <p className="text-xs">오이도 방면 (오이도행)</p>
                <div className="flex items-end gap-1">
                  <Txt typography="body-bold" className="text-line-number4">
                    6분 45초
                  </Txt>
                  <p className="text-xxs text-dark-black font-light">후 도착</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <img src={lineSuinBundangIcon} alt="line-suin-bundang" />
              <div className="bg-background space-y-1 rounded-md px-3 py-2.5">
                <p className="text-xs">왕십리 방면 (왕십리행)</p>
                <div className="flex items-end gap-1">
                  <Txt typography="body-bold" className="text-line-suin-bundang">
                    6분 45초
                  </Txt>
                  <p className="text-xxs text-dark-black font-light">후 도착</p>
                </div>
              </div>
              <div className="bg-background space-y-1 rounded-md px-3 py-2.5">
                <p className="text-xs">인천 방면 (인천행)</p>
                <div className="flex items-end gap-1">
                  <Txt typography="body-bold" className="text-line-suin-bundang">
                    6분 45초
                  </Txt>
                  <p className="text-xxs text-dark-black font-light">후 도착</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
