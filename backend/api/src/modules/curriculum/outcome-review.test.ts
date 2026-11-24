import { describe, expect, it } from "vitest";
import { outcomeReviewTransitionAllowed } from "./outcome-review.js";

describe("P412 curriculum outcome review transitions", () => {
  it("allows draft to review and archive", () => {
    expect(outcomeReviewTransitionAllowed("DRAFT", "IN_REVIEW")).toBe(true);
    expect(outcomeReviewTransitionAllowed("DRAFT", "ARCHIVED")).toBe(true);
  });
  it("allows review to draft, approved, or archived", () => {
    expect(outcomeReviewTransitionAllowed("IN_REVIEW", "DRAFT")).toBe(true);
    expect(outcomeReviewTransitionAllowed("IN_REVIEW", "APPROVED")).toBe(true);
    expect(outcomeReviewTransitionAllowed("IN_REVIEW", "ARCHIVED")).toBe(true);
  });
  it("prevents direct draft approval and reopening archived outcomes except draft", () => {
    expect(outcomeReviewTransitionAllowed("DRAFT", "APPROVED")).toBe(false);
    expect(outcomeReviewTransitionAllowed("ARCHIVED", "APPROVED")).toBe(false);
    expect(outcomeReviewTransitionAllowed("ARCHIVED", "IN_REVIEW")).toBe(false);
    expect(outcomeReviewTransitionAllowed("ARCHIVED", "DRAFT")).toBe(true);
  });
  it("allows approved outcomes to return to review or archive", () => {
    expect(outcomeReviewTransitionAllowed("APPROVED", "IN_REVIEW")).toBe(true);
    expect(outcomeReviewTransitionAllowed("APPROVED", "ARCHIVED")).toBe(true);
  });
  it("rejects unknown statuses", () => {
    expect(outcomeReviewTransitionAllowed("BAD", "APPROVED")).toBe(false);
  });
});
