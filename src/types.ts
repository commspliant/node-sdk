export const DEFAULT_BASE_URL = "https://api.commspliant.com";

export interface ClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
  useBearerAuth?: boolean;
}

export interface RenderRequest {
  templateId: string;
  templateVersionId?: string;
  variables: Record<string, unknown>;
}

export interface RenderResult {
  body: Buffer;
  contentType: string;
  requestId: string;
  contentDisposition?: string;
}
