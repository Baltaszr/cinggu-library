# Cinggu — matching-UX preview

Open **http://127.0.0.1:8779/** while the local server is running.

This is the revised preview requested on 25 October 2026 after the founder rejected the different silhouettes, shaded colours and new layout in the earlier WebGL experiment. It copies the existing Cinggu editor and retains its original Avatar Lab implementation and AGPL notices.

## What stays the same

All eleven head recipes and their colours/eyes are unchanged: Cinggu, Orbi, Momo, Zizi, Flo, Bomi, Sunny, Mello, Nubi, Kubo and Pebbi. The existing chooser, double-click editing, Pose, Expressions, Animations, Photo Mode and Export flows are retained. Regular body primitives and reusable expression controls continue to use the existing renderer. This preview does not claim to turn the SVG engine into a WebGL mesh engine.

## Try the new feature

1. Double-click a character, or create an avatar with the existing + button.
2. In **Body construction → Primary**, choose **Create my own head**.
3. Drag contour points or select a point and use X/Y values or arrow keys.
4. Add or remove points to shape the outline. Crossing edges are rejected.
5. Use the existing dimensions, body colour and eye controls.
6. **Save** keeps the character. **Back to studio** discards unsaved avatar edits.
7. Use the existing **Expressions** module to create its expressions, then **Animations** to sequence them.

New code is deliberately small: `customOutline.ts` handles contour rules; `CustomHeadEditor.tsx` contains only the new inline controls. The existing controller still owns saving and cancelling.

## Run and verify

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 8779
pnpm check
```

The full studio remains browser-local. The preview has its own storage key and does not change online accounts, the four websites or device firmware. The earlier experiment remains in `../06 Cinggu Engine` for reference but is not the approved design direction.

See `CINGGU-CHANGES.md` and `LICENSE` for provenance and terms. Do not publish or replace the live engine until the founder reviews this preview.

## Revision: solid heads and imported eyes (25 October 2026)

Preview only: http://127.0.0.1:8779/. Do not deploy, push or publish to `cinggu-library` until the founder approves.

- Click **Play animation** below the library. The existing timeline then provides pause, resume and stop.
- Open **Expressions → New expression → Import my eyes**. Choose **Try Cinggu reference** or upload PNG/JPEG/WebP (8 MB maximum). The reference detects 13 pairs.
- Adjust columns, automatic/manual rows, contrast and light/dark background. Choose a crop, give the expression a unique semantic key, then Save. Existing eye size, position and rotation controls apply to imported artwork.
- Add that saved expression to an animation using the existing Animations editor. Imports belong to the selected mascot, not the neutral face or every character.
- Use **Download template** for a drawing guide. One eye pair belongs in each cell. The importer cleans small speckles and fits each pair to 128×64 pixels. This is pixel extraction, not emotion recognition or vector tracing. Review each crop; uneven layouts can require manual grid adjustment.
- Artwork stays in local browser storage and project/runtime JSON. Images are processed locally. Each eye uses a bounded 64×64 binary mask; transitions switch artwork while existing numeric pose controls interpolate.
- Double-click a mascot and open **Body construction → Create my own head**. Edit its outline, width, height and depth; use secondary primitives for body parts. Save applies changes; Back cancels the draft.
- Custom outlines now keep solid projected side walls at 90° rotations. Front silhouettes and colours are unchanged. This remains the existing SVG renderer with projected extruded geometry, not a new shaded WebGL engine.

The large About panel was removed. A compact Source & licence link leads to corresponding source and notices. Copied code remains an AGPL adaptation; publishing it as independently authored would be inaccurate. Existing attribution remains in source documentation.

## Bundled expression update

The Expressions page includes all 13 Cinggu reference pairs directly, ahead of the existing presets. A standard library now has 40 presets. No upload is required to try them. Existing personalised libraries receive missing pairs once without replacing saved edits. The source link, flag and dropdown arrow share a centred header alignment.

## Community controls — 25 October 2026

- Expression packages separate Cinggu's 13 drawings from the 27 Base presets. Custom names and package names survive project/runtime serialization.
- The playback indicator selects animations; the Expressions page selects individual expressions.
- Head editing supports Shift-click, box selection, Select all, keyboard movement and group dragging.
- Avatar sheets use an explicit grid, one silhouette per cell. The largest connected outline becomes an editable extruded head; detached parts must be added as primitives.
- Eye imports detect a gap, with a manual split adjustment. Each eye is centred independently, keeps relative size and has a separate SVG export. Existing imported artwork migrates once.
- Random colours updates the family; Original colours restores bundled colours. Save palette requires sign-in.
- Supabase account validation gates saves and exports. Signed-in saves are scoped to that account in this browser; this is not cloud sync. Google callback/localhost allowlisting and a real signed-in save still need end-to-end verification. Guests can preview edits without persistent saves.

Verification: full build/typecheck/package checks and original 220 tests passed; three additional import/package tests passed. Browser confirmed the 13-item Cinggu filter and guest Save palette sign-in prompt. No production deployment or GitHub publication.

## Indonesian and creator support

The header now offers Support: copy the GoPay or OVO number 087785191978, or open the creator's Gumroad support page. Export includes the same options and the source/licence links. The inline Minimal usage example is removed; the full technical guide remains available. Bahasa Indonesia is selectable and remembered. Main editor and support labels are localized; advanced developer-reference text falls back to English. No payment is initiated automatically.

Export now contains only source/licence links. Creator support payment options remain exclusively in the header dropdown (25 October 2026).
