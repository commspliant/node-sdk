import { APIError } from "./errors.js";
import {
  ClientOptions,
  DEFAULT_BASE_URL,
  RenderRequest,
  RenderResult,
} from "./types.js";

export class CommsPliantClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly useBearerAuth: boolean;

  constructor(apiKey: string, options: ClientOptions = {}) {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      throw new Error("api key is required");
    }

    this.apiKey = trimmedKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.fetchImpl = options.fetch ?? fetch;
    this.useBearerAuth = options.useBearerAuth ?? false;
  }

  async renderHtml(request: RenderRequest): Promise<RenderResult> {
    return this.postRender("/api/v1/render/html", request);
  }

  async renderPdf(request: RenderRequest): Promise<RenderResult> {
    return this.postRender("/api/v1/render/pdf", request);
  }

  async submitRenderBatch(request: {
    templateId: string;
    purpose: "email" | "pdf" | "render_only";
    items: { variables: Record<string, unknown> }[];
    processBatchId?: string;
    callbackUrl?: string;
  }): Promise<{ processBatchId: string; batchId: string }> {
    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/render/batches`, {
      method: "POST",
      headers: this.jsonHeaders(),
      body: JSON.stringify(request),
    });
    if (response.status !== 202) {
      throw await parseAPIError(response);
    }
    return (await response.json()) as { processBatchId: string; batchId: string };
  }

  private jsonHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.useBearerAuth) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    } else {
      headers["X-Api-Key"] = this.apiKey;
    }
    return headers;
  }

  private async postRender(path: string, request: RenderRequest): Promise<RenderResult> {
    validateRenderRequest(request);

    const payload: Record<string, unknown> = {
      templateId: request.templateId,
      variables: request.variables,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.useBearerAuth) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    } else {
      headers["X-Api-Key"] = this.apiKey;
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const requestId = response.headers.get("X-Request-ID") ?? "";

    if (!response.ok) {
      throw await parseAPIError(response, requestId);
    }

    const body = Buffer.from(await response.arrayBuffer());
    return {
      body,
      contentType: response.headers.get("Content-Type") ?? "",
      requestId,
      contentDisposition: response.headers.get("Content-Disposition") ?? undefined,
    };
  }
}

function validateRenderRequest(request: RenderRequest): void {
  if (!request.templateId?.trim()) {
    throw new Error("templateId is required");
  }
  if (request.variables == null) {
    throw new Error("variables is required");
  }
}

async function parseAPIError(response: Response, requestId: string): Promise<APIError> {
  const text = await response.text();
  if (!text) {
    return new APIError(response.status, response.statusText, { requestId });
  }

  try {
    const parsed = JSON.parse(text) as {
      error?: string;
      code?: string;
      details?: Record<string, unknown>;
    };
    return new APIError(response.status, parsed.error ?? response.statusText, {
      code: parsed.code,
      details: parsed.details,
      requestId,
    });
  } catch {
    return new APIError(response.status, text, { requestId });
  }
}
