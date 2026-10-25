# Accounts and private saves

Guests can use the complete editor. Saving and exporting require a verified Cinggu account. Use **Sign in to save → Continue to Cinggu sign-in**, then open the full editor from the creator dashboard. Sign in before making work you want to keep: guest drafts are temporary and are not transferred through the login redirect.

The hosted editor shares the creator website’s Supabase session on the same origin. Tokens are never put in links. Each account has one private workspace, containing its avatars, expressions, sequences and palettes. Changes are saved locally and uploaded after a short pause. Check **My account** for save status before closing. A conflicting newer cloud save is not overwritten; reload to retrieve it.

The owner dashboard shows registered creators, workspace counts and latest save dates. It does not expose authentication tokens. This is a latest-activity summary, not a complete browsing history.

## Self hosting

Copy `.env.example` to `.env.local` and supply your own Supabase URL and publishable key. Never use a service-role key in a Vite variable. The deployment migration in `deployment/` creates the workspace table and row-level security policies; the hosted Cinggu migration also integrates existing owner tables. Review and adapt those owner dependencies before using it in an unrelated project.

Set `VITE_CREATOR_URL` to your account portal. An editor on a different origin does not automatically share browser sessions. Host the account portal and editor on the same origin, or implement a secure authentication callback for your deployment.
