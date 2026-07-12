import { describe, expect, it } from "vitest";
import { cn } from "../lib/cn";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    const disabled = false;
    expect(cn("a", "b", disabled && "c", undefined, null, "d")).toBe("a b d");
  });

  it("lets a later conflicting Tailwind utility win", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("merges conditional class objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
