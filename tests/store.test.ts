import { describe, expect, it } from "vitest";
import { createDevtoolsStore } from "../src/store";

describe("diagnostics store", () => {
  it("collects typed problems and caps retained history", () => {
    const store = createDevtoolsStore({ maxEvents: 2, now: () => 42 });
    store.report({ severity: "warning", source: "query", title: "one" });
    store.report({ severity: "error", source: "inertia", title: "two" });
    store.report({ severity: "info", source: "human-plus", title: "three" });

    expect(store.getSnapshot().problems.map((problem) => problem.title)).toEqual(["two", "three"]);
    expect(store.getSnapshot().problems[0]).toMatchObject({ timestamp: 42, acknowledged: false });
  });

  it("merges adapter snapshots without exposing adapter internals", async () => {
    const store = createDevtoolsStore();
    const release = store.registerAdapter({
      id: "fancy-query",
      label: "Fancy Query",
      snapshot: () => ({ summary: { queries: 3 }, records: [{ id: "todos", status: "stale" }] }),
    });

    await store.refreshAdapters();
    expect(store.getSnapshot().adapters[0]).toEqual({
      id: "fancy-query",
      label: "Fancy Query",
      summary: { queries: 3 },
      records: [{ id: "todos", status: "stale" }],
    });
    release();
    expect(store.getSnapshot().adapters).toEqual([]);
  });

  it("redacts secrets recursively in machine-readable exports", () => {
    const store = createDevtoolsStore();
    store.activity({ source: "bridge", action: "tool_call", detail: { token: "secret", nested: { password: "oops", safe: "yes" } } });
    store.setEnvironment({ kitVersion: "0.5", apiKey: "must disappear" });

    const exported = store.exportSnapshot();
    expect(exported.environment).toEqual({ kitVersion: "0.5", apiKey: "[REDACTED]" });
    expect(exported.activity[0]?.detail).toEqual({ token: "[REDACTED]", nested: { password: "[REDACTED]", safe: "yes" } });
  });
});
