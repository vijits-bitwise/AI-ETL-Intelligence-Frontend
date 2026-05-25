# Frontend Architecture

## Overview

A two-page Next.js 14 application that accepts an ETL incident report, submits it to the
AI backend, and renders a structured analysis dashboard. The app has no server-side logic —
it is a pure client-side consumer of the backend API.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.0.0 |
| Language | TypeScript | 5.0 |
| UI library | React | 18.2 |
| Styling | Tailwind CSS | 3.3 |
| HTTP client | `fetch` (browser native) | — |
| Temporary storage | `localStorage` | browser native |

No state management library. No form library. No CSS-in-JS. No component library.

---

## Directory Structure

```
AI-ETL-Intelligence-Frontend/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root HTML shell — sets <title> and imports globals.css
│   ├── page.tsx                # Route: / — renders IncidentForm
│   └── result/
│       └── page.tsx            # Route: /result — reads localStorage, renders ResultCard
│
├── components/                 # Reusable React components
│   ├── IncidentForm.tsx        # Form with 3 fields, POST to API, navigate to /result
│   ├── ResultCard.tsx          # Full dashboard renderer for AnalysisResponse
│   └── Loader.tsx              # Spinning animation, used during API call
│
├── utils/
│   └── api.ts                  # All TypeScript interfaces + analyzeIncident() fetch wrapper
│
├── styles/
│   └── globals.css             # Tailwind base/components/utilities directives
│
├── doc/                        # Integration contracts (not source docs)
│   ├── api-spec.yaml           # OpenAPI 3.0.3 — authoritative backend contract
│   └── GITHUB-SPECKIT.md       # Frontend integration spec (UI sections, component mapping)
│
├── docs/                       # Project documentation
│   ├── architecture.md         # This file
│   ├── constitution.md         # Project governing principles
│   ├── data-model.md           # TypeScript interface reference
│   ├── component-guide.md      # Component inventory and patterns
│   └── specs/                  # Feature specs (spec-driven workflow)
│       └── README.md
│
├── .claude/
│   └── commands/               # Claude Code slash commands
│       ├── analyze.md          # /analyze — generate spec
│       ├── implement.md        # /implement — implement spec
│       ├── review.md           # /review — compliance check
│       ├── generate-tests.md   # /generate-tests — Playwright tests
│       ├── constitution.md     # /constitution — view/update principles
│       ├── plan.md             # /plan — technical planning pass
│       └── taskstoissues.md    # /taskstoissues — tasks → GitHub issues
│
├── CLAUDE.md                   # Project overview for Claude Code
├── next.config.js              # Next.js config (reactStrictMode: true)
├── tailwind.config.js          # Tailwind content paths
├── tsconfig.json               # TypeScript strict mode, path alias @/*
└── package.json                # Dependencies and scripts
```

---

## Data Flow

```
Browser
  │
  ├─ GET /
  │     └── app/page.tsx
  │           └── <IncidentForm />
  │                 │ user fills: incident_no, short_description, long_description
  │                 │ user clicks "Analyze Incident"
  │                 │
  │                 ├─ POST http://127.0.0.1:8000/analyze-incident
  │                 │     └── utils/api.ts → analyzeIncident()
  │                 │           └── returns AnalysisResponse (JSON)
  │                 │
  │                 ├─ localStorage.setItem("incident-analysis-<timestamp>", JSON)
  │                 │
  │                 └─ router.push("/result?key=<key>&incident_no=...&short_description=...")
  │
  └─ GET /result?key=...
        └── app/result/page.tsx
              └── useEffect: localStorage.getItem(key) → parse → localStorage.removeItem(key)
                    └── <ResultCard data={parsedData} />
                          └── renders all 8 sections of AnalysisResponse
```

---

## Pages

### `/` — Home (app/page.tsx)

- Server component that renders `<IncidentForm />`.
- No props, no data fetching.
- Layout: `RootLayout` wraps it with `<html><body>`.

### `/result` — Results (app/result/page.tsx)

- Client component wrapped in `<Suspense>` (required because it calls `useSearchParams`).
- URL query params: `key` (localStorage key), `incident_no`, `short_description`.
- On mount: reads localStorage → parses `AnalysisResponse` → removes the key.
- On error: shows inline error card with "Go Back" link to `/`.
- On success: renders `<ResultCard data={...} />`.

---

## Components

### `IncidentForm` (components/IncidentForm.tsx)

**Responsibility**: Collect incident fields, validate, call API, navigate to results.

- `'use client'` — uses `useState`, `useRouter`
- State: `formData` (3 fields), `isLoading`, `error`
- On submit: validates all fields non-empty → calls `analyzeIncident()` → stores response → navigates
- Shows `<Loader />` while loading, error message on failure
- No knowledge of `AnalysisResponse` structure — only stores it

### `ResultCard` (components/ResultCard.tsx)

**Responsibility**: Render a complete `AnalysisResponse` as a dashboard.

- `'use client'` — uses `Link` for navigation
- Props: `{ data: AnalysisResponse }`
- Renders 8 sections: incident header, metadata cards, root cause analysis, resolution steps,
  validation checklist, escalation path, evidence sources, AI confidence score
- Helper functions (internal, not exported):
  - `cleanContent(value)` — strips `--` separator lines
  - `highlightText(text, terms)` — bold-highlights incident identifiers in prose
  - `parseInlineText(value, highlights)` — parses `**bold**` and `` `code` `` inline markdown
  - `renderProse(value, highlights)` — splits prose into `<p>` paragraphs
  - `getStatusLabel(priority, businessImpact)` — derives badge label (FAILED / AT RISK / IN REVIEW)
  - `getStatusStyles(priority, businessImpact)` — derives badge Tailwind colour classes

### `Loader` (components/Loader.tsx)

**Responsibility**: Show a spinner animation.
- No props.
- Used by `IncidentForm` during API call.

---

## API Client (utils/api.ts)

- `API_BASE_URL = 'http://127.0.0.1:8000'` — backend address (local dev only)
- `analyzeIncident(payload)` — `POST /analyze-incident`, returns `Promise<AnalysisResponse>`
- All TypeScript interfaces are exported from this file (see `docs/data-model.md`)

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Inter-page data passing | `localStorage` + URL query param (key) | API response is too large for URL; avoids a state management library |
| localStorage cleanup | Remove immediately after read | Prevents stale data accumulating across sessions |
| `<Suspense>` on result page | Required | `useSearchParams()` requires a Suspense boundary in Next.js App Router |
| No server components for result | Client component | `useSearchParams` and `localStorage` require browser APIs |
| Tailwind only | No custom CSS | Consistent, zero-specificity conflicts, rapid iteration |
| No component library | Plain HTML + Tailwind | Avoids dependency overhead for a single-purpose app |

---

## Backend Integration

The backend runs separately at `http://127.0.0.1:8000`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/analyze-incident` | POST | Submit incident, receive full analysis |
| `/status` | GET | Health check (used by integration tests) |

The frontend has no CORS proxy. Both services must run on the same machine during development.
For production, `API_BASE_URL` in `utils/api.ts` must be updated to the deployed backend URL.

---

## Local Development

```bash
# Terminal 1 — backend
uvicorn main:app --port 8000

# Terminal 2 — frontend
npm run dev          # → http://localhost:3000

# Lint
npm run lint

# Build check
npm run build
```
