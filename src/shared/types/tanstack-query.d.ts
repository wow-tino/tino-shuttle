import type { AppHttpError } from "../utils";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AppHttpError;
  }
}
