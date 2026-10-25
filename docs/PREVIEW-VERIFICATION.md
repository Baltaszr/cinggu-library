# Matching-UX preview verification — 2026-10-25

- Compared live Cinggu and Bible Strong editor screenshots in Chrome.
- Starter-family regression fixture matches all eleven complete recipes, including head outlines, body/eye colours, dimensions and body assemblies.
- Chrome preview: existing chooser and double-click editor open correctly. Creating a fresh custom head gives twelve editable vertices; Add a point creates thirteen. Back to studio restores the original Cinggu silhouette without saving.
- Existing expression, animation, Photo Mode and export implementation retained rather than replaced by the rejected experimental flow.
- `pnpm check`: 28 test files, 210 tests passed; formatting, package builds, TypeScript and app build passed.
- A non-blocking bundle-size warning remains in the inherited app build.
- No production deployment, authentication change, hardware upload or alteration of `05 Advanced Engine` was performed.

## Solid heads and eye-sheet revision

Chrome: Play → Pause shows PAUSED and Resume. Cinggu reference detects 13 pairs. Heart eyes apply in the existing expression draft, save as `cinggu-heart-preview`, survive reload and appear when selected. Pose rotation Y=90 shows a solid side wall; Y=35 preserves silhouette with imported eyes. One test expression was deliberately retained in this local browser for review. Images remain local.

Added tests cover mask validation, persistence, left/right separation, extraction, geometry projection, face winding at five rotations, and runtime artwork round-trip. `pnpm check` includes formatting, typecheck, tests, package builds and app build. Inherited bundle-size warning remains; no new external dependency added.

Final result: `pnpm check` passed, 29 files / 217 tests, TypeScript and all builds passed.

## Bundled expressions and header alignment

All 13 Cinggu reference masks now appear first in Expressions. Chrome verified Orbi displays 40 presets and selecting Cinggu Love applies heart eyes. The source label and flag align on a common centre line. Tests cover unique keys, valid artwork, non-destructive upgrades and no resurrection of deleted presets. `pnpm check` passed: 30 files, 220 tests, typecheck and builds. The existing bundle-size warning remains. No deployment or GitHub publishing.

## Community controls — 25 October 2026

- Expression packages separate Cinggu's 13 drawings from the 27 Base presets. Custom names and package names survive project/runtime serialization.
- The playback indicator selects animations; the Expressions page selects individual expressions.
- Head editing supports Shift-click, box selection, Select all, keyboard movement and group dragging.
- Avatar sheets use an explicit grid, one silhouette per cell. The largest connected outline becomes an editable extruded head; detached parts must be added as primitives.
- Eye imports detect a gap, with a manual split adjustment. Each eye is centred independently, keeps relative size and has a separate SVG export. Existing imported artwork migrates once.
- Random colours updates the family; Original colours restores bundled colours. Save palette requires sign-in.
- Supabase account validation gates saves and exports. Signed-in saves are scoped to that account in this browser; this is not cloud sync. Google callback/localhost allowlisting and a real signed-in save still need end-to-end verification. Guests can preview edits without persistent saves.

Verification: full build/typecheck/package checks and original 220 tests passed; three additional import/package tests passed. Browser confirmed the 13-item Cinggu filter and guest Save palette sign-in prompt. No production deployment or GitHub publication.
