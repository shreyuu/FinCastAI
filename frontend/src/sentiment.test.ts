import { describe, it, expect } from "vitest";
import { sentimentOf } from "./sentiment";

describe("sentimentOf", () => {
  it.each([
    ["[Positive] Profits up 20 percent...", "Positive"],
    ["[Negative] Fraud probe opened...", "Negative"],
    ["[Neutral] Board meets Tuesday...", "Neutral"],
  ])("reads the label the backend prefixed: %s", (reason, expected) => {
    expect(sentimentOf(reason)).toBe(expected);
  });

  it("ignores the label's word appearing in the headline (BUG-04)", () => {
    expect(sentimentOf("[Negative] Positive Electrodes Ltd faces fraud probe...")).toBe("Negative");
    expect(sentimentOf("[Neutral] Analysts see Negative carry on bonds...")).toBe("Neutral");
  });

  it("treats an error message with no label as neutral", () => {
    expect(sentimentOf("Request failed (502).")).toBe("Neutral");
  });
});
