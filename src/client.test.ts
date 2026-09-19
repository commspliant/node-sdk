import assert from "node:assert/strict";
import test from "node:test";
import { CommsPliantClient } from "./client.js";
import { APIError } from "./errors.js";

test("renderHtml returns body and request id", async () => {
  const client = new CommsPliantClient("ck_test", {
    baseUrl: "http://example.test",
    fetch: async (url, init) => {
      assert.equal(url, "http://example.test/api/v1/render/html");
      assert.equal(init?.method, "POST");
      assert.equal((init?.headers as Record<string, string>)["X-Api-Key"], "ck_test");

      const body = JSON.parse(String(init?.body));
      assert.equal(body.templateId, "550e8400-e29b-41d4-a716-446655440000");

      return new Response("<html>ok</html>", {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "X-Request-ID": "req-123",
        },
      });
    },
  });

  const result = await client.renderHtml({
    templateId: "550e8400-e29b-41d4-a716-446655440000",
    variables: { title: "Monthly Report" },
  });

  assert.equal(result.body.toString(), "<html>ok</html>");
  assert.equal(result.requestId, "req-123");
});

test("renderPdf uses pdf path", async () => {
  const client = new CommsPliantClient("ck_test", {
    baseUrl: "http://example.test",
    fetch: async (url) => {
      assert.equal(url, "http://example.test/api/v1/render/pdf");
      return new Response("%PDF-1.4", {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      });
    },
  });

  const result = await client.renderPdf({
    templateId: "550e8400-e29b-41d4-a716-446655440000",
    variables: {},
  });

  assert.equal(result.body.toString(), "%PDF-1.4");
});

test("missing templateId fails validation", async () => {
  const client = new CommsPliantClient("ck_test");
  await assert.rejects(
    () => client.renderHtml({ templateId: "", variables: {} }),
    /templateId is required/,
  );
});

test("api errors are parsed", async () => {
  const client = new CommsPliantClient("ck_test", {
    baseUrl: "http://example.test",
    fetch: async () =>
      new Response(JSON.stringify({ error: "template not found" }), {
        status: 404,
        headers: { "X-Request-ID": "req-404" },
      }),
  });

  await assert.rejects(
    () =>
      client.renderHtml({
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        variables: {},
      }),
    (error: unknown) => {
      assert.ok(error instanceof APIError);
      const apiError = error as APIError;
      assert.equal(apiError.statusCode, 404);
      assert.equal(apiError.message, "template not found");
      assert.equal(apiError.requestId, "req-404");
      return true;
    },
  );
});
