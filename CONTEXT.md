# Museum of Dead Dreams - Full Technical Context

## 1. Project Snapshot

`Museum of Dead Dreams` is an interactive virtual museum of abandoned software projects.

Current version is no longer a static showcase with 4 hardcoded rooms. It is now a hybrid product with:

- a React 19 + TypeScript + Vite frontend
- a live GitHub ingestion pipeline for public repos
- a local AI server powered by OpenAI
- real AI-generated museum exhibits
- real AI-generated revival plans
- real AI-powered Copilot Curator Q&A per project
- a persistent `Resurrection Bay` archive
- downloadable GitHub Copilot resurrection kits
- branded PDF export for revival plans
- offline/template fallback paths when AI is unavailable

This file is the source-of-truth handoff document for another model or engineer.

## 2. Product Capabilities

The app currently supports all of the following:

1. User enters a GitHub username.
2. App fetches public repos from GitHub.
3. App filters forks and ranks repos by abandonment.
4. App collects grounded repo evidence:
   - languages
   - commit count
   - last commit SHA/message/date
   - root items
   - README excerpt
   - manifest snippets like `package.json`, `pyproject.toml`, `Cargo.toml`, etc.
5. App sends compact grounded repo context to the local AI server.
6. AI generates a personalized museum:
   - subtitle
   - epitaph
   - description
   - cause of death
   - artifacts
   - copilot insight
   - copilot epitaph
   - fun fact
   - revival context
   - founder context
7. User explores the hall, enters exhibits, reads epitaphs, and unlocks achievements.
8. Each exhibit has:
   - artifact cards
   - Copilot Curator panel
   - `View Revival Plan` CTA
9. Revival Plan is a slide-over with 6 sections:
   - Diagnosis
   - Architecture
   - Tech Stack
   - Features
   - Go-to-Market
   - Score
10. Revival Plan can be exported as:
    - Markdown copied to clipboard
    - branded PDF with the museum visual identity
11. Revival Plan can be committed into `Resurrection Bay`.
12. `Resurrection Bay` becomes a persistent archive for that museum.
13. Each resurrected project stores a downloadable `Copilot Resurrection Kit` with repo instructions, skill files, and docs.
14. Museums are shareable with `?user=<github-username>`.

## 3. Runtime Architecture

### 3.1 Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui primitives
- Canvas particles via HTML5 Canvas
- CSS animations for room transitions and Resurrection Bay entrance

### 3.2 AI / Backend

- local Node server in `app/server/revival-server.mjs`
- OpenAI SDK
- structured output validation with `zod`
- Vite dev proxy from `/api/*` to `127.0.0.1:8787`

### 3.3 Deployment posture

Right now the AI server is local-first for development.

The frontend expects either:

- Vite proxy to `/api`
- or `VITE_REVIVAL_API_BASE_URL` pointing to an external host

## 4. Root Structure

```text
D:\MUSEUM_OF_DEAD_DREAMS
├── CONTEXT.md
├── DEV_POST.md
└── app/
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    ├── components.json
    ├── server/
    │   ├── dev-api.mjs
    │   └── revival-server.mjs
    └── src/
        ├── App.tsx
        ├── App.css
        ├── index.css
        ├── main.tsx
        ├── vite-env.d.ts
        ├── components/
        ├── data/
        ├── hooks/
        ├── lib/
        ├── pages/
        ├── services/
        ├── types/
        └── utils/
```

## 5. Relevant Source Tree

```text
app/src/
├── App.tsx
├── App.css
├── index.css
├── main.tsx
├── components/
│   ├── AchievementPanel.tsx
│   ├── AchievementToast.tsx
│   ├── ExhibitRoom.tsx
│   ├── LoadingGraveyard.tsx
│   ├── MuseumHall.tsx
│   ├── ParticleCanvas.tsx
│   ├── ResurrectionBay.tsx
│   ├── RevivalButton.tsx
│   ├── RevivalReport.tsx
│   ├── RevivalReportPdfDocument.tsx
│   ├── RevivalSection.tsx
│   ├── ScoreVisualization.tsx
│   ├── TypewriterText.tsx
│   ├── WelcomeScreen.tsx
│   └── ui/
│       ├── sheet.tsx
│       ├── tabs.tsx
│       └── many other shadcn primitives
├── data/
│   └── exhibits.ts
├── hooks/
│   └── use-mobile.ts
├── lib/
│   └── utils.ts
├── pages/
│   └── Home.tsx
├── services/
│   ├── copilotCuratorApi.ts
│   ├── githubApi.ts
│   ├── museumApi.ts
│   └── revivalApi.ts
├── types/
│   ├── curator.ts
│   ├── github.ts
│   ├── museum.ts
│   ├── resurrection.ts
│   └── revival.ts
└── utils/
    ├── contentGenerator.ts
    ├── copilotResurrectionKit.ts
    ├── projectClassifier.ts
    ├── repoAnalyzer.ts
    ├── revivalPdf.ts
    └── revivalTemplates.ts
```

## 6. Core Product Flows

### 6.1 Navigation flow

There is no router.

`App.tsx` controls the whole app with:

- `welcome`
- `loading`
- `hall`
- `exhibit`
- `resurrection`

Flow:

```text
welcome
  -> loading
  -> hall
  -> exhibit
  -> revival-report slide-over
  -> commit to Resurrection Bay
  -> hall
  -> resurrection
```

### 6.2 Personalized museum flow

```text
WelcomeScreen
  -> handleUsernameSubmit()
  -> analyzeUserRepos(username)            [services/githubApi.ts]
  -> generateMuseumExhibits(username,repos)[services/museumApi.ts]
  -> MuseumHall receives dynamic exhibits
```

### 6.3 Revival Plan flow

```text
ExhibitRoom
  -> user clicks View Revival Plan
  -> RevivalReport opens
  -> loadRevivalReport(exhibit)            [services/revivalApi.ts]
  -> POST /api/revival-plan                [server/revival-server.mjs]
  -> AI report or fallback
  -> export markdown / export PDF
  -> commit to Resurrection Bay
```

### 6.4 Copilot Curator flow

```text
ExhibitRoom
  -> user opens Copilot Curator
  -> askCopilotCurator()
  -> POST /api/copilot-curator
  -> grounded answer + evidence + follow-ups
  -> cache answer by exhibit + question + short history
```

### 6.5 Resurrection Bay flow

```text
RevivalReport
  -> Commit To Resurrection Bay
  -> createResurrectedProjectRecord()
  -> save to modd-resurrection-bay-v1[currentMuseumKey]
  -> Resurrection Bay hall card unlocks

ResurrectionBay
  -> list resurrected projects for current museum
  -> Run Heaven Gate Protocol animation
  -> preview Copilot instructions patch
  -> copy/download individual kit files
  -> download zipped Copilot kit
```

## 7. Current Product Truths

1. No React Router.
2. Hall is data-driven and responsive.
3. Personalized museums are cached per username for 1 hour.
4. Revival plans are generated lazily when the panel opens.
5. Copilot Curator answers are generated lazily when the user asks.
6. AI output is schema-validated server-side.
7. The museum must stay functional when AI fails.
8. `Resurrection Bay` is not AI-generated as a normal exhibit. It is appended separately.
9. `Resurrection Bay` state is persisted per museum key.
10. `currentMuseumKey` is:
    - `github:<username>` for personalized museums
    - `curator-default` for the fallback/default museum

## 8. Main Entry Points

### `app/src/main.tsx`

Very small entrypoint:

- imports `index.css`
- renders `<App />` inside `StrictMode`

### `app/src/App.tsx`

This is the main orchestration layer.

Responsibilities:

- manages the active view
- manages username flow
- manages loading state and progress
- manages current exhibit slug
- manages hall data
- manages all achievement state
- manages share URL behavior
- manages `Resurrection Bay` persistence
- wires exhibit handlers into child components

### `app/server/revival-server.mjs`

This is the museum intelligence server.

Responsibilities:

- `/api/health`
- `/api/museum-exhibits`
- `/api/revival-plan`
- `/api/copilot-curator`
- in-memory response cache
- OpenAI calls
- prompt construction
- schema validation
- request logging

## 9. App State in `App.tsx`

Key React state:

- `currentView`
- `currentExhibitSlug`
- `githubUsername`
- `generatedExhibits`
- `loadingProgress`
- `loadingCurrentRepo`
- `loadingStageLabel`
- `loadingCompletedRepos`
- `loadingTotalRepos`
- `museumError`
- `isLoadingMuseum`
- `visitedExhibits`
- `readEpitaphs`
- `unlockedAchievements`
- `viewedRevivalPlans`
- `exportedRevivalPlans`
- `revivalScores`
- `resurrectionProjectsByMuseum`
- `foundSecret`
- `copilotChatted`
- `hasResurrected`
- `showAchievements`
- `currentToast`
- `showNavHint`

Derived state:

- `currentMuseumKey`
- `activeMuseumExhibits`
- `resurrectedProjects`
- `narrativeExhibits`
- `currentMuseumExhibitIds`
- `currentMuseumRevivalIds`
- `currentMuseumVisitedCount`
- `currentMuseumReadCount`
- `currentMuseumViewedRevivalCount`
- `totalResurrectedLoc`
- `totalResurrectedCommits`
- `resurrectionUnlocked`
- `hallExhibits`
- `currentExhibit`

## 10. `App.tsx` Function Map

### Storage helpers

- `readStoredRecord(key)`
- `readStoredArray(key, validIds?)`
- `readStoredResurrectionMap()`
- `updateShareableUrl(username)`
- `wait(delayMs)`
- `getErrorMessage(error)`

### Interaction handlers

- `checkAchievement(id)`
- `handleUsernameSubmit(username)`
- `handleEnterExhibit(slug)`
- `handleBackToHall()`
- `handleReadEpitaph(exhibitId)`
- `handleFindSecret()`
- `handleCopilotChat()`
- `handleResurrect()`
- `handleCommitToResurrectionBay({ exhibit, report })`
- `handleViewRevivalPlan({ exhibitId, overallScore })`
- `handleExportRevivalPlan({ exhibitId, overallScore })`
- `handleAnalyzeAnother()`
- `handleShareMuseum()`

### Important `handleUsernameSubmit()` behavior

It does all of this:

1. normalizes username
2. increments `activeRequestRef`
3. resets loading state
4. checks cached museum via `getCachedExhibits(username)`
5. if cached:
   - uses cached exhibits
   - sets hall view
   - updates `?user=...`
6. if not cached:
   - calls `analyzeUserRepos()`
   - receives progress callback updates
   - calls `generateMuseumExhibits()`
   - caches the result
   - updates `?user=...`
7. on failure:
   - returns to welcome
   - surfaces a friendly error

## 11. Data Model in `data/exhibits.ts`

### `Exhibit`

Fields:

- `id`
- `slug`
- `name`
- `subtitle`
- `status`
- `deathDate`
- `lastCommit`
- `epitaph`
- `description`
- `stats`
  - `linesOfCode`
  - `commits`
  - `daysAlive`
  - `causeOfDeath`
- `artifacts`
- `copilotInsight`
- `copilotEpitaph`
- `funFact`
- `tags`
- `revivalContext?`
- `founderContext?`
- `curatorContext?`
- `revivalScoreAdjustments?`
- `color`
- `accentColor`
- `unlocked`

### Static curator exhibits

Still present as the default museum:

- `CORTEX Trading`
- `Conforma-AI`
- `CodeSonify v1`

### Static resurrection exhibit

- `Resurrection Bay`

The `Resurrection Bay` exhibit object is dynamically transformed in `App.tsx` before being passed into `MuseumHall`.

That transformation updates:

- `unlocked`
- `subtitle`
- `description`
- `stats`
- `tags`

based on the current museum’s resurrected archive.

## 12. Achievements

Achievements are defined in `src/data/exhibits.ts`.

Current list:

- `first_visit`
- `personalize_graveyard`
- `visit_first_exhibit`
- `tour_the_graveyard`
- `read_all_epitaphs`
- `find_secret`
- `copilot_chat`
- `resurrect`
- `share_graveyard`
- `view_revival_plan`
- `export_revival_plan`
- `serial_resurrector`
- `surgeon`
- `miracle_worker`

Unlock logic is in `App.tsx`, not in `data/exhibits.ts`.

## 13. Frontend Components

### `WelcomeScreen.tsx`

Purpose:

- first screen
- GitHub username input
- input validation
- sample usernames
- branded intro copy

Props:

- `onSubmit(username)`
- `isLoading`
- `error`
- `initialUsername`

Validation:

- uses GitHub username regex
- blocks empty usernames

### `LoadingGraveyard.tsx`

Purpose:

- loading screen between `welcome` and `hall`
- shows stage label, repo list, progress, rotating tips

Props:

- `username`
- `progress`
- `currentRepo`
- `stageLabel`
- `completedRepos`
- `totalRepos`

### `MuseumHall.tsx`

Purpose:

- render museum hall grid
- render all exhibit cards
- render share CTA for personalized museums
- render analyze-another CTA

Important behavior:

- treats `resurrection` card specially
- shows `visited` marker
- respects `unlocked`
- computes hall totals:
  - repo exhibit count
  - total lines abandoned
  - total silent days

### `ExhibitRoom.tsx`

Purpose:

- render one exhibit room
- render epitaph, stats, story, cause of death, artifacts, fun fact
- render Copilot Curator panel
- render `View Revival Plan`

Important local state:

- `showContent`
- `epitaphRead`
- `showCopilotPanel`
- `showFunFact`
- `secretFound`
- `copilotChatDone`
- `showRevivalReport`
- `curatorMessages`
- `curatorQuestion`
- `curatorLoading`
- `curatorSuggestedQuestions`

Important behavior:

- clicking epitaph can unlock the secret achievement
- opening curator can unlock `copilot_chat`
- suggested curator questions are replaced by AI follow-ups
- curator state resets when `exhibit.id` changes

### `RevivalButton.tsx`

Purpose:

- glowing CTA
- entry point to revival plan

### `RevivalReport.tsx`

Purpose:

- slide-over for revival plan
- request AI plan or fallback
- export markdown
- export branded PDF
- commit to Resurrection Bay

Key features:

- uses `Sheet` and `Tabs`
- has section nav
- has AI/fallback badge
- has cache badge
- has progressive loading phases UI
- has hard panel deadline fallback
- has manual fallback button
- mounts hidden PDF document only after report loads

### `RevivalReportPdfDocument.tsx`

Purpose:

- offscreen branded HTML document used for PDF export

It includes:

- title page styling
- status badge
- score blocks
- diagnosis section
- architecture section
- stack table
- features
- go-to-market
- score bars
- field notes
- generated metadata

### `RevivalSection.tsx`

Purpose:

- reusable section wrapper used inside the revival report tabs

### `ScoreVisualization.tsx`

Purpose:

- animated bars for:
  - overall
  - codebase health
  - market opportunity
  - complexity
  - founder fit

### `ResurrectionBay.tsx`

Purpose:

- persistent archive room for resurrected projects
- replayable “heaven gate” ceremony
- display Copilot Resurrection Kit files

Key behavior:

- entrance animation runs on entry
- archive is scoped to current museum key
- each resurrected project is selectable
- `Run Heaven Gate Protocol` animates 4 protocol steps
- patch preview shows `.github/copilot-instructions.md`
- can:
  - download zip
  - copy file contents
  - download individual files

### `ParticleCanvas.tsx`

Purpose:

- ambient particle background

Implementation note:

- renders every second animation frame for performance

### `TypewriterText.tsx`

Purpose:

- typewriter animation for text

Supports:

- `speed`
- `onComplete`
- `startDelay`
- optional cursor

### `AchievementToast.tsx`

Purpose:

- transient unlocked-achievement toast with progress bar

### `AchievementPanel.tsx`

Purpose:

- full-screen achievements modal
- reads metadata from `data/exhibits.ts`
- displays locked/unlocked state

### `components/ui/*`

This folder contains generic shadcn/ui primitives.

Museum-specific usage is light. Most relevant currently:

- `sheet.tsx`
- `tabs.tsx`

The rest are generic scaffolding and should not be confused with the museum domain logic.

## 14. Services

### `services/githubApi.ts`

Purpose:

- talk to GitHub API
- enrich repo data
- handle retries and rate limit conditions
- cache personalized museums

Important internal functions:

- `getGitHubHeaders()`
- `sleep(delayMs)`
- `readErrorMessage(response)`
- `requestGitHub(input, init, retries?)`
- `normalizeText(value, maxChars)`
- `summarizeManifest(name, rawContent)`
- `getCommitCountFromLinkHeader(linkHeader)`
- `getRepoCommitSnapshot(owner, repo, defaultBranch)`
- `getRepoRootItems(owner, repo, defaultBranch)`
- `getRepoReadmeExcerpt(owner, repo, defaultBranch)`
- `getRepoManifestSnippets(owner, repo, defaultBranch)`
- `getCacheKey(username)`

Exported functions:

- `getUserRepos(username)`
- `getRepoLanguages(languagesUrl)`
- `getRepoCommitCount(owner, repo)`
- `analyzeUserRepos(username, onProgress?)`
- `getCachedExhibits(username)`
- `cacheExhibits(username, exhibits)`

Important collected evidence per repo:

- repo metadata
- primary and secondary languages
- days abandoned
- estimated LOC
- total commits
- last commit SHA
- last commit message
- last commit date
- root items
- README excerpt
- manifest snippets

Manifest candidates:

- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `Cargo.toml`
- `go.mod`
- `pom.xml`
- `build.gradle`
- `build.gradle.kts`
- `composer.json`
- `Gemfile`
- `mix.exs`
- `Package.swift`
- `Dockerfile`
- `docker-compose.yml`

Error type:

- `GitHubApiError`

Known error codes:

- `all_forks`
- `network`
- `no_public_repos`
- `not_found`
- `rate_limit`
- `request_failed`

Cache:

- `modd-user-{username}`
- TTL: 1 hour

### `services/museumApi.ts`

Purpose:

- call AI server for exhibit narration
- convert AI result into `Exhibit[]`
- fallback to local templates if needed

Important functions:

- `getApiUrl()`
- `getPrimaryLanguage(repo)`
- `createRepoContext(repo)`
- `readErrorMessage(response)`
- `appendResurrectionExhibit(exhibits)`
- `requestMuseumExhibits(username, repos)`

Exported:

- `generateMuseumExhibits(username, repos)`

Timeout:

- `REQUEST_TIMEOUT_MS = 20000`

### `services/revivalApi.ts`

Purpose:

- request a revival plan from AI server
- manage revival plan local cache
- dedupe inflight requests
- health-check AI server before asking for a plan
- fallback to local template engine

Important functions:

- `getApiUrl()`
- `getHealthUrl()`
- `getCacheKey(exhibit)`
- `createRevivalRequest(exhibit)`
- `readCachedReport(exhibit)`
- `cacheRevivalReport(exhibit, report)`
- `buildFallbackReport(exhibit, reason)`
- `readErrorMessage(response)`
- `isRevivalApiAvailable()`
- `requestRevivalReport(exhibit)`
- `getFallbackReason(error)`

Exported:

- `loadRevivalReport(exhibit)`

Local cache:

- prefix: `modd-revival-plan-v1`
- TTL: 24 hours

Timeouts:

- health: `1500ms`
- request: `8000ms`

### `services/copilotCuratorApi.ts`

Purpose:

- send exhibit-grounded Q&A prompts to AI server
- cache curator answers
- dedupe inflight requests
- fallback to local heuristics if the AI path fails

Important functions:

- `getApiUrl()`
- `hashValue(value)`
- `buildHistory(messages)`
- `createCuratorRequestExhibit(exhibit)`
- `getCacheKey(payload)`
- `readCachedReply(cacheKey)`
- `writeCachedReply(cacheKey, reply)`
- `buildFallbackReply(exhibit, question, fallbackReason)`
- `readErrorMessage(response)`
- `requestCuratorReply(payload)`
- `getFallbackReason(error)`

Exported:

- `askCopilotCurator({ exhibit, question, messages })`

Local cache:

- prefix: `modd-curator-chat-v1`
- TTL: 24 hours

Timeout:

- `REQUEST_TIMEOUT_MS = 12000`

## 15. Types

### `types/github.ts`

Defines:

- `GitHubRepo`
- `GitHubLanguage`
- `GitHubCommit`
- `GitHubRootItem`
- `RepoManifestSnippet`
- `CommitSnapshot`
- `AnalyzedRepo`
- `AnalyzeProgress`

### `types/museum.ts`

Defines:

- `MuseumArtifactIcon`
- `MuseumArtifactContent`
- `MuseumRepoContext`
- `MuseumExhibitContent`

### `types/revival.ts`

Defines:

- `RevivalFeature`
- `TechStackComparison`
- `RevivalReportMeta`
- `RevivalArtifactSummary`
- `RevivalPlanRequestExhibit`
- `RevivalReport`

### `types/curator.ts`

Defines:

- `CuratorExhibitContext`
- `CuratorChatMessage`
- `CuratorReplyMeta`
- `CuratorChatRequestExhibit`
- `CuratorChatPayload`
- `CuratorReply`

### `types/resurrection.ts`

Defines:

- `CopilotKitFile`
- `CopilotResurrectionKit`
- `ResurrectedProjectRecord`

## 16. Utils

### `utils/repoAnalyzer.ts`

Exported:

- `calculateDaysAbandoned(pushedAt)`
- `rankReposByAbandonment(repos)`
- `selectMostAbandonedRepos(repos)`

Purpose:

- simple selection and ranking logic for abandonment

### `utils/projectClassifier.ts`

Purpose:

- detect project type from exhibit signals

Key functions:

- `normalizeSignals(exhibit)`
- `detectProjectType(exhibit)`

Detected project families:

- `trading`
- `ai-ml`
- `web-app`
- `mobile`
- `open-source-tool`

### `utils/contentGenerator.ts`

Purpose:

- museum fallback text generation
- conversion from AI exhibit content to `Exhibit`

Important functions:

- `generateSubtitle(repo)`
- `generateEpitaph(repo)`
- `generateCauseOfDeath(repo)`
- `generateCopilotInsight(repo)`
- `generateCopilotEpitaph(repo)`
- `generateArtifacts(repo)`
- `buildExhibitFromGeneratedContent(repo, content)`
- `generateExhibitFromRepo(repo)`
- `generateExhibitsFromAnalyzedRepos(repos)`

Important non-exported helpers:

- deterministic hashing / pick helpers
- artifact template routing by repo kind
- palette selection
- `generateDescription(repo)`
- `generateFunFact(repo)`
- `generateTags(repo)`

Important note:

Even when AI generation is used, this file still matters because it:

- builds fallback exhibits
- converts museum AI output into the final `Exhibit` domain model

### `utils/revivalTemplates.ts`

Purpose:

- full offline fallback for revival plans
- markdown export

Key functions:

- `generateRevivalReport(exhibit)`
- `exportAsMarkdown(exhibit, report)`

Also contains:

- project-type template packs
- score calculations
- deterministic option picking
- before/after architecture generators

### `utils/revivalPdf.ts`

Purpose:

- export branded PDF from hidden HTML document

Functions:

- `sanitizeFileSegment(value)`
- `buildFileName(exhibit)`
- `waitForDocumentPaint()`
- `exportRevivalPlanPdf({ element, exhibit })`

Implementation note:

- lazy-loads `html2canvas` and `jspdf`
- slices a long rendered image into A4 pages

### `utils/copilotResurrectionKit.ts`

Purpose:

- generate repository-ready GitHub Copilot guidance files
- convert a committed revival into a persisted archive record
- package zip downloads

Important functions:

- `generateCopilotResurrectionKit(exhibit, report)`
- `createResurrectedProjectRecord(exhibit, report, museumKey)`
- `downloadCopilotKitFile(file)`
- `downloadCopilotKitArchive(record)`

Generated files per resurrected project:

- `.github/copilot-instructions.md`
- `AGENTS.md`
- `.github/instructions/resurrection.instructions.md`
- `.github/skills/<slug>-resurrection/SKILL.md`
- `docs/revival-plan.md`
- `docs/resurrection-backlog.md`

## 17. AI Server

### File

`app/server/revival-server.mjs`

### Prompt versions

- `openai-museum-v1`
- `openai-revival-v1`
- `openai-curator-v1`

### Model resolution

Museum model:

- `OPENAI_MUSEUM_MODEL`
- fallback to `OPENAI_REVIVAL_MODEL`
- fallback default `gpt-5.4-mini`

Revival model:

- `OPENAI_REVIVAL_MODEL`
- fallback to `OPENAI_MUSEUM_MODEL`
- fallback default `gpt-5.4-mini`

Curator model:

- `OPENAI_CURATOR_MODEL`
- fallback to `OPENAI_REVIVAL_MODEL`
- fallback to `OPENAI_MUSEUM_MODEL`
- fallback default `gpt-5.4-mini`

### Schemas inside the server

Museum:

- `artifactIconSchema`
- `museumArtifactSchema`
- `museumRepoSchema`
- `museumRequestSchema`
- `museumExhibitSchema`
- `museumResponseSchema`

Revival:

- `revivalArtifactSchema`
- `revivalRequestSchema`
- `featureSchema`
- `reportSchema`

Curator:

- `curatorContextSchema`
- `curatorRequestSchema`
- `curatorReplySchema`

### Prompt builders

- `buildMuseumMessages(username, repos)`
- `buildRevivalMessages(exhibit)`
- `buildCuratorMessages(exhibit, question, history)`

### AI generation functions

- `generateMuseumExhibits(username, repos)`
- `generateRevivalReport(exhibit)`
- `generateCuratorReply(exhibit, question, history)`

### HTTP endpoints

#### `GET /api/health`

Returns:

- `ok`
- `openaiConfigured`
- `models`
  - `museum`
  - `revival`
  - `curator`
- `promptVersions`
  - `museum`
  - `revival`
  - `curator`

#### `POST /api/museum-exhibits`

Input:

- `username`
- `repos: MuseumRepoContext[]`

Output:

- `exhibits: MuseumExhibitContent[]`

#### `POST /api/revival-plan`

Input:

- `exhibit: RevivalPlanRequestExhibit`

Output:

- `report: RevivalReport`

#### `POST /api/copilot-curator`

Input:

- `exhibit: CuratorChatRequestExhibit`
- `question`
- `history`

Output:

- `reply: CuratorReply`

### Server caching

In-memory only, process-local.

Used for:

- museum exhibit responses
- revival reports
- curator answers

### Logging

The server logs with request-scoped tags like:

- `[museum#1]`
- `[revival#2]`
- `[curator#3]`
- `[health]`

Used heavily for debugging stalled generation.

## 18. Dev API Wrapper

### `app/server/dev-api.mjs`

Purpose:

- improve local development reliability
- if an existing API server is already responding on `REVIVAL_API_PORT`, kill it and restart it so logs attach to the current terminal

Main responsibilities:

- `canReuseExistingServer()`
- `killExistingServer()`
- `startServer()`

This matters because `npm run dev` expects logs for `museum`, `revival`, and `curator` requests to appear in the same terminal session.

## 19. Vite Config

### `app/vite.config.ts`

Current settings:

- `base: "./"`
- plugins:
  - `inspectAttr()` from `kimi-plugin-inspect-react`
  - `react()`
- dev server port: `3000`
- proxy:
  - `"/api"` -> `http://127.0.0.1:8787`
- alias:
  - `@` -> `./src`

## 20. Environment Variables

### Frontend / client-readable

Defined in `.env.local` when needed:

- `VITE_GITHUB_TOKEN`
- `VITE_REVIVAL_API_BASE_URL`

Note:

`VITE_*` vars are exposed to the client bundle. `VITE_GITHUB_TOKEN` is acceptable for local/dev rate-limit relief, but not ideal for a public production deployment.

### Server

Defined in `.env.local`:

- `OPENAI_API_KEY`
- `OPENAI_MUSEUM_MODEL`
- `OPENAI_REVIVAL_MODEL`
- `OPENAI_CURATOR_MODEL`
- `REVIVAL_API_PORT`

### `.env.example`

Current example file contains:

```env
VITE_GITHUB_TOKEN=
OPENAI_API_KEY=
OPENAI_MUSEUM_MODEL=gpt-5.4-mini
OPENAI_REVIVAL_MODEL=gpt-5.4-mini
OPENAI_CURATOR_MODEL=gpt-5.4-mini
REVIVAL_API_PORT=8787
VITE_REVIVAL_API_BASE_URL=
```

## 21. Package Scripts

From `app/package.json`:

- `npm run dev`
  - starts web + API together via `concurrently`
- `npm run dev:web`
  - starts only Vite frontend
- `npm run dev:api`
  - starts only local museum intelligence server through `server/dev-api.mjs`
- `npm run dev:full`
  - alias to `dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## 22. Persistence and Caching

### localStorage keys

Current keys in use:

- `modd-visited`
- `modd-epitaphs`
- `modd-achievements`
- `modd-revival-viewed`
- `modd-revival-exported`
- `modd-revival-scores`
- `modd-secret`
- `modd-copilot`
- `modd-resurrect`
- `modd-resurrection-bay-v1`
- `modd-user-{username}`
- `modd-revival-plan-v1:<exhibit-specific-suffix>`
- `modd-curator-chat-v1:<question-specific-suffix>`

### What each stores

- `modd-visited`
  - visited exhibit IDs
- `modd-epitaphs`
  - read epitaph exhibit IDs
- `modd-achievements`
  - unlocked achievement IDs
- `modd-revival-viewed`
  - exhibit IDs whose revival plan was opened
- `modd-revival-exported`
  - exhibit IDs whose plan was exported
- `modd-revival-scores`
  - score map by exhibit ID
- `modd-secret`
  - whether easter egg was found
- `modd-copilot`
  - whether curator chat was opened
- `modd-resurrect`
  - whether resurrection was witnessed at least once
- `modd-resurrection-bay-v1`
  - `Record<string, ResurrectedProjectRecord[]>`
  - key is `currentMuseumKey`
- `modd-user-{username}`
  - personalized museum exhibits cache
- revival plan cache
  - one plan per exhibit/version
- curator cache
  - one answer per exhibit + question + short history

### TTLs

- museum cache: 1 hour
- revival plan cache: 24 hours
- curator reply cache: 24 hours
- server in-memory cache: until API process restart

## 23. Share URL Behavior

The app supports:

```text
http://localhost:3000/?user=octocat
```

Behavior:

1. `App.tsx` reads `window.location.search`
2. if `user` exists, it auto-runs `handleUsernameSubmit(user)`
3. after a successful analysis, the app keeps `?user=...`
4. `handleAnalyzeAnother()` clears the query param

The hall share CTA opens Twitter/X intent with a pre-filled message.

## 24. AI vs Fallback Matrix

### Museum exhibit generation

Primary:

- OpenAI via `/api/museum-exhibits`

Fallback:

- `generateExhibitsFromAnalyzedRepos()` in `contentGenerator.ts`

### Revival plan generation

Primary:

- OpenAI via `/api/revival-plan`

Fallback:

- `generateRevivalReport()` in `revivalTemplates.ts`

### Copilot Curator Q&A

Primary:

- OpenAI via `/api/copilot-curator`

Fallback:

- `buildFallbackReply()` in `copilotCuratorApi.ts`

## 25. Timeouts and Failure Handling

### Museum API

- request timeout: `20s`

### Revival API

- health timeout: `1.5s`
- request timeout: `8s`
- panel hard UI deadline: `8s`
- manual fallback button available in UI

### Curator API

- request timeout: `12s`

### GitHub analysis

Uses retry-aware request helper and progress updates.

Handled scenarios include:

- missing user
- no public repos
- all forks
- network failure
- rate limit
- malformed responses

## 26. Resurrection Bay Specifics

`Resurrection Bay` is no longer a placeholder.

It is now a fully active archive layer with:

- dynamic hall unlock state
- per-museum persistence
- project selection
- replayable resurrection animation protocol
- Copilot patch preview
- downloadable/copiable Copilot kit

Protocol steps currently simulated:

- `Autopsy Recall`
- `Blueprint Rewrite`
- `Copilot Skill Imprint`
- `Launch Readiness`

The Copilot patch preview during/after the protocol is based on the generated `.github/copilot-instructions.md`.

## 27. Copilot Resurrection Kit Details

Each committed project stores a `CopilotResurrectionKit`.

The kit is intended to be dropped into a real repo so GitHub Copilot can act on the revival strategy.

Included files:

1. `.github/copilot-instructions.md`
2. `AGENTS.md`
3. `.github/instructions/resurrection.instructions.md`
4. `.github/skills/<project>-resurrection/SKILL.md`
5. `docs/revival-plan.md`
6. `docs/resurrection-backlog.md`

Quickstart shown in the UI:

1. unzip kit into repo root
2. commit the instruction files
3. open Copilot Chat / agent mode
4. start with the must-have lane in `docs/resurrection-backlog.md`

## 28. Copilot Curator Details

The old placeholder panel has been replaced.

Current curator behavior:

- user can ask free-form questions
- request includes:
  - exhibit narrative data
  - stats
  - artifacts
  - tags
  - `revivalContext`
  - `founderContext`
  - `curatorContext`
  - short rolling chat history
- response includes:
  - answer
  - evidence list
  - suggested follow-ups
  - metadata:
    - source
    - model
    - generatedAt
    - cached
    - promptVersion
    - fallbackReason

UI includes:

- suggested question chips
- message history
- AI/fallback badge
- evidence cards
- loading state

## 29. PDF Export Details

The PDF export is branded and not a plain browser printout.

Pipeline:

1. `RevivalReportPdfDocument.tsx` renders hidden branded HTML
2. `revivalPdf.ts` waits for fonts and paint
3. `html2canvas` captures the document
4. `jspdf` paginates the long image into A4 pages
5. file is saved as:
   - `museum-of-dead-dreams-revival-<slug>.pdf`

## 30. Styling and Visual Rules

### Fonts

- display: `Cinzel`
- body: `Inter`
- mono: `JetBrains Mono`

### Status colors

- `dead` -> red
- `zombie` -> purple
- `mummified` -> amber
- `buried` -> blue

### Icon rule

Never use emoji.

Use `lucide-react` only.

If adding a new icon, update the relevant icon map.

Known icon maps:

- `MuseumHall.tsx`
- `ExhibitRoom.tsx`
- `AchievementPanel.tsx`

### Existing reusable CSS classes

- `.card-hover`
- `.artifact-card`
- `.btn-museum`
- `.btn-museum-primary`
- `.glow-text`
- `.glow-text-red`
- `.fade-in-up`
- `.stagger-N`
- `.museum-input`
- `.copilot-panel`
- `.divider-glow`

### Important custom animations in `index.css`

Includes museum transitions plus Resurrection Bay specific animations:

- `pulse-glow`
- room transition effects
- heaven-door entrance effects
- `heavenDoorLeftOpen`
- `heavenDoorRightOpen`
- `heavenGlowRise`

Related classes:

- `.heaven-door-left`
- `.heaven-door-right`
- `.heaven-door-glow`

## 31. Non-Core / Secondary Files

These exist but are not central to the live museum flow:

- `src/App.css`
- `src/pages/Home.tsx`
- `src/hooks/use-mobile.ts`
- `src/lib/utils.ts`
- many `src/components/ui/*` files

They should not be treated as the primary product surface unless a task explicitly touches them.

## 32. Dependencies Worth Remembering

Non-obvious important runtime dependencies:

- `openai`
- `zod`
- `lucide-react`
- `html2canvas`
- `jspdf`
- `jszip`
- `@radix-ui/*`
- `tailwindcss`
- `concurrently`
- `kimi-plugin-inspect-react`

## 33. Where To Modify Things

### Change repo selection logic

Edit:

- `src/utils/repoAnalyzer.ts`

### Change what GitHub evidence is recovered

Edit:

- `src/services/githubApi.ts`

### Change museum exhibit AI behavior

Edit:

- `buildMuseumMessages()` in `server/revival-server.mjs`

### Change revival AI behavior

Edit:

- `buildRevivalMessages()` in `server/revival-server.mjs`
- `src/services/revivalApi.ts`
- `src/utils/revivalTemplates.ts`

### Change curator AI behavior

Edit:

- `buildCuratorMessages()` in `server/revival-server.mjs`
- `src/services/copilotCuratorApi.ts`
- `src/components/ExhibitRoom.tsx`

### Change fallback exhibit writing

Edit:

- `src/utils/contentGenerator.ts`

### Change fallback revival writing

Edit:

- `src/utils/revivalTemplates.ts`

### Change hall rendering

Edit:

- `src/components/MuseumHall.tsx`
- `src/App.tsx`

### Change exhibit room rendering

Edit:

- `src/components/ExhibitRoom.tsx`

### Change revival panel UI

Edit:

- `src/components/RevivalReport.tsx`
- `src/components/RevivalSection.tsx`
- `src/components/ScoreVisualization.tsx`

### Change branded PDF

Edit:

- `src/components/RevivalReportPdfDocument.tsx`
- `src/utils/revivalPdf.ts`

### Change Resurrection Bay behavior

Edit:

- `src/components/ResurrectionBay.tsx`
- `src/utils/copilotResurrectionKit.ts`
- `src/types/resurrection.ts`
- `src/App.tsx`

### Change static fallback curator exhibits

Edit:

- `src/data/exhibits.ts`

### Change loading screen copy and behavior

Edit:

- `src/components/LoadingGraveyard.tsx`

## 34. Build and Run

### Full stack

```powershell
cd D:\MUSEUM_OF_DEAD_DREAMS\app
npm run dev
```

### Frontend only

```powershell
cd D:\MUSEUM_OF_DEAD_DREAMS\app
npm run dev:web
```

### API only

```powershell
cd D:\MUSEUM_OF_DEAD_DREAMS\app
npm run dev:api
```

### Build

```powershell
cd D:\MUSEUM_OF_DEAD_DREAMS\app
npm run build
```

## 35. Recommended Reading Order For Another Model

If another model needs to continue work, read in this order:

1. `CONTEXT.md`
2. `app/src/App.tsx`
3. `app/src/data/exhibits.ts`
4. `app/src/services/githubApi.ts`
5. `app/src/services/museumApi.ts`
6. `app/src/services/revivalApi.ts`
7. `app/src/services/copilotCuratorApi.ts`
8. `app/server/revival-server.mjs`
9. `app/src/components/ExhibitRoom.tsx`
10. `app/src/components/RevivalReport.tsx`
11. `app/src/components/ResurrectionBay.tsx`
12. `app/src/utils/copilotResurrectionKit.ts`

## 36. Non-Negotiable Rules For Future Changes

1. Do not introduce React Router unless the whole app architecture is intentionally changed.
2. Keep the AI fallback paths working.
3. Keep `Resurrection Bay` scoped per museum key.
4. Do not remove query-param sharing.
5. Do not replace lucide icons with emojis.
6. If new icons are added, update the corresponding icon map.
7. Preserve branded PDF export unless deliberately replaced.
8. Preserve Copilot kit generation unless deliberately re-architected.
9. If changing AI prompts, keep outputs schema-compatible or update both server schema and client types.
10. Run `npm run build` after changes.

## 37. Current High-Level Summary

This project is currently a full-stack local museum experience with four major systems working together:

1. GitHub repo ingestion and grounding
2. AI-generated museum narration
3. AI-generated revival strategy + branded exports
4. persistent afterlife archive + GitHub Copilot execution kit

It is no longer a static front-end art piece. It is now a personalized AI product with:

- real repo analysis
- real per-project Q&A
- real revival planning
- real repo-ready Copilot guidance output

