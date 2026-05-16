import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";

import { ShuttleInfo } from "./shuttle-info";

import swapIcon from "/icons/swap.svg";
import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { DEFAULT_SHUTTLE_STOP_SELECTION } from "#/domain/shuttle/constants/default-stop-selection";
import { SubwayArrival } from "#/domain/subway/components/subway-arrival-info";
import { Button } from "#/shared/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/select";
import { Txt } from "#/shared/components/txt";
import type { ShuttleServiceDay } from "#/shared/types/shuttle";

interface ShuttleHomeScreenProps {
  weekday: ShuttleServiceDay;
}

export function ShuttleHomeScreen({ weekday }: ShuttleHomeScreenProps) {
  const [selectedStopId, setSelectedStopId] = useState(DEFAULT_SHUTTLE_STOP_SELECTION);

  const { data } = useSuspenseQuery(SHUTTLE_QUERIES.GetShuttleStops());

  const onSelectDeparture = (id: string) => {
    const nextStopSelection = {
      departure: id,
      arrival: selectedStopId.arrival,
    };
    setSelectedStopId(nextStopSelection);
  };
  const onSelectArrival = (id: string) => {
    const nextStopSelection = {
      departure: selectedStopId.departure,
      arrival: id,
    };
    setSelectedStopId(nextStopSelection);
  };

  const onSwapStopSelection = () => {
    const nextStopSelection = {
      departure: selectedStopId.arrival,
      arrival: selectedStopId.departure,
    };
    setSelectedStopId(nextStopSelection);
  };

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
            <ClientOnly
              fallback={<div className="h-9 w-full animate-pulse rounded-lg bg-gray-200" />}
            >
              <Select value={selectedStopId.departure} onValueChange={onSelectDeparture}>
                <SelectTrigger className="w-full" disabled={weekday === "SUNDAY"}>
                  <SelectValue placeholder="노선을 선택하세요" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {data.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()} textValue={p.nameKo}>
                      {p.nameKo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ClientOnly>
          </div>
          <div className="row-span-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="출발지와 도착지 바꾸기"
              onClick={onSwapStopSelection}
            >
              <img src={swapIcon} alt="swap" />
            </Button>
          </div>
          <div className="col-start-2 row-start-2 min-w-0">
            <ClientOnly
              fallback={<div className="h-9 w-full animate-pulse rounded-lg bg-gray-200" />}
            >
              <Select value={selectedStopId.arrival} onValueChange={onSelectArrival}>
                <SelectTrigger className="w-full" disabled={weekday === "SUNDAY"}>
                  <SelectValue placeholder="노선을 선택하세요" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {data.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()} textValue={p.nameKo}>
                      {p.nameKo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ClientOnly>
          </div>
        </div>
      </section>
      <div className="bg-light-gray mt-6 mb-5 h-px" />
      <div className="space-y-4 px-5">
        <ShuttleInfo
          departure={selectedStopId.departure}
          arrival={selectedStopId.arrival}
          weekday={weekday}
        />
        <SubwayArrival />
      </div>
    </main>
  );
}
