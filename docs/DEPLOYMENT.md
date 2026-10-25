# Build and deployment

1. Install Node.js 22.12 or newer and pnpm 10.34.5.
2. Run `pnpm install --frozen-lockfile`.
3. Copy `.env.example` to `.env.local` and configure public account settings, or leave them blank for guest-only local development.
4. Run `pnpm check` to validate generated engine code, formatting, types, tests and production compilation.
5. Run `pnpm runtime:bundle`, `python3 scripts/package-cinggu-runtimes.py`, and `python3 scripts/package-preview-source.py` to rebuild browser exports and corresponding source.
6. Run `pnpm build`. Serve `dist/` with a static server. `pnpm preview` previews the production build locally.

## Hosted Cinggu integration

The creator deployment serves the public full editor at `/library/index.html`, its assets at `/avatar-lab/`, and the authenticated dashboard entry at `/api/advanced`. The same-origin account session allows private saves from both entry points. Preserve the base URL when copying the HTML entry. Preserve older dated runtime files so previously exported characters keep working.

Apply the database migration before enabling cloud saves. Keep database passwords and service-role keys only in server-side environment settings. The public repository contains no hosted credentials. Configure Supabase’s allowed redirects for your account portal and configure the Google OAuth callback in Google Cloud.

## Release checklist

- Test guest editing, sign-in navigation, account save/reload and cross-account isolation.
- Rebuild corresponding source after source edits and keep the AGPL licence and credits available.
- Review the public files for private credentials or customer data.
- Publish the source commit, then deploy the matching build.
- Verify the public editor, authenticated editor and owner dashboard after deployment.

No npm release is required. The upstream package identifiers remain for compatibility; this repository does not claim ownership of that npm namespace.
