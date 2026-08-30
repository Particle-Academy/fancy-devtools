export type DiagnosticSeverity = "info" | "warning" | "error";
export type JsonRecord = Record<string, unknown>;

export type DiagnosticProblemInput = {
  severity: DiagnosticSeverity;
  source: string;
  title: string;
  message?: string;
  detail?: JsonRecord;
  stack?: string;
  componentId?: string;
};

export type DiagnosticProblem = DiagnosticProblemInput & {
  id: string;
  timestamp: number;
  acknowledged: boolean;
};

export type DiagnosticActivityInput = {
  source: string;
  action: string;
  detail?: JsonRecord;
  durationMs?: number;
  actorId?: string;
};

export type DiagnosticActivity = DiagnosticActivityInput & { id: string; timestamp: number };

export type DevtoolsAdapterSnapshot = {
  summary?: JsonRecord;
  records?: readonly JsonRecord[];
};

export type DevtoolsAdapter = {
  id: string;
  label: string;
  snapshot: () => DevtoolsAdapterSnapshot | Promise<DevtoolsAdapterSnapshot>;
};

export type ResolvedAdapterSnapshot = DevtoolsAdapterSnapshot & { id: string; label: string };

export type DevtoolsSnapshot = {
  problems: readonly DiagnosticProblem[];
  activity: readonly DiagnosticActivity[];
  environment: Readonly<JsonRecord>;
  adapters: readonly ResolvedAdapterSnapshot[];
  revision: number;
};

export type DevtoolsStore = {
  getSnapshot: () => DevtoolsSnapshot;
  subscribe: (listener: () => void) => () => void;
  report: (problem: DiagnosticProblemInput) => string;
  activity: (activity: DiagnosticActivityInput) => string;
  acknowledge: (id: string) => boolean;
  clear: () => void;
  setEnvironment: (environment: JsonRecord) => void;
  registerAdapter: (adapter: DevtoolsAdapter) => () => void;
  refreshAdapters: () => Promise<void>;
  exportSnapshot: () => DevtoolsSnapshot;
};
