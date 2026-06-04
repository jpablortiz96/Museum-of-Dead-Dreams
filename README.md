# Museum of Dead Dreams

![Museum of Dead Dreams Hero](assets/readme/hero.svg)

> An AI-powered museum that turns abandoned GitHub repos into exhibits, autopsies, revival plans, branded PDFs, and GitHub Copilot resurrection kits.

[![React](https://img.shields.io/badge/React-19-0f172a?logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-0f172a?logo=typescript&logoColor=3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-0f172a?logo=vite&logoColor=646cff)](https://vite.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Structured%20Generation-0f172a?logo=openai&logoColor=10a37f)](https://platform.openai.com/)
[![GitHub API](https://img.shields.io/badge/GitHub-Public%20Repo%20Analysis-0f172a?logo=github&logoColor=ffffff)](https://docs.github.com/en/rest)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-Resurrection%20Kits-0f172a?logo=githubcopilot&logoColor=ffffff)](https://github.com/features/copilot)
[![PDF Export](https://img.shields.io/badge/Export-Branded%20PDF-0f172a?logo=adobeacrobatreader&logoColor=ef4444)](#revival-plans)
[![MIT License](https://img.shields.io/badge/License-MIT-0f172a)](./LICENSE)

## Live Links

- Live experience: [Museum of Dead Dreams](https://osiam2phyuryk.kimi.page)
- Repository: [jpablortiz96/Museum-of-Dead-Dreams](https://github.com/jpablortiz96/Museum-of-Dead-Dreams)
- Challenge: [GitHub Finish-Up-A-Thon 2026](https://dev.to/challenges/github-2026-05-21)
- Architecture notes: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Before / after breakdown: [docs/BEFORE_AFTER.md](./docs/BEFORE_AFTER.md)
- Copilot journey: [docs/COPILOT_JOURNEY.md](./docs/COPILOT_JOURNEY.md)
- ROI framing: [docs/ROI.md](./docs/ROI.md)
- Demo script: [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md)
- Submission checklist: [docs/SUBMISSION_CHECKLIST.md](./docs/SUBMISSION_CHECKLIST.md)

## What This Project Is

Every developer has a graveyard.

Some repos died because the idea was too early. Some died because the architecture never stabilized. Some died because life moved faster than the roadmap. Most of them sit on GitHub as static code artifacts with no story, no diagnosis, and no realistic path back.

`Museum of Dead Dreams` reframes those abandoned repositories as an interactive product experience:

- it discovers a user's public repos through the GitHub API
- selects the most abandoned ones
- reconstructs each project as a museum exhibit
- explains why it likely failed
- lets users interrogate the repo through a grounded Copilot Curator
- generates a six-part Revival Plan
- exports that plan as Markdown or a branded PDF
- stores revived projects inside a persistent Resurrection Bay
- produces a GitHub Copilot Resurrection Kit that can be dropped into the real repo

This is not just a gallery. It is a revival workflow disguised as an atmospheric museum.

## The Problem

Abandoned repositories usually fail in two ways:

1. The code becomes inert.
2. The learning disappears with it.

GitHub preserves files, but it does not preserve the product context around abandoned ideas:

- why the project probably died
- what technical debt killed momentum
- what market shift made it irrelevant
- what would have to change for it to succeed today
- how to hand that context back to a coding agent like GitHub Copilot

## The Solution

Museum of Dead Dreams converts repo entropy into a structured, story-driven, and action-ready experience:

- personalized museum generation per GitHub username
- AI-generated exhibit narrative grounded in repo evidence
- live Copilot Curator Q&A for each exhibit
- multi-section revival strategy reports
- branded executive PDF export
- persistent "afterlife" archive for revived projects
- downloadable GitHub Copilot kits to continue the rebuild in the original repository

## Product Flow

![Product Flow](assets/readme/product-flow.svg)

The end-to-end user flow is:

1. Enter a GitHub username.
2. Analyze public repos through the GitHub API.
3. Rank and select the most abandoned projects.
4. Generate AI-driven exhibits with grounded repo evidence.
5. Explore rooms, artifacts, causes of death, and Copilot narration.
6. Ask the Copilot Curator repo-specific questions.
7. Open a Revival Plan with product, architecture, and market strategy.
8. Export the plan as Markdown or a branded PDF.
9. Commit the revived project into Resurrection Bay.
10. Download a GitHub Copilot Resurrection Kit and apply it to the original repo.

## Real Product Screenshots

All screenshots below were captured from the running application, not mocked or composited.

### 1. Welcome Screen

<p align="center">
  <img src="assets/readme/screenshots/01-welcome-screen.png" alt="Museum of Dead Dreams welcome screen" width="100%" />
</p>

### 2. Loading Graveyard

<p align="center">
  <img src="assets/readme/screenshots/02-loading-graveyard.png" alt="Loading graveyard analysis screen" width="100%" />
</p>

### 3. Museum Hall

<p align="center">
  <img src="assets/readme/screenshots/03-museum-hall.png" alt="Personalized museum hall with abandoned repo exhibits" width="100%" />
</p>

### 4. Exhibit Room

<p align="center">
  <img src="assets/readme/screenshots/04-exhibit-room.png" alt="Exhibit room for an abandoned repository" width="100%" />
</p>

### 5. Copilot Curator

<p align="center">
  <img src="assets/readme/screenshots/05-copilot-curator.png" alt="Copilot Curator answering grounded questions about the repo" width="100%" />
</p>

### 6. Revival Plan

<p align="center">
  <img src="assets/readme/screenshots/06-revival-plan.png" alt="AI-generated revival plan with diagnosis, architecture, and score" width="100%" />
</p>

### 7. Resurrection Bay

<p align="center">
  <img src="assets/readme/screenshots/07-resurrection-bay.png" alt="Resurrection Bay after committing a project to the archive" width="100%" />
</p>

## Before vs After

![Before and After](assets/readme/before-after.svg)

### Before

- static concept museum with four hardcoded rooms
- no live GitHub user analysis
- no real repo evidence
- no grounded Copilot interaction
- no execution handoff back into a repository

### After

- personalized museum for any GitHub username
- GitHub-grounded exhibit generation
- AI-generated autopsies and revival strategy
- Copilot Curator Q&A with fallback safety
- persistent Resurrection Bay
- GitHub Copilot Resurrection Kits for execution

## Architecture

![Architecture](assets/readme/architecture.svg)

High-level architecture:

- `React 19 + TypeScript + Vite` frontend
- `Tailwind CSS + shadcn/ui` component system
- `HTML5 Canvas` particles and CSS-driven museum transitions
- local Node AI server for structured OpenAI calls
- GitHub REST API ingestion and repo evidence enrichment
- Zod schema validation for museum, revival, and curator responses
- `localStorage` persistence for achievements, caches, Resurrection Bay, and shareable museum state

For a deep system walk-through, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Core Features

### Personalized Museum Generation

The museum asks for a GitHub username, fetches public repositories, filters forks, ranks the most abandoned repos, and transforms them into exhibits with:

- epitaphs
- causes of death
- artifact cards
- stats and timelines
- Copilot insights
- exhibit-specific tags and curator narrative

The exhibit content is grounded with live repo evidence such as:

- languages
- commit count
- last push date
- root file names
- README excerpt
- manifest snippets like `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, and more

### Copilot Curator

Every exhibit includes an interactive `Copilot Curator` panel that supports project-specific questions such as:

- Why did this repo probably die?
- What signals suggest the stack was incomplete?
- What would you fix first?
- Is there still market value here?

It first attempts a live structured answer through the AI server and falls back to grounded heuristics when needed.

### Revival Plans

Every project can open a six-part `Revival Plan`:

1. Diagnosis
2. Architecture Overhaul
3. Tech Stack 2026
4. Feature Additions
5. Go-to-Market
6. Resurrection Score

The plan is positioned as a CTO-style resurrection memo, not a superficial refactor checklist.

### Branded PDF Export

The Revival Plan can be exported as:

- Markdown for repo-native documentation
- a branded PDF that follows the museum visual language

The PDF is rendered from a dedicated styled document so the export feels like a premium product artifact, not a plain browser print.

### Resurrection Bay

Projects committed from a Revival Plan are saved into a persistent `Resurrection Bay`:

- the room unlocks in the museum hall
- the project stays there between sessions
- users can replay the "heaven gate" entrance sequence
- revival artifacts remain attached to that museum identity

### GitHub Copilot Resurrection Kits

Once a project reaches Resurrection Bay, the user can download a repo-ready Copilot kit.

![Copilot Kit](assets/readme/copilot-kit.svg)

Each kit contains:

- `.github/copilot-instructions.md`
- `.github/instructions/resurrection.instructions.md`
- `.github/skills/<project>-resurrection/SKILL.md`
- `AGENTS.md`
- `docs/revival-plan.md`
- `docs/resurrection-backlog.md`

This turns the museum from narrative into execution. The repo can be cloned, the kit dropped in, and GitHub Copilot can immediately start working from structured resurrection guidance.

## Why This Is Different

Most AI portfolio or repo-analysis tools stop at summarization.

Museum of Dead Dreams goes further:

- it converts analysis into an emotional, interactive product experience
- it does not just summarize code, it diagnoses product failure
- it creates a full revival strategy instead of a static report
- it preserves revived projects in an afterlife room
- it outputs GitHub Copilot assets so the "what next?" problem is actually solved

## ROI Framing

![ROI Dashboard](assets/readme/roi-dashboard.svg)

This product has value across several use cases:

- developers auditing dormant side projects
- startup teams reviewing failed experiments
- hackathon builders deciding what to resurrect
- engineering managers triaging inactive internal tools
- consultants assessing legacy prototypes for clients
- open-source maintainers deciding whether an abandoned tool should be rebooted

See [docs/ROI.md](./docs/ROI.md) for the longer framing.

## Reliability, Fallbacks, and Product Safety

The project is intentionally built to degrade gracefully instead of breaking:

- museum exhibit generation has offline fallback behavior
- revival plans switch to template fallback if live analysis stalls
- Copilot Curator has a grounded fallback response path
- schema validation happens server-side through Zod
- requests are cached aggressively to reduce duplicate cost
- username museum results are cached in `localStorage`
- revival and curator requests are deduplicated client-side

That matters because the product should feel resilient even when an AI dependency is slow or unavailable.

## Built with GitHub Copilot and Codex

This project is also an explicit story about AI-assisted finishing.

GitHub Copilot and Codex were used to help:

- evolve the product architecture
- refactor flows from static to dynamic GitHub-based analysis
- design the revival workflow
- harden fallbacks and persistence
- create README and launch documentation
- package repo-ready Copilot instructions and skills

This is documented transparently in [docs/COPILOT_JOURNEY.md](./docs/COPILOT_JOURNEY.md).

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS
- shadcn/ui
- lucide-react
- HTML5 Canvas API
- OpenAI SDK
- Zod
- GitHub REST API
- html2canvas
- jsPDF
- JSZip

## Quickstart

```bash
git clone https://github.com/jpablortiz96/Museum-of-Dead-Dreams.git
cd Museum-of-Dead-Dreams/app
npm install
cp .env.example .env.local
npm run dev
```

### Required Environment Variables

Create `app/.env.local`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MUSEUM_MODEL=gpt-5.4-mini
OPENAI_REVIVAL_MODEL=gpt-5.4-mini
OPENAI_CURATOR_MODEL=gpt-5.4-mini
REVIVAL_API_PORT=8787
VITE_GITHUB_TOKEN=github_pat_optional_for_higher_rate_limits
```

### Environment Variable Reference

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes for live AI | Enables museum exhibit generation, revival plans, and Copilot Curator |
| `OPENAI_MUSEUM_MODEL` | Optional | Model override for museum exhibit generation |
| `OPENAI_REVIVAL_MODEL` | Optional | Model override for revival plan generation |
| `OPENAI_CURATOR_MODEL` | Optional | Model override for curator answers |
| `REVIVAL_API_PORT` | Optional | Local AI server port |
| `VITE_GITHUB_TOKEN` | Optional | Raises GitHub API rate limits during development |
| `VITE_REVIVAL_API_BASE_URL` | Optional | External AI host instead of local Vite proxy |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the frontend and AI server together |
| `npm run dev:web` | Starts the Vite frontend only |
| `npm run dev:api` | Starts the local AI server only |
| `npm run build` | Runs TypeScript build and Vite production build |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Serves the production build locally |
| `npm run capture:readme -- <github-username>` | Captures the README screenshots from the live local app |

## Repository Layout

```text
.
|-- .github/
|-- assets/
|   `-- readme/
|-- docs/
|-- CONTEXT.md
|-- DEV_POST.md
|-- README.md
`-- app/
    |-- public/
    |-- server/
    |   |-- dev-api.mjs
    |   `-- revival-server.mjs
    `-- src/
        |-- components/
        |-- data/
        |-- services/
        |-- types/
        `-- utils/
```

## Documentation Index

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/BEFORE_AFTER.md](./docs/BEFORE_AFTER.md)
- [docs/COPILOT_JOURNEY.md](./docs/COPILOT_JOURNEY.md)
- [docs/ROI.md](./docs/ROI.md)
- [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md)
- [docs/SUBMISSION_CHECKLIST.md](./docs/SUBMISSION_CHECKLIST.md)
- [CONTEXT.md](./CONTEXT.md)

## Finish-Up-A-Thon Positioning

This project was intentionally pushed beyond a concept demo into a shippable narrative product:

- a clear "before vs after" completion story
- strong originality in metaphor and UX
- live GitHub grounding instead of fake placeholder data
- thoughtful fallback design for reliability
- a visible GitHub Copilot integration story
- concrete outputs that can be applied back to real repositories

## Roadmap

- real screenshot capture pipeline for the README gallery
- multi-user comparison mode between museum graveyards
- richer manifest and architecture evidence ingestion
- collaboration mode for team resurrection planning
- deeper GitHub Copilot agent distribution workflow

## Privacy and Scope

- only public GitHub repository data is analyzed
- no private repositories are fetched
- local cache is browser-scoped
- AI outputs are grounded with public repo evidence and validated before use

## License

This project is licensed under the [MIT License](./LICENSE).

## Credits

Built by Juan Pablo Enriquez Ortiz.

Tools and platforms used:

- GitHub REST API for repository discovery and evidence
- OpenAI API for structured generation
- GitHub Copilot for assisted product completion
- React, TypeScript, Vite, Tailwind, and shadcn/ui for the product experience
