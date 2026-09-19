# Render HTML

## HTTP

- **Method:** `POST`
- **Path:** `/api/v1/render/html`
- **Permission:** `render.execute`

## Description

Resolves an **approved** template version and returns rendered HTML as a streamed response.

- `templateId` is required.
- The latest approved version is always used.
- `variables` supplies values for `{{placeholder}}` syntax in the template.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateId` | UUID string | Yes | Template to render (latest approved version is used) |
| `variables` | object | Yes | Values for template placeholders |

## Response

- **Status:** `200 OK`
- **Content-Type:** `text/html`
- **Body:** Rendered HTML stream
- **Headers:** `X-Request-ID` (request correlation ID), `Content-Disposition`

## Errors

| Status | Meaning |
|--------|---------|
| 400 | Invalid request body or parameters |
| 401 | Missing or invalid API key |
| 403 | Valid API key but missing `render.execute` permission |
| 404 | Template not found or not visible in the key's organization |
| 422 | Template version not approved for rendering |
| 429 | Render quota exceeded |
| 500 | Unexpected server error |

## SDK example

```typescript
import { writeFile } from "node:fs/promises";
import { CommsPliantClient } from "@commspliant/node-sdk";

const client = new CommsPliantClient("ck_YOUR_API_KEY");

const result = await client.renderHtml({
  templateId: "550e8400-e29b-41d4-a716-446655440000",
  variables: {
    title: "Monthly Report",
    user: { name: "Jane Doe" },
  },
});

await writeFile("document.html", result.body);
```
