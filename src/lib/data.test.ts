import { afterEach, describe, expect, it, vi } from "vitest";
import { audits, findings } from "@/test/fixtures";
import { ApiError, getAudit, getAudits, getFindingsForAudit, send } from "./data";
import { getToken } from "./session";

vi.mock("./env", () => ({ env: { apiBaseUrl: "http://api.test/api/" } }));
vi.mock("./session", () => ({ getToken: vi.fn(async () => "token-123") }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
}));

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

  it("sends the session token as a bearer token", async () => {
    const fetchMock = mockFetch(200, audits);
    await getAudits();
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ Authorization: "Bearer token-123" });
  });

  it("sends no Authorization header without a session", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(undefined);
    const fetchMock = mockFetch(200, audits);
    await getAudits();
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("redirects to /login when the API rejects the session", async () => {
    mockFetch(401, { status: 401 });
    await expect(getAudits()).rejects.toThrow("NEXT_REDIRECT /login");
  });

  it("does not send the token for login, and surfaces the API's message", async () => {
    vi.mocked(getToken).mockClear();
    const fetchMock = mockFetch(401, { status: 401, detail: "Invalid email or password." });
    await expect(send("POST", "/auth/login", { email: "a@b.c", password: "x" }, false)).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password.",
    });
    expect(getToken).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST", body: '{"email":"a@b.c","password":"x"}' });
  });

  it("returns field errors from a validation failure", async () => {
    mockFetch(400, { status: 400, detail: "Validation failed", errors: { email: "must be a well-formed email address" } });
    await expect(send("POST", "/organization/members", { email: "x" })).rejects.toMatchObject({
      status: 400,
      errors: { email: "must be a well-formed email address" },
    });
  });

  it("returns nothing for 204 No Content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(send("DELETE", "/organization/members/u1")).resolves.toBeUndefined();
  });

  it("throws ApiError when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(getAudits()).rejects.toBeInstanceOf(ApiError);
  });
});
