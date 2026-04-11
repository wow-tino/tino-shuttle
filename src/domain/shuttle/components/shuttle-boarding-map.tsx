import { useEffect } from "react";

import type { ShuttlePatternDto } from "#/domain/shuttle/api/models";
import {
  SHUTTLE_BOARDING_MAP_DEFAULT_ZOOM,
  SHUTTLE_BOARDING_MAP_MIN_HEIGHT_PX,
  SHUTTLE_EVENING_BOARDING_START_HOUR_LOCAL,
} from "#/domain/shuttle/constants/boarding-map";
import { resolveBoardingCoordinates } from "#/domain/shuttle/utils/boarding-coordinates";

interface ShuttleBoardingMapProps {
  readonly pattern: ShuttlePatternDto;
  readonly referenceInstant: Date;
}

export function ShuttleBoardingMap({ pattern, referenceInstant }: ShuttleBoardingMapProps) {
  const { latitude, longitude } = resolveBoardingCoordinates(
    pattern,
    referenceInstant,
    SHUTTLE_EVENING_BOARDING_START_HOUR_LOCAL
  );

  useEffect(() => {
    const naverMap = new window.naver.maps.Map("map", {
      center: new naver.maps.LatLng(latitude, longitude),
      zoom: SHUTTLE_BOARDING_MAP_DEFAULT_ZOOM,
    });

    new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(latitude, longitude),
      map: naverMap,
    });
  }, [latitude, longitude]);

  return <div key={pattern.id} id="map" style={{ height: SHUTTLE_BOARDING_MAP_MIN_HEIGHT_PX }} />;
}
