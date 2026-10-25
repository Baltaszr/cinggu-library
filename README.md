# Cinggu Library

Create a little character with its own shape, eyes and motion.

[Open the full editor](https://cingguexpression.eldadbaltaszar.art/library/index.html) · [Creator dashboard](https://cingguexpression.eldadbaltaszar.art/) · [Credits](CREDITS.md) · [AGPL-3.0 licence](LICENSE)

Cinggu Library is a modified version of [Bible Strong Avatar Lab](https://github.com/smontlouis/bible-strong-avatar-lab), created by [Stéphane Montlouis-Calixte (@smontlouis)](https://github.com/smontlouis). It retains the upstream editor and rendering foundation. Cinggu adds its character family, imported eye artwork, editable silhouettes, expression packages, Indonesian interface and account-connected libraries. This is an adaptation, not an independently rewritten engine.

## Start creating

1. Pick one of the eleven characters: Cinggu, Orbi, Momo, Zizi, Flo, Bomi, Sunny, Mello, Nubi, Kubo or Pebbi. Double-click it to edit.
2. Adjust the head, colours and eye positions. In the outline editor, Shift-click points or drag a selection box; drag selected points together.
3. Open **Expressions**. Choose **Cinggu** for thirteen reference drawings or **Base** for the procedural presets. Double-click an expression to name it, assign a package and edit it.
4. Upload an eye sheet using the supplied template. Set the grid and contrast; inspect each result. Each eye can be positioned separately. Use the split slider when detection needs help. Touching outlined eyes are reconstructed from their enclosed centres; highly complex or overlapping drawings may need manual preparation.
5. Use **Animations** to arrange expressions, hold durations, transitions and blinks. Play, pause or stop from the playback bar.
6. Use **Export** for a runtime JSON, React/JavaScript demo, SVG/PNG photo or complete project backup. Source and licence links are here too.

Guests can use the full editor. On the hosted service, saving and exporting require a Cinggu account. **Sign in to save** opens the creator dashboard; after signing in choose **Open advanced editor**. The hosted editor shares that site's Supabase session. Saved libraries sync privately to the same backend and have a browser fallback. Wait for **Saved to Cinggu** in My account before closing the page. Guest edits are temporary and are not transferred through the sign-in redirect; sign in before beginning work you want to keep.

## Run locally

Requirements: Node.js 22.12+ (Node 24 recommended), pnpm 10.34.5 and Python 3 for distribution archives.

```sh
git clone https://github.com/Baltaszr/cinggu-library.git
cd cinggu-library
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). Without environment variables the full guest editor runs locally. To enable your own accounts, follow [account setup](docs/ACCOUNTS.md); never add service-role keys or database passwords to Vite variables. The official sign-in link opens the hosted Cinggu editor, not a cross-domain session on your local copy.

## Build and verify

```sh
pnpm check                 # formatting, types, packages, tests and site build
pnpm packages:build        # core, React and DOM renderer packages
pnpm runtime:bundle        # browser ESM runtime
python3 scripts/package-cinggu-runtimes.py
python3 scripts/package-preview-source.py
pnpm build                 # dist/ includes generated downloads
pnpm preview
```

Serve `dist/` with a static host. For a nested path, serve assets relative to that path (Vite uses `base: './'`). The official creator site serves the public full editor at `/library/index.html` and the signed-in entry at `/api/advanced`. See [deployment](docs/DEPLOYMENT.md). No npm packages are published by these commands. Upstream package identifiers are preserved for compatibility; the generated Cinggu archives contain the modified code.

## Project map

| Folder                                           | Purpose                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `src/features/avatar/`                           | Character recipes, expression artwork, sheet extraction and silhouettes |
| `src/features/studio/`                           | Editor interactions and project persistence                             |
| `src/features/account/`                          | Shared account session and private cloud synchronization                |
| `src/features/animation/`                        | Timeline and playback                                                   |
| `src/features/export/`                           | JSON, image and runtime exports                                         |
| `src/i18n/`                                      | English, French, Chinese and Indonesian copy                            |
| `packages/avatar-core/`                          | Framework-independent geometry and animation                            |
| `packages/avatar-react/`, `packages/avatar-web/` | Reusable renderers                                                      |
| `public/reference/`                              | Eye-sheet reference and template                                        |
| `docs/`                                          | Setup, architecture, credits and verification notes                     |

## Import limitations

Avatar sheets need one silhouette per grid cell, a plain/transparent background and no labels. The largest connected contour becomes a solid extruded head. Add detached limbs or accessories as additional primitives. This is silhouette reconstruction, not automatic 3D modelling. Eye imports are binary artwork, not semantic emotion recognition. Review the result before saving.

## Privacy and support

Each account owns its private library through database row-level security. The Cinggu owner can view registered-creator information, counts and latest sign-in/save summaries. This is not anonymous visitor tracking or a complete historical event log. Libraries are not automatically shared publicly.

Optional support is in the header: GoPay / OVO **087785191978**, or [Gumroad](https://9552156224053.gumroad.com/coffee?wanted=true). Payment is completed in your chosen provider.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes small, preserve existing character names and project compatibility, add comments for non-obvious behaviour, and run `pnpm check`. Report issues without passwords, tokens or private user data.

## Licence and acknowledgement

AGPL-3.0-only; see [LICENSE](LICENSE). Preserve upstream notices and provide corresponding source for modified network-served versions. Thank you to Stéphane Montlouis-Calixte and the Bible Strong Avatar Lab contributors for the foundation. [CREDITS.md](CREDITS.md) and [CINGGU-CHANGES.md](CINGGU-CHANGES.md) describe the distinction between upstream work and Cinggu additions.
