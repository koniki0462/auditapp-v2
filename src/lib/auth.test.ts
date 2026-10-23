import { describe, expect, it } from "vitest";
import { isTokenUsable, safeNextPath, tokenExpiry } from "./auth";

function jwt(payload: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${b64({ alg: "HS256" })}.${b64(payload)}.signature`;
}

describe("tokenExpiry", () => {
  it("reads exp from the payload", () => {
    expect(tokenExpiry(jwt({ sub: "u1", exp: 1_900_000_000 }))).toBe(1_900_000_000);
  });

  it("returns null for malformed tokens", () => {
    expect(tokenExpiry("not-a-jwt")).toBeNull();
    expect(tokenExpiry("a.!!!.c")).toBeNull();
    expect(tokenExpiry(jwt({ sub: "u1" }))).toBeNull();
  });
});

describe("isTokenUsable", () => {
  const now = 1_800_000_000_000;

  it("accepts unexpired tokens", () => {
    expect(isTokenUsable(jwt({ exp: now / 1000 + 60 }), now)).toBe(true);
  });

  it("rejects missing, expired and unparseable tokens", () => {
    expect(isTokenUsable(undefined, now)).toBe(false);
    expect(isTokenUsable(jwt({ exp: now / 1000 - 1 }), now)).toBe(false);
    expect(isTokenUsable("garbage", now)).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/audits/AUD-1001?tab=findings")).toBe("/audits/AUD-1001?tab=findings");
  });

  it("falls back to / for anything that could leave the site", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/\\evil.example")).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
  });
});
