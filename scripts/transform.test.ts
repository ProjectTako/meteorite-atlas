import { describe, it, expect } from "vitest";
import { classifyGroup, deriveRegion, cleanYear, cleanCoords } from "../src/lib/transform";

describe("classifyGroup", () => {
  it("maps ordinary chondrites", () => {
    expect(classifyGroup("L6")).toBe("Ordinary chondrite");
    expect(classifyGroup("LL3.2")).toBe("Ordinary chondrite");
  });
  it("maps irons", () => {
    expect(classifyGroup("Iron, IAB-MG")).toBe("Iron");
    expect(classifyGroup("Octahedrite")).toBe("Iron");
  });
  it("maps achondrites including planetary", () => {
    expect(classifyGroup("Martian (shergottite)")).toBe("Achondrite");
  });
  it("maps stony-irons", () => {
    expect(classifyGroup("Pallasite")).toBe("Stony-iron");
  });
  it("falls through to Unknown rather than guessing", () => {
    expect(classifyGroup("Stone-uncl")).toBe("Unknown");
  });
});
describe("cleanYear", () => {
  it("rejects future years", () => expect(cleanYear("2101")).toBeNull());
  it("accepts historical years", () => expect(cleanYear("1880")).toBe(1880));
  it("handles junk", () => expect(cleanYear("abc")).toBeNull());
});
describe("cleanCoords", () => {
  it("flags null island", () => expect(cleanCoords("0.0", "0.0").mappable).toBe(false));
  it("keeps real coords", () => expect(cleanCoords("50.775", "6.08333").mappable).toBe(true));
  it("rejects out-of-range", () => expect(cleanCoords("200", "10").mappable).toBe(false));
});
describe("deriveRegion", () => {
  it("identifies Antarctica", () => expect(deriveRegion(-79, 0)).toBe("Antarctica"));
  it("null for unmappable", () => expect(deriveRegion(null, null)).toBeNull());
});
