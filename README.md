# Fancy Devtools

Suite-aware diagnostics for Fancy React applications. Browser and React DevTools already inspect DOM, CSS, network traffic, component trees and render profiles; Fancy Devtools supplies the context only the suite owns: structured problems, package/environment facts, adapter snapshots, Human+ activity and an identical redacted view for agents.

```bash
npm install --save-dev @particle-academy/fancy-devtools
```

Mount it only in development and import its stylesheet:

```tsx
import { createDevtoolsStore, FancyDevtools, installBrowserDiagnostics } from "@particle-academy/fancy-devtools";
import "@particle-academy/fancy-devtools/styles.css";

export const devtools = createDevtoolsStore();
installBrowserDiagnostics(devtools);

root.render(<><App /><FancyDevtools store={devtools} /></>);
```

`FancyDevtoolsPanel` embeds the same panel in an existing development shell. `FancyDevtoolsBoundary` converts React render failures into structured problems while preserving a host-supplied fallback.

## Adapters

Packages contribute snapshots instead of Fancy Devtools reaching into private state:

```ts
devtools.registerAdapter({
  id: "fancy-query",
  label: "Fancy Query",
  snapshot: () => ({
    summary: { queries: queryClient.getQueryCache().getAll().length },
    records: queryClient.getQueryCache().getAll().map(query => ({
      id: JSON.stringify(query.queryKey),
      status: query.state.status,
      fetchStatus: query.state.fetchStatus,
    })),
  }),
});
```

Adapter failure is isolated and appears in that adapter's summary; it cannot break the application or hide other diagnostics.

For TanStack Query-compatible clients, `createQueryAdapter(queryClient)` provides this normalization without adding a runtime dependency. `createTimelineAdapter({ id, label })` provides a bounded recorder for Inertia visits, Human+ tool calls, flow runs, or other package-owned event streams.

## Human+ bridge

`createDevtoolsBridgeAdapter(store)` provides redacted `getSnapshot`, `getProblems`, `getActivity`, adapter refresh, acknowledgement and clear operations. Hand that adapter to the host's MCP registration layer. Humans and agents therefore inspect the same snapshot rather than maintaining two diagnostic models.

## Security

Exports recursively redact keys shaped like credentials, authorization, cookies, passwords, secrets, tokens and API/private keys. Redaction is a final boundary, not permission to deliberately record sensitive values. Production mounting must be explicit, authenticated and time-limited; the default integration is a development-only conditional import.

## License

MIT
