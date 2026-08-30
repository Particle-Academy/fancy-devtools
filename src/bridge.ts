import type { DevtoolsStore } from "./types";

export type DevtoolsBridgeAdapter = ReturnType<typeof createDevtoolsBridgeAdapter>;

export function createDevtoolsBridgeAdapter(store: DevtoolsStore) {
  return {
    getSnapshot: () => store.exportSnapshot(),
    getProblems: () => ({ problems: store.exportSnapshot().problems }),
    getActivity: () => ({ activity: store.exportSnapshot().activity }),
    refreshAdapters: async () => { await store.refreshAdapters(); return store.exportSnapshot(); },
    acknowledgeProblem: (id: string) => ({ id, acknowledged: store.acknowledge(id) }),
    clear: () => { store.clear(); return { cleared: true as const }; },
  };
}
