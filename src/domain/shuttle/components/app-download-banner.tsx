import { useWebViewStore } from "#/shared/stores/web-view";

const APP_STORE_URL =
  "https://apps.apple.com/kr/app/%ED%8B%B0%EB%85%B8-%EC%85%94%ED%8B%80/id6766172871";

function isAppleUserAgent(userAgent: string) {
  return /iPhone|iPad|iPod|Macintosh/i.test(userAgent);
}

function getAppStoreLabel(userAgent: string) {
  return isAppleUserAgent(userAgent) ? "App Store" : "Play Store";
}

export function AppDownloadBanner() {
  const isInWebView = useWebViewStore((state) => state.isInWebView);
  const userAgent = navigator.userAgent;
  const storeLabel = getAppStoreLabel(userAgent);

  // 안드로이드는 출시 이전이라 렌더링 안시킴
  if (isInWebView || !isAppleUserAgent(userAgent)) {
    return null;
  }

  const onDownloadApp = () => {
    window.open(APP_STORE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="from-tu-blue mx-5 mt-5 flex items-center justify-between rounded-md bg-linear-to-r to-[#082E5E] px-4 py-3.5">
      <p className="text-sm font-medium text-white">티노 셔틀 {storeLabel} 등장!</p>
      <button
        type="button"
        onClick={onDownloadApp}
        className="text-tu-blue border-tu-blue rounded-full border bg-white px-3.5 py-1.5 text-[13px] font-semibold"
        aria-label="앱 다운로드"
      >
        다운로드 하기
      </button>
    </div>
  );
}
