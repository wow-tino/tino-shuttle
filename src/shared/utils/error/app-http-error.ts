import type { KyRequest, KyResponse, NormalizedOptions } from "ky";
import { HTTPError } from "ky";

export class AppHttpError extends HTTPError {
  readonly status: number;
  readonly serverMessage: string;

  constructor(
    response: KyResponse,
    request: KyRequest,
    options: NormalizedOptions,
    serverMessage: string
  ) {
    super(response, request, options);
    this.name = "AppHttpError";
    this.status = response.status;
    this.serverMessage = serverMessage;
  }
}
