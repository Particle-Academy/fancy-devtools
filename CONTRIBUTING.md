# Contributing to @particle-academy/fancy-devtools

Notes for anyone, human or agent, working ON this package's code. How to USE the
package is in [AGENTS.md](./AGENTS.md); what it is, is in [README.md](./README.md).
`CLAUDE.md` is a symlink to this file, so Claude Code reads these notes when it
works in this repo.

This repository owns the Fancy suite's development-only React diagnostics console.

## Invariants

- Do not recreate Chrome or React DevTools. Capture Fancy-owned meaning: suite contracts, package health, adapter state and Human+ activity.
- Human and agent views read the same `DevtoolsStore` snapshot. The bridge may filter or redact; it may not invent a parallel model.
- Every exported snapshot is recursively redacted. Never add an unredacted export path.
- Adapter failures are isolated. One package's broken diagnostic adapter must not break the app, panel or other adapters.
- The store returns stable immutable snapshots for `useSyncExternalStore`; publish a new snapshot on every visible mutation.
- Retention is bounded. Diagnostics tooling must not become the memory leak it is meant to find.
- The floating launcher and every problem retain stable `data-fancy-devtools` / `data-problem-id` handles.
- UI composes react-fancy primitives. Missing primitives are findings against the kit, not permission to replace them locally.
- The package never auto-mounts in production. Production debugging is a host decision with authentication, expiry and explicit lazy loading.

## Tests

`npm test`, `npm run lint`, and `npm run build` are all required. Bug fixes start with a failing test.
