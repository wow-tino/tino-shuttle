import type { ShuttlePatternDto } from "#/domain/shuttle/api/models";
import { DEFAULT_PATTERN_CODE } from "#/domain/shuttle/hooks/use-selected-shuttle-pattern-store";

export function resolveSelectedPattern(
  patterns: ShuttlePatternDto[],
  selectedCode: string | null
): ShuttlePatternDto {
  if (selectedCode) {
    const hit = patterns.find((p) => p.code === selectedCode);
    if (hit) {
      return hit;
    }
  }
  const preferred = patterns.find((p) => p.code === DEFAULT_PATTERN_CODE);
  return preferred ?? patterns[0];
}
