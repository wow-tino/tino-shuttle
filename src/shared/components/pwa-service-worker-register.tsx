import { useEffect } from "react";

export function PwaServiceWorkerRegister() {
  useEffect(() => {
    async function registerPWA() {
      if (!import.meta.env.PROD) {
        return;
      }
      const { registerSW } = await import("virtual:pwa-register");
      registerSW({ immediate: true });
    }

    registerPWA();
  }, []);

  return null;
}
