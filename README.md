# CommsPliant Node SDK

Official Node.js / TypeScript client for the [CommsPliant Customer Integration API](https://developer.commspliant.com/).

Requires Node.js 18 or later.

## Installation

```bash
npm install @commspliant/node-sdk
```

Or clone this repository and install from the local path.

## Quickstart

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

## Authentication

By default the SDK sends `X-Api-Key: ck_...`.

```typescript
const client = new CommsPliantClient("ck_YOUR_API_KEY", {
  useBearerAuth: true,
});
```

## Configuration

```typescript
const client = new CommsPliantClient("ck_YOUR_API_KEY", {
  baseUrl: "http://localhost:8085",
});
```

## Errors

Non-success API responses throw `APIError` with `statusCode`, `message`, and `requestId`.

## Documentation

Endpoint guides and SDK usage examples: [doc/README.md](doc/README.md)

## Links

- [npm package](https://www.npmjs.com/package/@commspliant/node-sdk)
- [Developer Portal](https://developer.commspliant.com/)
- [About CommsPliant](https://commspliant.com/)
