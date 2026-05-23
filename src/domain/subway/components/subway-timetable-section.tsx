import type { GetSubwayTimetableTrainRow } from "#/domain/subway/api/models";
import { Txt } from "#/shared/components/txt";

interface SubwayDirectionCardProps {
  heading: string;
  trains: Array<{ toward: string; time: string }>;
}

function SubwayDirectionCard({ heading, trains }: SubwayDirectionCardProps) {
  return (
    <div className="bg-card rounded-xl border-[1.5px] p-5">
      <h3 className="text-foreground mb-2 text-lg font-medium">{heading}</h3>
      <div className="bg-light-gray mt-3 mb-8 h-px" />
      {trains.length === 0 ? (
        <Txt typography="caption">열차 정보 없음</Txt>
      ) : (
        <div className="flex flex-col gap-4.5">
          {trains.map((train) => (
            <div key={`${train.toward}-${train.time}`} className="flex items-center gap-9">
              <span className="min-w-[52px] text-[15px] font-medium">{train.toward}</span>
              <span className="text-tu-blue text-lg font-bold">{train.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SubwayTimetableSectionProps {
  uphill: GetSubwayTimetableTrainRow[];
  downward: GetSubwayTimetableTrainRow[];
  uphillLabel: string;
  downwardLabel: string;
}

export function SubwayTimetableSection({
  uphill,
  downward,
  uphillLabel,
  downwardLabel,
}: SubwayTimetableSectionProps) {
  return (
    <div className="space-y-3">
      <SubwayDirectionCard heading={uphillLabel} trains={uphill} />
      <SubwayDirectionCard heading={downwardLabel} trains={downward} />
    </div>
  );
}
