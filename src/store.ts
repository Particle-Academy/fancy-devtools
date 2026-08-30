import { redact } from "./redact";
import type { DevtoolsAdapter, DevtoolsSnapshot, DevtoolsStore, DiagnosticActivityInput, DiagnosticProblemInput, JsonRecord, ResolvedAdapterSnapshot } from "./types";

export type DevtoolsStoreOptions = { maxEvents?: number; now?: () => number };

export function createDevtoolsStore(options: DevtoolsStoreOptions = {}): DevtoolsStore {
  const maxEvents = Math.max(1, options.maxEvents ?? 200);
  const now = options.now ?? Date.now;
  const listeners = new Set<() => void>();
  const adapters = new Map<string, DevtoolsAdapter>();
  let sequence = 0;
  let snapshot: DevtoolsSnapshot = { problems: [], activity: [], environment: {}, adapters: [], revision: 0 };

  const publish = (next: Omit<DevtoolsSnapshot, "revision">) => {
    snapshot = { ...next, revision: snapshot.revision + 1 };
    listeners.forEach((listener) => listener());
  };
  const id = (prefix: string) => `${prefix}-${now()}-${++sequence}`;

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    report(problem: DiagnosticProblemInput) {
      const problemId = id("problem");
      publish({ ...snapshot, problems: [...snapshot.problems, { ...problem, id: problemId, timestamp: now(), acknowledged: false }].slice(-maxEvents) });
      return problemId;
    },
    activity(input: DiagnosticActivityInput) {
      const activityId = id("activity");
      publish({ ...snapshot, activity: [...snapshot.activity, { ...input, id: activityId, timestamp: now() }].slice(-maxEvents) });
      return activityId;
    },
    acknowledge(problemId: string) {
      const found = snapshot.problems.some((problem) => problem.id === problemId);
      if (!found) return false;
      publish({ ...snapshot, problems: snapshot.problems.map((problem) => problem.id === problemId ? { ...problem, acknowledged: true } : problem) });
      return true;
    },
    clear() { publish({ ...snapshot, problems: [], activity: [] }); },
    setEnvironment(environment: JsonRecord) { publish({ ...snapshot, environment: { ...snapshot.environment, ...environment } }); },
    registerAdapter(adapter: DevtoolsAdapter) {
      if (adapters.has(adapter.id)) throw new Error(`fancy-devtools: adapter "${adapter.id}" is already registered.`);
      adapters.set(adapter.id, adapter);
      return () => {
        if (adapters.get(adapter.id) !== adapter) return;
        adapters.delete(adapter.id);
        publish({ ...snapshot, adapters: snapshot.adapters.filter((entry) => entry.id !== adapter.id) });
      };
    },
    async refreshAdapters() {
      const resolved: ResolvedAdapterSnapshot[] = [];
      for (const adapter of adapters.values()) {
        try {
          resolved.push({ id: adapter.id, label: adapter.label, ...(await adapter.snapshot()) });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          resolved.push({ id: adapter.id, label: adapter.label, summary: { error: message } });
        }
      }
      publish({ ...snapshot, adapters: resolved });
    },
    exportSnapshot: () => redact(snapshot),
  };
}
