import { describe, expect, it } from "vitest";
import { entityTypes, monthNames, organizationName } from "./utils";

describe("organizationName", () => {
  it("prefers the trade name", () => {
    expect(organizationName({ legalName: "Acme Corp Pvt Ltd", tradeName: "Acme" })).toBe("Acme");
  });

  it("falls back to the legal name when there is no trade name", () => {
    expect(organizationName({ legalName: "Acme Corp Pvt Ltd", tradeName: null })).toBe("Acme Corp Pvt Ltd");
    expect(organizationName({ legalName: "Acme Corp Pvt Ltd", tradeName: "  " })).toBe("Acme Corp Pvt Ltd");
  });
});

describe("organization options", () => {
  it("lists the API's entity types and twelve months", () => {
    expect(entityTypes).toContain("Non-Profit");
    expect(monthNames).toHaveLength(12);
    expect(monthNames[2]).toBe("March");
  });
});
