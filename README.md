# Museum of Dead Dreams

> An AI-powered museum that turns abandoned GitHub repos into exhibits, revival plans, Copilot kits, and second chances.

[![React](https://img.shields.io/badge/React-19-111827?logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-111827?logo=typescript&logoColor=3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-111827?logo=vite&logoColor=646cff)](https://vite.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Structured%20Generation-111827?logo=openai&logoColor=10a37f)](https://platform.openai.com/)
[![GitHub API](https://img.shields.io/badge/GitHub-Public%20Repo%20Analysis-111827?logo=github&logoColor=white)](https://docs.github.com/en/rest)
[![Copilot Ready](https://img.shields.io/badge/GitHub%20Copilot-Resurrection%20Kits-111827?logo=githubcopilot&logoColor=white)](https://github.com/features/copilot)
[![PDF Export](https://img.shields.io/badge/Export-Branded%20PDF-111827?logo=adobeacrobatreader&logoColor=ef4444)](#revival-plans)
[![Local First](https://img.shields.io/badge/Local--first-AI%20Server-111827?logo=serverfault&logoColor=93c5fd)](#quickstart)

## Links

- Live Demo: [Museum of Dead Dreams](https://osiam2phyuryk.kimi.page)
- Repository: [jpablortiz96/Museum-of-Dead-Dreams](https://github.com/jpablortiz96/Museum-of-Dead-Dreams)
- Challenge: [GitHub Finish-Up-A-Thon 2026](https://dev.to/challenges/github-2026-05-21)

## The Problem

Millions of projects die quietly on GitHub.

Not because the original idea was always bad, but because side projects, hackathon builds, prototypes, and internal tools often lose momentum before they become useful products. When that happens, the code is not the only thing that gets abandoned. Product insight, technical experiments, failed assumptions, and future opportunities disappear with it.

`Museum of Dead Dreams` turns that graveyard into something inspectable, memorable, and actionable.

## The Solution

Instead of showing a dead repository as a static list of files, this project transforms abandoned public repos into a personalized interactive museum:

- AI-generated exhibit rooms
- cause-of-death analysis
- grounded Copilot Curator Q&A
- six-part revival plans
- branded PDF export
- persistent `Resurrection Bay`
- downloadable GitHub Copilot resurrection kits

The result is not just documentation. It is a developer-facing revival workflow.

## Why It Matters

This is useful for:

- developers with abandoned side projects
- hackathon builders with promising but unfinished prototypes
- startup teams auditing old experiments
- engineering managers reviewing dormant internal tools
- open-source maintainers triaging forgotten repos
- anyone who wants to turn a repo graveyard into an actionable roadmap

## Before / After

| Before | After |
| --- | --- |
| Static 4-room concept | Personalized museum per GitHub username |
| Hardcoded exhibits | Live GitHub repo analysis |
| No real repo grounding | README, manifest, languages, commit, and root-file evidence |
| No AI autopsy engine | OpenAI-powered exhibit generation |
| No live Q&A | Copilot Curator per project |
| No revival workflow | 6-section Revival Plan engine |
| No reusable output | Markdown + branded PDF export |
| No execution layer | Downloadable GitHub Copilot resurrection kits |
| No persistent afterlife | `Resurrection Bay` archive per museum |
| No shareable identity | `?user=<username>` museum URLs |

## Product Demo Flow

1. Enter a GitHub username.
2. Watch the Graveyard Scanner analyze public repos.
3. Explore AI-generated exhibits for the most abandoned projects.
4. Ask the Copilot Curator grounded questions about each repo.
5. Open a Revival Plan with diagnosis, architecture, tech stack, features, GTM, and score.
6. Export the plan as Markdown or a branded PDF.
7. Commit the project into `Resurrection Bay`.
8. Download a GitHub Copilot Resurrection Kit.
9. Apply the kit to a real repository and continue the rebuild.

## How It Works

```text
GitHub Username
    -> GitHub API ingestion
    -> Repo evidence collector
    -> Local AI server
        -> Museum exhibit generator
        -> Revival Plan generator
        -> Copilot Curator Q&A
    -> Frontend museum experience
    -> Resurrection Bay persistence
    -> Copilot Resurrection Kit export
```

## Core Features

### Personalized Museum Generation

The app fetches public repos, filters forks, ranks them by abandonment, enriches them with grounded evidence, and generates museum-ready narrative exhibits.

### Copilot Curator

Every exhibit includes a Q&A panel where users can ask grounded questions like:

- Why did this repo probably die?
- What stack clues do you see here?
- What would you fix first?

### Revival Plans

Each project can open a six-part `Revival Plan`:

- Diagnosis
- Architecture Overhaul
- Tech Stack 2026
- Feature Additions
- Go-to-Market
- Resurrection Score

### Branded PDF Export

Revival plans are exportable as a branded PDF rendered from a hidden, styled HTML document with the same visual language as the museum.

### Resurrection Bay

Revived projects are saved into a persistent archive room. From there, users can replay the resurrection sequence, preview generated Copilot instructions, and download a full Copilot kit.

### GitHub Copilot Resurrection Kits

Each resurrected project can generate:

- `.github/copilot-instructions.md`
- `AGENTS.md`
- `.github/instructions/resurrection.instructions.md`
- `.github/skills/<project>-resurrection/SKILL.md`
- `docs/revival-plan.md`
- `docs/resurrection-backlog.md`

This turns the museum from a storytelling layer into an execution layer.

## Technical Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- GitHub REST API
- OpenAI SDK
- Zod structured validation
- local Node AI server
- HTML5 Canvas API for particles
- `html2canvas` + `jspdf` for branded PDF export
- `jszip` for Copilot kit packaging

## Reliability and Fallbacks

The product is designed to degrade gracefully.

- If museum exhibit generation fails, it falls back to local template generation.
- If the revival-plan request fails or times out, it falls back to the offline revival engine.
- If Copilot Curator fails, it returns a grounded local heuristic answer instead of breaking the panel.
- AI outputs are schema-validated server-side.
- museum, revival, and curator responses are cached.
- personalized museum generation is cached by username.

This is important: the UX should not collapse just because one AI request fails.

## GitHub Copilot Angle

This project does not use AI only for writing text.

It uses AI to:

- narrate abandoned repositories
- generate structured revival strategies
- answer repo-specific questions through Copilot Curator
- produce repo-ready GitHub Copilot guidance files

### How GitHub Copilot helped finish this project

GitHub Copilot and Codex were used to help move the project from a static concept into a full-stack product. They were especially useful for:

- architecture inspection
- flow refactoring
- fallback hardening
- documentation generation
- README and launch prep
- UI iteration
- Copilot kit generation design

This is not presented as "Copilot wrote everything." It is presented honestly: Copilot helped accelerate the completion arc and product polish.

## Quickstart

```bash
cd app
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes for live AI | Enables museum exhibit generation, revival plans, and Copilot Curator |
| `OPENAI_MUSEUM_MODEL` | Optional | Model override for exhibit generation |
| `OPENAI_REVIVAL_MODEL` | Optional | Model override for revival plans |
| `OPENAI_CURATOR_MODEL` | Optional | Model override for Copilot Curator |
| `REVIVAL_API_PORT` | Optional | Local AI server port |
| `VITE_GITHUB_TOKEN` | Optional | Raises GitHub API rate limits during development |
| `VITE_REVIVAL_API_BASE_URL` | Optional | External API host instead of Vite proxy |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts frontend and local AI server together |
| `npm run dev:web` | Starts Vite frontend only |
| `npm run dev:api` | Starts local AI server only |
| `npm run build` | Runs TypeScript build and Vite production build |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Serves production build locally |

## Repository Structure

```text
.
|-- CONTEXT.md
|-- DEV_POST.md
|-- README.md
`-- app/
    |-- server/
    |   |-- dev-api.mjs
    |   `-- revival-server.mjs
    `-- src/
        |-- App.tsx
        |-- components/
        |-- data/
        |-- services/
        |-- types/
        `-- utils/
```

## Built for GitHub Finish-Up-A-Thon 2026

This repo is intentionally positioned around the challenge's strongest dimensions:

- underlying technology
- usability and UX
- originality and creativity
- a visible completion arc
- a strong "before / after" story
- transparent GitHub Copilot usage

This is not just a polished demo. It is a finished product direction built on top of abandoned code.

## Privacy and Scope

- Only public GitHub repository data is analyzed.
- No private repos are fetched.
- Generated outputs are based on public metadata plus recovered grounded evidence such as README excerpts, root items, and manifest snippets.

## Credits

Built by Juan Pablo Enriquez Ortiz / Eduky.

AI-assisted development disclosure:

- GitHub API for repo analysis
- OpenAI API for structured generation
- GitHub Copilot / Codex for product completion support
