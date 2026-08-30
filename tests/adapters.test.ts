import { describe, expect, it } from "vitest";
import { createQueryAdapter, createTimelineAdapter } from "../src/adapters";

describe("suite adapters", () => {
  it("normalizes a TanStack-compatible query cache without importing it", () => {
    const adapter = createQueryAdapter({
      getQueryCache: () => ({
        getAll: () => [{
          queryHash: "todos",
          queryKey: ["todos", { page: 1 }],
          state: { status: "success", fetchStatus: "idle", dataUpdatedAt: 42, error: null },
          getObserversCount: () => 2,
          isStale: () => false,
        }],
      }),
    });

    expect(adapter.snapshot()).toEqual({
      summary: { queries: 1, fetching: 0, stale: 0, errors: 0 },
      records: [{ id: "todos", key: ["todos", { page: 1 }], status: "success", fetchStatus: "idle", observers: 2, stale: false, dataUpdatedAt: 42 }],
    });
  });

  it("provides a bounded timeline adapter for Inertia and Human+ events", () => {
    const timeline = createTimelineAdapter({ id: "human-plus", label: "Human+", maxEvents: 2, now: () => 7 });
    timeline.record("tool.started", { tool: "flow_run" });
    timeline.record("tool.completed", { tool: "flow_run", token: "secret" });
    timeline.record("surface.changed", { surface: "flow" });

    expect(timeline.adapter.snapshot()).toEqual({
      summary: { events: 2 },
      records: [
        { id: "human-plus-2", timestamp: 7, event: "tool.completed", detail: { tool: "flow_run", token: "secret" } },
        { id: "human-plus-3", timestamp: 7, event: "surface.changed", detail: { surface: "flow" } },
      ],
    });
  });
});
