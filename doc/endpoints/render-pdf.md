# Render PDF

## HTTP

- **Method:** `POST`
- **Path:** `/api/v1/render/pdf`
- **Permission:** `render.execute`

## Description

Resolves an **approved** template version, renders HTML with `variables`, converts to PDF, and returns the PDF as a streamed response.

Same auth rules as `POST /api/v1/render/html`.

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateId` | UUID string | Yes | Template to render |
| `templateVersionId` | UUID string | No | Explicit approved version override |
| `variables` | object | Yes | Values for template placeholders |

## Response

- **Status:** `200 OK`
- **Content-Type:** `application/pdf`
- **Body:** Rendered PDF stream
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
import { CommsPliantClient } from "@commspliant/node-sdk"; // TODO: replace with real SDK import once published

// TODO: replace with real SDK call once published
const client = new CommsPliantClient("ck_YOUR_API_KEY");

const result = await client.renderPdf({
  templateId: "550e8400-e29b-41d4-a716-446655440000",
  variables: {
    title: "Invoice",
    amount: "99.00",
  },
});

await writeFile("document.pdf", Buffer.from(await result.body.arrayBuffer()));
```
