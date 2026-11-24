import { describe, expect, it } from "vitest";
import { buildSuppressionKeyHealthRows } from "./suppression-key-health.js";

describe("suppression key health display rows", () => {
  it("aggregates active/released aliases and outbox references by version", () => {
    const rows = buildSuppressionKeyHealthRows({
      currentVersion: "v3", previousVersion: "v2",
      aliases: [{ version: "v2", status: "ACTIVE", count: 2 }, { version: "v2", status: "RELEASED", count: 5 }, { version: "v3", status: "ACTIVE", count: 4 }],
      outboxReferences: [{ version: "v2", status: "DELIVERED", count: 3 }, { version: "v3", status: "PENDING", count: 1 }],
    });
    expect(rows).toEqual([
      { version: "v3", isCurrent: true, isPrevious: false, activeAliases: 4, releasedAliases: 0, outboxReferences: 1 },
      { version: "v2", isCurrent: false, isPrevious: true, activeAliases: 2, releasedAliases: 5, outboxReferences: 3 },
    ]);
  });
  it("includes versions with outbox references even if no alias exists", () => {
    expect(buildSuppressionKeyHealthRows({ currentVersion: "v2", previousVersion: null, aliases: [], outboxReferences: [{ version: "v1", status: "DELIVERED", count: 2 }] }).map(row => row.version)).toEqual(["v2", "v1"]);
  });
});
