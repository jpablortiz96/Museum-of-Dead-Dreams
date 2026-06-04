# Architecture

## System overview

Museum of Dead Dreams is a local-first AI product with two major layers:

1. a React + TypeScript frontend that renders the museum experience
2. a local Node AI server that generates exhibits, revival plans, and curator replies

The product turns public GitHub repository evidence into narrative and execution artifacts.

## Frontend architecture

The frontend lives in `app/src/`.

### Core orchestration

`app/src/App.tsx` is the primary control plane. It owns:

- view flow
- username analysis lifecycle
- personalized museum state
- achievement persistence
- Resurrection Bay persistence
- query-param sharing

There is no router. Views are state-driven:

- `welcome`
- `loading`
- `hall`
- `exhibit`
- `resurrection`

### Experience components

- `WelcomeScreen.tsx`
  - GitHub username input and onboarding
- `LoadingGraveyard.tsx`
  - repo analysis progress UI
- `MuseumHall.tsx`
  - exhibit grid
- `ExhibitRoom.tsx`
  - project room, artifacts, Copilot Curator, Revival CTA
- `RevivalReport.tsx`
  - slide-over with six tabs and export actions
- `ResurrectionBay.tsx`
  - persistent afterlife archive and Copilot kit distribution layer

### Visual layer

The visual system is built with:

- Tailwind CSS
- shadcn/ui primitives
- HTML5 Canvas particles
- CSS transitions and glow effects

## Backend / AI server architecture

The AI server lives in:

- `app/server/revival-server.mjs`

It is intentionally local-first for development.

### Responsibilities

- health endpoint
- museum exhibit generation
- revival-plan generation
- Copilot Curator Q&A
- request logging
- in-memory caching
- structured output validation with Zod

### Endpoints

- `GET /api/health`
- `POST /api/museum-exhibits`
- `POST /api/revival-plan`
- `POST /api/copilot-curator`

## GitHub ingestion pipeline

GitHub analysis lives in `app/src/services/githubApi.ts`.

### Evidence recovered

For each selected repo, the app attempts to recover:

- repo metadata
- language breakdown
- total commit count
- last commit SHA
- last commit message
- last commit date
- root-level file and folder names
- README excerpt
- manifest snippets from likely stack-defining files

### Ranking

Repos are filtered and ranked by abandonment:

- forks excluded
- days since last push computed
- top abandoned repos selected

## Data flow

### Museum generation flow

1. user enters GitHub username
2. frontend requests public repos from GitHub
3. repo evidence is enriched locally
4. compact grounded payload is sent to `/api/museum-exhibits`
5. server calls OpenAI with structured output constraints
6. AI returns exhibit content
7. frontend converts response into `Exhibit[]`
8. `Resurrection Bay` is appended

### Revival Plan flow

1. user opens `View Revival Plan`
2. frontend checks cache and health
3. frontend requests `/api/revival-plan`
4. server generates structured report
5. frontend renders tabs, export actions, and score visualizations
6. user may commit the result into `Resurrection Bay`

### Copilot Curator flow

1. user asks a question in the exhibit room
2. frontend packages exhibit grounding + short history
3. request is sent to `/api/copilot-curator`
4. server returns:
   - answer
   - evidence
   - suggested follow-ups
5. frontend caches the reply locally

## Caching

### Frontend

The frontend uses `localStorage` for:

- visited exhibits
- read epitaphs
- unlocked achievements
- revival-plan views and exports
- revival scores
- Copilot Curator usage
- Resurrection Bay archive
- personalized museum cache by username
- revival-plan cache
- curator-answer cache

### Backend

The local AI server uses process-local in-memory caching for:

- museum exhibit responses
- revival plan responses
- curator responses

## Persistence model

`Resurrection Bay` is stored per museum key:

- `github:<username>` for personalized museums
- `curator-default` for the default museum

That means each analyzed GitHub user gets a separate afterlife archive.

## Fallback matrix

The product is intentionally resilient.

### Museum generation fallback

If `/api/museum-exhibits` fails:

- fallback to `contentGenerator.ts`

### Revival Plan fallback

If `/api/revival-plan` fails or times out:

- fallback to `revivalTemplates.ts`

### Copilot Curator fallback

If `/api/copilot-curator` fails:

- fallback to grounded local heuristic answers

## PDF export pipeline

PDF export is not a plain browser print.

### Flow

1. hidden branded HTML document is rendered in `RevivalReportPdfDocument.tsx`
2. `revivalPdf.ts` waits for paint and fonts
3. `html2canvas` captures the DOM
4. `jspdf` slices long output into A4 pages
5. user downloads a branded PDF dossier

## Copilot Kit pipeline

When a project is committed to `Resurrection Bay`, the app creates a `CopilotResurrectionKit`.

Files generated:

- `.github/copilot-instructions.md`
- `AGENTS.md`
- `.github/instructions/resurrection.instructions.md`
- `.github/skills/<project>-resurrection/SKILL.md`
- `docs/revival-plan.md`
- `docs/resurrection-backlog.md`

This bridges the gap between diagnosis and implementation.

## Deployment posture

Today the project is optimized for local-first development:

- Vite frontend
- local AI server
- optional public GitHub token for rate-limit relief

The next logical production step would be a hosted AI backend with the same API surface.

