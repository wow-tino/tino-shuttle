import { useEffect } from "react";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";

import { TimetableBoard } from "./timetable-board";

import swapIcon from "/icons/swap.svg";
import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { useSelectedShuttleStopStore } from "#/domain/shuttle/hooks/use-selected-shuttle-stop-store";
import {
  buildSelectionForArrivalChange,
  buildSelectionForDepartureChange,
  buildSelectionForSwap,
  normalizeShuttleStopSelection,
} from "#/domain/shuttle/utils/shuttle-stop-selection";
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

interface ShuttleScreenProps {
  weekday: ShuttleServiceDay;
}

export function ShuttleScreen({ weekday }: ShuttleScreenProps) {
  const { data: shuttleStops } = useSuspenseQuery(SHUTTLE_QUERIES.GetShuttleStops());
  const departure = useSelectedShuttleStopStore((state) => state.departure);
  const arrival = useSelectedShuttleStopStore((state) => state.arrival);
  const setSelectedStopId = useSelectedShuttleStopStore((state) => state.setSelectedStopId);
  const selectedStopId = { departure, arrival };
  const {
    data: shuttleTimes,
    isFetching: isFetchingShuttleTimes,
    isError: isShuttleTimesError,
  } = useQuery(
    SHUTTLE_QUERIES.GetShuttleTimes({
      departure: selectedStopId.departure,
      arrival: selectedStopId.arrival,
      weekday,
    })
  );

  const onSelectDeparture = (id: string) => {
    const nextStopSelection = buildSelectionForDepartureChange(selectedStopId, id, shuttleStops);
    setSelectedStopId(nextStopSelection);
  };
  const onSelectArrival = (id: string) => {
    const nextStopSelection = buildSelectionForArrivalChange(selectedStopId, id, shuttleStops);
    setSelectedStopId(nextStopSelection);
  };

  const onSwapStopSelection = () => {
    const nextStopSelection = buildSelectionForSwap(selectedStopId, shuttleStops);
    setSelectedStopId(nextStopSelection);
  };

  const viaStopNameKo = shuttleTimes?.viaStopNameKo ?? null;
  const hasViaStop = viaStopNameKo !== null;

  useEffect(() => {
    const normalizedSelection = normalizeShuttleStopSelection({ departure, arrival }, shuttleStops);

    if (normalizedSelection.departure !== departure || normalizedSelection.arrival !== arrival) {
      setSelectedStopId(normalizedSelection);
    }
  }, [arrival, departure, setSelectedStopId, shuttleStops]);

  return (
    <main className="flex flex-col py-8">
      <section className="space-y-[25px] px-7">
        <div className="space-y-2">
          <Txt typography="h1-title">셔틀 시간표</Txt>
          <Txt typography="p">노선을 선택하고 전체 셔틀 시간표를 확인하세요.</Txt>
        </div>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5">
          <div className="relative col-start-1 row-start-1 flex items-center justify-center">
            {!hasViaStop ? (
              <div
                aria-hidden
                className="bg-gray absolute top-1/2 -bottom-3.5 left-1/2 w-0.5 -translate-x-1/2"
              />
            ) : null}
            <div className="bg-tu-blue/30 relative z-10 flex size-3.5 items-center justify-center rounded-full">
              <div className="bg-tu-blue flex size-2.5 items-center justify-center rounded-full">
                <div className="size-1 rounded-full bg-white" />
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
                  {shuttleStops.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id.toString()}
                      textValue={p.nameKo}
                      disabled={arrival === p.id.toString()}
                    >
                      {p.nameKo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ClientOnly>
          </div>
          {hasViaStop ? (
            <>
              <div className="relative col-start-1 row-start-2 flex items-center justify-center">
                <div className="bg-tu-sky-blue/30 relative z-10 flex size-3.5 items-center justify-center rounded-full">
                  <div className="bg-tu-sky-blue flex size-2.5 items-center justify-center rounded-full">
                    <div className="size-1 rounded-full bg-white" />
                  </div>
                </div>
              </div>
              <div className="col-start-2 row-start-2 min-w-0">
                <div className="bg-light-gray border-gray flex h-9 items-center rounded-lg border px-4">
                  <Txt as="span" typography="body">
                    {viaStopNameKo}
                  </Txt>
                </div>
              </div>
            </>
          ) : null}
          <div
            className={`relative col-start-1 flex items-center justify-center ${hasViaStop ? "row-start-3" : "row-start-2"}`}
          >
            {!hasViaStop ? (
              <div
                aria-hidden
                className="bg-gray absolute -top-3.5 bottom-1/2 left-1/2 w-0.5 -translate-x-1/2"
              />
            ) : null}
            <div className="bg-tu-mint/30 relative z-10 flex size-3.5 items-center justify-center rounded-full">
              <div className="bg-tu-mint flex size-2.5 items-center justify-center rounded-full">
                <div className="size-1 rounded-full bg-white" />
              </div>
            </div>
          </div>
          <div className={`col-start-2 min-w-0 ${hasViaStop ? "row-start-3" : "row-start-2"}`}>
            <ClientOnly
              fallback={<div className="h-9 w-full animate-pulse rounded-lg bg-gray-200" />}
            >
              <Select value={selectedStopId.arrival} onValueChange={onSelectArrival}>
                <SelectTrigger className="w-full" disabled={weekday === "SUNDAY"}>
                  <SelectValue placeholder="노선을 선택하세요" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {shuttleStops.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id.toString()}
                      textValue={p.nameKo}
                      disabled={departure === p.id.toString()}
                    >
                      {p.nameKo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ClientOnly>
          </div>
          <div
            className="col-start-3 self-center"
            style={{ gridRow: hasViaStop ? "1 / span 3" : "1 / span 2" }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="출발지와 도착지 바꾸기"
              disabled={weekday === "SUNDAY"}
              onClick={onSwapStopSelection}
            >
              <img src={swapIcon} alt="출/도착 교체 아이콘" />
            </Button>
          </div>
        </div>
      </section>
      <div className="bg-light-gray mt-6 mb-5 h-px" />
      <TimetableBoard
        shuttleTimes={shuttleTimes?.times}
        weekday={weekday}
        isLoading={isFetchingShuttleTimes && shuttleTimes === undefined}
        isError={isShuttleTimesError}
      />
    </main>
  );
}
