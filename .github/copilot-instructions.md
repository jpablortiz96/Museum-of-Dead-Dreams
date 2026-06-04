# Repository instructions for GitHub Copilot

This repository is `Museum of Dead Dreams`, an AI-powered product for analyzing abandoned public GitHub repositories and turning them into museum exhibits, revival plans, Resurrection Bay records, and Copilot execution kits.

## Non-negotiable engineering rules

- Do not introduce React Router unless the architecture is intentionally redesigned.
- Keep AI fallbacks working for:
  - museum exhibits
  - revival plans
  - Copilot Curator answers
- Keep `Resurrection Bay` scoped per `museumKey`.
- Preserve query-param sharing with `?user=<github-username>`.
- Do not replace `lucide-react` icons with emoji.
- Preserve branded PDF export.
- Preserve Copilot Resurrection Kit generation.
- Keep AI outputs schema-compatible with:
  - server-side Zod schemas
  - client-side TypeScript types
- Do not expose secrets in the client bundle.
- Keep local-first development working with:
  - `npm run dev`
  - `npm run dev:web`
  - `npm run dev:api`
- Run `npm run build` before finalizing meaningful changes.

## Product architecture hints

- `app/src/App.tsx` is the orchestration layer.
- `app/server/revival-server.mjs` is the museum intelligence server.
- `app/src/services/githubApi.ts` is the GitHub evidence collector.
- `app/src/services/museumApi.ts` handles exhibit generation requests.
- `app/src/services/revivalApi.ts` handles revival-plan requests.
- `app/src/services/copilotCuratorApi.ts` handles curator Q&A.
- `app/src/components/ResurrectionBay.tsx` and `app/src/utils/copilotResurrectionKit.ts` together define the afterlife archive and downloadable kit behavior.

## Documentation discipline

- Keep `CONTEXT.md` aligned with meaningful architecture changes.
- If README visuals or docs depend on a code change, update them in the same pass.
- Prefer grounded claims over hype.

