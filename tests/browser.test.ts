import { describe, expect, it } from "vitest";
import { installBrowserDiagnostics } from "../src/browser";
import { createDevtoolsStore } from "../src/store";

describe("browser diagnostics", () => {
  it("captures window errors and unhandled rejections, then cleanly uninstalls", () => {
    const store = createDevtoolsStore();
    const release = installBrowserDiagnostics(store, window);

    window.dispatchEvent(new ErrorEvent("error", { message: "render exploded", error: new Error("render exploded") }));
    window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise: Promise.resolve(), reason: new Error("async exploded") }));
    expect(store.getSnapshot().problems.map((problem) => problem.title)).toEqual(["render exploded", "async exploded"]);

    release();
    window.dispatchEvent(new ErrorEvent("error", { message: "ignored" }));
    expect(store.getSnapshot().problems).toHaveLength(2);
  });
});
