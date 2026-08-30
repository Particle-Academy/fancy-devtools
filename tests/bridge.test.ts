import { describe, expect, it } from "vitest";
import { createDevtoolsBridgeAdapter } from "../src/bridge";
import { createDevtoolsStore } from "../src/store";

describe("agent bridge adapter", () => {
  it("exposes the same redacted state a human sees and supports acknowledgement", () => {
    const store = createDevtoolsStore();
    const id = store.report({ severity: "error", source: "runtime", title: "Failure", detail: { authorization: "Bearer secret" } });
    const bridge = createDevtoolsBridgeAdapter(store);

    expect(bridge.getProblems().problems[0]?.detail).toEqual({ authorization: "[REDACTED]" });
    expect(bridge.acknowledgeProblem(id).acknowledged).toBe(true);
    expect(store.getSnapshot().problems[0]?.acknowledged).toBe(true);
  });
});
