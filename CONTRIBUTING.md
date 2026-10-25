# Contributing

1. Open an issue describing the user problem and the expected result.
2. Create a small branch. Keep geometry and persistence logic outside UI components.
3. Add meaningful tests for behaviour changes; keep translations synchronized.
4. Run `pnpm check`. Generated engine changes must come from `pnpm engine`.
5. Include screenshots for UI changes and describe remaining limitations.

Never commit `.env` files, account tokens, passwords, private exports or deployment metadata. Keep upstream licence notices and document modifications. Do not publish packages under the upstream npm namespace. Production deployment is a separate maintainer action.
