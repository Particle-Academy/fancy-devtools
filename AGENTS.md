# Using @particle-academy/fancy-devtools — guide for agents

How an agent installs and uses this package in a consumer app. What the package
is, is in [README.md](./README.md). Notes for working ON this repo's code are in
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Install

```bash
npm install --save-dev @particle-academy/fancy-devtools
```

- **Peers:** `@particle-academy/react-fancy` (`>=5 <7`), `react ^19`, `react-dom ^19`.
- **Node:** `>=22`.
- Import the stylesheet: `import "@particle-academy/fancy-devtools/styles.css";`

## Find it on the Fancy MCP server

The catalog server is `https://ui.particle.academy/mcp` (streamable HTTP, no API
key; MCP id `fancy-ui`). This package is not yet listed there; it appears once it
is in the registry. Look for it later with `search-components`.

## API essentials

- `createDevtoolsStore()` creates the store; `installBrowserDiagnostics(store)`
  wires browser-level diagnostics into it.
- `<FancyDevtools store={store} />` mounts the floating console.
  `FancyDevtoolsPanel` embeds the same panel in an existing development shell.
  `FancyDevtoolsBoundary` turns React render failures into structured problems
  while keeping a host-supplied fallback.
- `store.registerAdapter({ id, label, snapshot })` lets a package contribute its
  own snapshot. Ready-made: `createQueryAdapter(queryClient)` for TanStack
  Query-compatible clients, `createTimelineAdapter({ id, label })` for a bounded
  event recorder (Inertia visits, Human+ tool calls, flow runs).
- `createDevtoolsBridgeAdapter(store)` gives agents redacted `getSnapshot`,
  `getProblems`, `getActivity`, adapter refresh, acknowledgement and clear
  operations. Hand it to the host's MCP registration layer; humans and agents
  then read the same snapshot.
- Stable handles: `data-fancy-devtools` on the launcher, `data-problem-id` on
  each problem.

## Traps

- **Development only.** Mount it behind a development-only conditional import.
  It never auto-mounts in production; production mounting must be explicit,
  authenticated and time-limited.
- **Redaction is a last boundary.** Exports redact credential-shaped keys, but do
  not record sensitive values on purpose.
- A broken adapter shows up in that adapter's summary; it does not break the app
  or the other adapters.
