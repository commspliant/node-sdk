export class APIError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      code?: string;
      details?: Record<string, unknown>;
      requestId?: string;
    },
  ) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.code = options?.code;
    this.details = options?.details;
    this.requestId = options?.requestId;
  }
}
