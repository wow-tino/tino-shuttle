import ky from "ky";

const baseUrl = import.meta.env.VITE_BASE_URL ?? "http://localhost:3000";

export const apiV2 = ky.create({
  prefixUrl: `${baseUrl}/api`,
});
