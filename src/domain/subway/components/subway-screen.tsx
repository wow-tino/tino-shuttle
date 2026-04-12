import { SubwayArrivalDetailSection } from "#/domain/subway/components/subway-arrival-detail-section";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";

export function SubwayScreen() {
  return (
    <main className="flex flex-col gap-2 p-6">
      <h1 className="text-foreground text-xl font-semibold tracking-tight">전철</h1>
      <p className="text-muted-foreground text-sm">실시간 도착 정보를 방향별로 확인할 수 있어요.</p>
      <ErrorBoundary suspenseFallback={<Loading title="전철 도착 정보를 불러오는 중 이에요..." />}>
        <SubwayArrivalDetailSection />
      </ErrorBoundary>
    </main>
  );
}
