import type { DevtoolsAdapter, JsonRecord } from "./types";

type QueryLike = {
  queryHash?: string;
  queryKey: unknown;
  state: { status?: string; fetchStatus?: string; dataUpdatedAt?: number; error?: unknown };
  getObserversCount?: () => number;
  isStale?: () => boolean;
};

export type QueryClientLike = {
  getQueryCache: () => { getAll: () => readonly QueryLike[] };
};

export function createQueryAdapter(queryClient: QueryClientLike): DevtoolsAdapter {
  return {
    id: "fancy-query",
    label: "Fancy Query",
    snapshot() {
      const queries = queryClient.getQueryCache().getAll();
      const records = queries.map((query) => ({
        id: query.queryHash ?? JSON.stringify(query.queryKey),
        key: query.queryKey,
        status: query.state.status,
        fetchStatus: query.state.fetchStatus,
        observers: query.getObserversCount?.() ?? 0,
        stale: query.isStale?.() ?? false,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }));

      return {
        summary: {
          queries: records.length,
          fetching: records.filter((query) => query.fetchStatus === "fetching").length,
          stale: records.filter((query) => query.stale).length,
          errors: records.filter((query) => query.status === "error").length,
        },
        records,
      };
    },
  };
}

export type TimelineAdapterOptions = {
  id: string;
  label: string;
  maxEvents?: number;
  now?: () => number;
};

export function createTimelineAdapter(options: TimelineAdapterOptions) {
  const maxEvents = Math.max(1, options.maxEvents ?? 200);
  const now = options.now ?? Date.now;
  let sequence = 0;
  let records: JsonRecord[] = [];

  const adapter: DevtoolsAdapter = {
    id: options.id,
    label: options.label,
    snapshot: () => ({ summary: { events: records.length }, records }),
  };

  return {
    adapter,
    record(event: string, detail: JsonRecord = {}) {
      records = [...records, { id: `${options.id}-${++sequence}`, timestamp: now(), event, detail }].slice(-maxEvents);
    },
    clear() { records = []; },
  };
}
