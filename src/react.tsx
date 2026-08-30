import { Component, useEffect, useMemo, useState, useSyncExternalStore, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@particle-academy/react-fancy";
import { createDevtoolsStore } from "./store";
import type { DevtoolsSnapshot, DevtoolsStore } from "./types";

const fallbackStore = createDevtoolsStore();

export function useFancyDevtools(store: DevtoolsStore = fallbackStore): DevtoolsSnapshot {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export type FancyDevtoolsPanelProps = { store: DevtoolsStore; onClose?: () => void; className?: string };

export function FancyDevtoolsPanel({ store, onClose, className = "" }: FancyDevtoolsPanelProps) {
  const snapshot = useFancyDevtools(store);
  const [tab, setTab] = useState<"problems" | "activity" | "adapters" | "environment">("problems");
  const tabs = ["problems", "activity", "adapters", "environment"] as const;

  return <section className={`fdt-panel ${className}`} data-fancy-devtools="panel" aria-label="Fancy Devtools">
    <header className="fdt-header"><div><strong>Fancy Devtools</strong><span>rev {snapshot.revision}</span></div>{onClose && <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>}</header>
    <nav className="fdt-tabs" aria-label="Diagnostics views">{tabs.map((name) => <Button key={name} size="sm" variant={tab === name ? "default" : "ghost"} onClick={() => setTab(name)}>{name}<small>{countFor(name, snapshot)}</small></Button>)}</nav>
    <div className="fdt-content">
      {tab === "problems" && <ProblemList store={store} snapshot={snapshot} />}
      {tab === "activity" && <RecordList empty="No Fancy activity captured." records={snapshot.activity} title={(record) => `${record.source}: ${record.action}`} />}
      {tab === "adapters" && <AdapterList store={store} snapshot={snapshot} />}
      {tab === "environment" && <JsonView value={snapshot.environment} empty="No environment facts registered." />}
    </div>
  </section>;
}

export type FancyDevtoolsProps = { store?: DevtoolsStore; defaultOpen?: boolean; position?: "bottom-left" | "bottom-right" | "top-left" | "top-right" };

export function FancyDevtools({ store = fallbackStore, defaultOpen = false, position = "bottom-right" }: FancyDevtoolsProps) {
  const snapshot = useFancyDevtools(store);
  const [open, setOpen] = useState(defaultOpen);
  const activeErrors = snapshot.problems.filter((problem) => problem.severity === "error" && !problem.acknowledged).length;

  useEffect(() => { if (activeErrors > 0) setOpen(true); }, [activeErrors]);
  return <div className={`fdt-floating fdt-${position}`} data-fancy-devtools="root">
    {open && <FancyDevtoolsPanel store={store} onClose={() => setOpen(false)} />}
    {!open && <Button className="fdt-launcher" data-fancy-devtools="launcher" onClick={() => setOpen(true)} aria-label="Open Fancy Devtools">ƒ <span>{activeErrors || "✓"}</span></Button>}
    {open && <span hidden data-fancy-devtools="launcher">{activeErrors}</span>}
  </div>;
}

function ProblemList({ store, snapshot }: { store: DevtoolsStore; snapshot: DevtoolsSnapshot }) {
  if (snapshot.problems.length === 0) return <p className="fdt-empty">No problems captured.</p>;
  return <ol className="fdt-list">{[...snapshot.problems].reverse().map((problem) => <li key={problem.id} className={`fdt-problem fdt-${problem.severity}`} data-problem-id={problem.id}>
    <div><span>{problem.source}</span><strong>{problem.title}</strong>{problem.message && <p>{problem.message}</p>}</div>
    {!problem.acknowledged && <Button size="sm" variant="ghost" onClick={() => store.acknowledge(problem.id)}>Acknowledge</Button>}
  </li>)}</ol>;
}

function AdapterList({ store, snapshot }: { store: DevtoolsStore; snapshot: DevtoolsSnapshot }) {
  return <><Button size="sm" variant="ghost" onClick={() => void store.refreshAdapters()}>Refresh adapters</Button>{snapshot.adapters.length === 0 ? <p className="fdt-empty">No adapter snapshots yet.</p> : snapshot.adapters.map((adapter) => <article className="fdt-adapter" key={adapter.id}><strong>{adapter.label}</strong><JsonView value={{ summary: adapter.summary, records: adapter.records }} /></article>)}</>;
}

function RecordList({ records, title, empty }: { records: readonly Record<string, unknown>[]; title: (record: any) => string; empty: string }) {
  if (records.length === 0) return <p className="fdt-empty">{empty}</p>;
  return <ol className="fdt-list">{[...records].reverse().map((record, index) => <li key={String(record.id ?? index)}><strong>{title(record)}</strong><JsonView value={record} /></li>)}</ol>;
}

function JsonView({ value, empty = "" }: { value: unknown; empty?: string }) {
  const text = useMemo(() => JSON.stringify(value, null, 2), [value]);
  return text === "{}" || text === "[]" ? <p className="fdt-empty">{empty}</p> : <pre className="fdt-json">{text}</pre>;
}

function countFor(tab: string, snapshot: DevtoolsSnapshot) {
  if (tab === "problems") return snapshot.problems.length;
  if (tab === "activity") return snapshot.activity.length;
  if (tab === "adapters") return snapshot.adapters.length;
  return Object.keys(snapshot.environment).length;
}

export class FancyDevtoolsBoundary extends Component<{ store: DevtoolsStore; fallback?: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.store.report({ severity: "error", source: "react", title: error.message, stack: error.stack, detail: { componentStack: info.componentStack } });
  }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}
