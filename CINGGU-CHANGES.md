# Cinggu adaptation

Upstream: https://github.com/smontlouis/bible-strong-avatar-lab
Commit: 79fe9ba06e4874b11394b8e8a3f2c493c9d197ba
Modified 2026-10-24. AGPL-3.0-only; original copyright and attribution retained.

Changes: outlined Cinggu eye contours in shared geometry (including generated engine); Cinggu title; isolated local-storage keys; modified-source download link. All original studio tools retained. Hosted as a separate document under /avatar-lab/ with no auth/device integration.

Build: Node >=22.12; pnpm 10.34.5; pnpm install --frozen-lockfile; pnpm build.

The modified React/Web runtimes are distributed as hosted tarballs. Package identifiers remain upstream names for compatibility; these are Cinggu modifications, not upstream releases.

## Character Playground redesign — 2026-10-24

- Cinggu cream/moss workbench, eleven new character names and recipes from the owner reference.
- Editable normalized silhouettes, dimensional controls, black pupils and asymmetric white eyes.
- Silhouettes carried through project saves, definition schema, local React/Web runtimes, standalone renderer and photo exports.
- Untouched old starter avatars migrate; renamed/customized avatars and their behavior remain.
- Credits and corresponding source offered through About & licenses. Original copyright/license retained.
- React and Web installation commands and React demo ZIP now use the hosted modified runtime tarballs, not unmodified upstream npm packages.
- Build packages before the app: pnpm packages:build; python3 scripts/package-cinggu-runtimes.py; pnpm build.
- Outline editing changes existing vertices; adding/removing vertices is not part of this release. Existing primitive composition is retained.

## 2026-10-25 — Four Cinggu surfaces

Selected angular black/lime identity in the studio header. Hosted advanced entry now belongs to the signed-in creator app; public source/runtime remain available. Separate simple playground uses the same avatar definitions and renderer.

## 2026-10-25 — Matching-UX local preview

- Separate preview copied from the current Cinggu editor at the founder’s explicit request. The live source and deployed engine remain unchanged.
- Exact current eleven avatar recipes, solid colours, eye defaults and workspace flow retained. No WebGL lighting or replacement silhouettes.
- New custom-head creation inside the existing Body construction panel: a fresh contour, direct dragging, keyboard movement, numeric coordinates, add/remove points and crossing prevention.
- Existing Save/Back-to-studio transaction, expression authoring, timelines, Photo Mode, JSON/React/JavaScript exports and translations remain in place.
- Preview draft/language storage keys are isolated; telemetry disabled locally.
- This is an AGPL-licensed Cinggu adaptation of the existing implementation, not a clean-room engine or a relicensing of upstream code.

## 2026-10-25 — Preview: solid side walls and image expressions

Corrected projected face winding so outline extrusions do not cancel their own depth. Preserved character recipes. Added a playback entry point using the existing timeline. Added bounded local eye-sheet extraction and per-expression artwork, persistence, runtime JSON round-trip and generated runtime support. Moved the large About panel to a compact source/licence destination. This revision is local, not published.

## 2026-10-25 — Cinggu expressions in the preset library

Bundled thirteen reference masks as editable named expressions. Added a one-time document upgrade for existing base and personalised libraries while preserving subsequent deletion and edits. Aligned the source label with the language selector. Added creator guidance and documented the distinction between upstream foundation and Cinggu additions.
