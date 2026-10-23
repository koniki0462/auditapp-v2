import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { audits } from "@/lib/data";
import { AuditList, filterAudits } from "./AuditList";

describe("filterAudits", () => {
  it("returns everything with no filters", () => {
    expect(filterAudits(audits, "", "All")).toHaveLength(audits.length);
  });

  it("filters by status", () => {
    const result = filterAudits(audits, "", "Completed");
    expect(result.every((a) => a.status === "Completed")).toBe(true);
  });

  it("searches across id, title, department and auditor", () => {
    expect(filterAudits(audits, "payroll", "All").map((a) => a.id)).toEqual(["AUD-1004"]);
    expect(filterAudits(audits, "arjun", "All")).toHaveLength(2);
  });
});

describe("AuditList", () => {
  it("shows an empty state when nothing matches", () => {
    render(<AuditList audits={audits} />);
    fireEvent.change(screen.getByLabelText("Search audits"), { target: { value: "zzz" } });
    expect(screen.getByText("No audits match your filters.")).toBeInTheDocument();
  });
});
