import { describe, expect, it, vi } from "vitest";
import { createQPostClient } from "./client.js";
import { QPostApiError } from "./errors.js";

function fakeFetch(status: number, body: unknown) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  });
}

describe("createQPostClient", () => {
  it("sends the tenant API key as a Bearer token", async () => {
    const fetchMock = fakeFetch(200, { id: "abc", name: "Acme" });
    const client = createQPostClient({ apiKey: "sk_test_123", fetch: fetchMock as unknown as typeof fetch });

    await client.tenant.get();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // openapi-fetch may call fetch(Request) or fetch(url, init); normalize via Request either way.
    const request = new Request(...(fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]));
    expect(request.headers.get("authorization")).toBe("Bearer sk_test_123");
  });

  it("resolves with the parsed data on success", async () => {
    const fetchMock = fakeFetch(200, { id: "t1", name: "Acme", rateLimitRps: 10, rateLimitBurst: 100 });
    const client = createQPostClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });

    const tenant = await client.tenant.get();
    expect(tenant.name).toBe("Acme");
  });

  it("throws QPostApiError with status/code/message on error responses", async () => {
    const fetchMock = fakeFetch(404, { error: "not_found", message: "Domain not found: x.com" });
    const client = createQPostClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });

    await expect(client.domains.get("x.com")).rejects.toMatchObject({
      name: "QPostApiError",
      status: 404,
      code: "not_found",
      message: "Domain not found: x.com",
    });
    await expect(client.domains.get("x.com")).rejects.toBeInstanceOf(QPostApiError);
  });

  it("targets the default production baseUrl unless overridden", async () => {
    const fetchMock = fakeFetch(200, { sendingEnabled: true });
    const client = createQPostClient({ apiKey: "k", fetch: fetchMock as unknown as typeof fetch });

    await client.account.get();

    const request = new Request(...(fetchMock.mock.calls[0] as [RequestInfo, RequestInit?]));
    expect(request.url).toBe("https://qpost.qern.net/qp/v3/account");
  });
});
