import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { FancyDevtools, FancyDevtoolsBoundary, FancyDevtoolsPanel } from "../src/react";
import { createDevtoolsStore } from "../src/store";

const nodes: HTMLDivElement[] = [];
afterEach(() => nodes.splice(0).forEach((node) => node.remove()));

async function render(element: React.ReactNode) {
  const node = document.createElement("div");
  document.body.append(node);
  nodes.push(node);
  const root = createRoot(node);
  await act(async () => root.render(element));
  return node;
}

describe("React devtools", () => {
  it("offers both floating and embedded modes with stable handles", async () => {
    const store = createDevtoolsStore();
    store.report({ severity: "error", source: "runtime", title: "Boom" });
    const floating = await render(<FancyDevtools store={store} defaultOpen />);
    expect(floating.querySelector('[data-fancy-devtools="launcher"]')?.textContent).toContain("1");
    expect(floating.querySelector('[data-fancy-devtools="panel"]')?.textContent).toContain("Boom");

    const embedded = await render(<FancyDevtoolsPanel store={store} />);
    expect(embedded.querySelector('[data-fancy-devtools="panel"]')).not.toBeNull();
  });

  it("turns render failures into structured diagnostics", async () => {
    const store = createDevtoolsStore();
    const Bad = () => { throw new Error("component failed"); };
    const node = await render(<FancyDevtoolsBoundary store={store} fallback={<span>Fallback</span>}><Bad /></FancyDevtoolsBoundary>);
    expect(node.textContent).toContain("Fallback");
    expect(store.getSnapshot().problems[0]).toMatchObject({ title: "component failed", source: "react" });
  });
});
