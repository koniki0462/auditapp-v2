import { afterEach, describe, expect, it, vi } from "vitest";
import { audits, findings } from "@/test/fixtures";
import { ApiError, getAudit, getAudits, getFindingsForAudit } from "./data";

vi.mock("./env", () => ({ env: { apiBaseUrl: "http://api.test/api/" } }));

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("data API client", () => {
  it("fetches audits fresh from the configured base URL", async () => {
    const fetchMock = mockFetch(200, audits);
    await expect(getAudits()).resolves.toEqual(audits);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/audits",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("encodes ids in the path", async () => {
    const fetchMock = mockFetch(200, findings.slice(0, 2));
    await getFindingsForAudit("AUD 1/2");
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/api/audits/AUD%201%2F2/findings");
  });

  it("returns null for a missing audit", async () => {
    mockFetch(404, { status: 404, detail: "Audit AUD-9 not found" });
    await expect(getAudit("AUD-9")).resolves.toBeNull();
  });

  it("throws ApiError on server errors", async () => {
    mockFetch(500, { status: 500 });
    await expect(getAudits()).rejects.toMatchObject({ name: "ApiError", status: 500 });
  });

  it("throws ApiError when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(getAudits()).rejects.toBeInstanceOf(ApiError);
  });
});
