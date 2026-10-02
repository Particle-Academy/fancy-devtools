# Changelog

All notable changes to `@particle-academy/fancy-devtools` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to Semantic Versioning.

> **Pre-1.0.** Breaking changes land in MINOR releases.

## [Unreleased]

### Fixed

- **`CHANGELOG.md` is now in the published tarball.** `files` did not whitelist it, so npm never shipped it — and this package puts breaking changes in MINOR releases and tells you in the README to read the entry before taking one. The instruction existed for the author, who has the file, and not for the consumer, who is the only one being instructed. Nothing for you to do; the file simply arrives from this release on.

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
