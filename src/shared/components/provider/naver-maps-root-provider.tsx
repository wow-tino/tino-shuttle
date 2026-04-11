const naverNcpKeyId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

export function NaverMapsRootProvider() {
  return (
    <script
      type="text/javascript"
      defer
      src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverNcpKeyId}`}
    />
  );
}
