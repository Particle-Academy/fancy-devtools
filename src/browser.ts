import type { DevtoolsStore } from "./types";

export function installBrowserDiagnostics(store: DevtoolsStore, target: Window = window): () => void {
  const onError = (event: ErrorEvent) => {
    store.report({ severity: "error", source: "runtime", title: event.message || "Browser error", stack: event.error instanceof Error ? event.error.stack : undefined });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    store.report({ severity: "error", source: "promise", title: reason instanceof Error ? reason.message : String(reason ?? "Unhandled rejection"), stack: reason instanceof Error ? reason.stack : undefined });
  };
  target.addEventListener("error", onError);
  target.addEventListener("unhandledrejection", onRejection);
  return () => {
    target.removeEventListener("error", onError);
    target.removeEventListener("unhandledrejection", onRejection);
  };
}
