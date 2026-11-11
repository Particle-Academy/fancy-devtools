# Changelog

All notable changes to `@particle-academy/fancy-devtools` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to Semantic Versioning.

> **Pre-1.0.** Breaking changes land in MINOR releases.

## [Unreleased]

### Changed

- **Releases need a lab-run certificate.** `publish.yml` gains a read-only
  `lab-certificate` job that every publishing job needs: a tag is published only
  when the fancy-labs lab has certified that exact version and commit. Consumers
  do nothing; this changes how releases are cut, not what the package does.

## [0.1.1] - 2026-11-01

### Changed

- **The `@particle-academy/react-fancy` peer range now also accepts 6.x** (`>=5 <6` to `>=5 <7`). react-fancy 6.0.0 makes `Button` default to `type="button"` instead of submitting an enclosing form (Change Council CC-fancy-0003). Audited for that: its `Button`s (launcher, close, tabs, acknowledge, refresh adapters) are actions and none sits inside a form. No `Button` needed `type="submit"` and no `PromptInput` is used, so the package behaves the same on 5 and 6. On 6 its `Button`s also stop submitting a host form you happen to render it inside. The devDependency moved to `^6.0.0`, so this package's own suite, typecheck and build now run against 6. Widening only adds candidates, so the react-fancy you already have still resolves. **Consumer action:** none on react-fancy 5; on react-fancy 6 it works as-is.

### Fixed

- **`CHANGELOG.md` is now in the published tarball.** `files` did not whitelist it, so npm never shipped it — and this package puts breaking changes in MINOR releases and tells you in the README to read the entry before taking one. The instruction existed for the author, who has the file, and not for the consumer, who is the only one being instructed. Nothing for you to do; the file simply arrives from this release on.

### Security

- Update Vitest to 4.1.12 and patch the transitive undici development dependency for security fixes; dev toolchain only, nothing to do.

- **CI workflows now cap the `GITHUB_TOKEN` to `contents: read`.** With no
  `permissions:` block a workflow inherits the repository default, which can be
  read-write for the whole token — so a compromised action or a malicious
  transitive dependency in any step could push to this repo. Nothing in CI here
  needs more than to read the code. Declared at the workflow level so a job
  added later cannot arrive with no cap. **Nothing for a consumer to do and no
  published artifact changes** — recorded because an unwritten cap is one a
  future edit removes without anyone noticing. (CodeQL
  `actions/missing-workflow-permissions`.)

- `source-map-js` is pinned forward to `^1.2.2` via `overrides`. Versions up to
  1.2.1 allow an event-loop denial of service through indexed source-map section
  offsets, and it arrives here transitively through the build toolchain.
  **Nothing for a consumer to do, and no runtime change**: an npm package does
  not ship a lockfile, so this governs builds OF this repo, not anything
  installed FROM it. Recorded rather than left silent because the override it
  sits beside — `shell-quote` `^1.9.0`, added for an earlier advisory — was
  carried with no note of why, and had drifted back inside the vulnerable range
  before anyone looked.
- **Dev toolchain only — no runtime change, nothing for consumers to do.** The
  lockfile now resolves `vite` 8.3.5 (was 8.2.2), whose bundled
  `launch-editor` fixes GHSA-587h-7wmj-h5pm (HIGH, `fs.existsSync()` check
  bypassable on Windows), GHSA-698v-4r3x-3vcv (`escapeCmdArgs()` omits `%`
  escaping on Windows) and GHSA-r825-w8mm-5pxw (editor CLI flag
  misinterpretation). `vite` is only reached through the test/dev toolchain
  and the published package does not ship our lockfile, so the exposure was
  this repo's own dev server.

## [0.1.0] - 2026-08-30

### Added

- Typed, bounded diagnostics store for problems, activity, environment facts and package-owned adapter snapshots.
- Recursive secret redaction and a structured export shared by humans and agents.
- Browser error and unhandled-rejection capture with a clean uninstall function.
- Floating `FancyDevtools`, embedded `FancyDevtoolsPanel` and `FancyDevtoolsBoundary` surfaces, built with react-fancy primitives and stable handles.
- Provider-neutral `createDevtoolsBridgeAdapter` for MCP registration layers.

**What consumers must do:** mount the panel through a development-only conditional import, import `styles.css`, and register only the package adapters whose state they want exposed.

## [0.0.0] - 2026-08-30

### Added

- Registry bootstrap release. Use `0.1.0` or newer in applications; this version exists only to claim the scoped package name before OIDC trusted publishing can be configured.
