# AI ETL Intelligence — Frontend

Next.js 14 TypeScript frontend for the AI-powered ETL Incident Analysis System.
Displays AI-generated incident analysis from the backend API at `http://127.0.0.1:8000`.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Runtime**: Node.js

## Key Files

| File | Purpose |
|------|---------|
| `utils/api.ts` | TypeScript interfaces and `analyzeIncident()` fetch client |
| `components/IncidentForm.tsx` | Form — submits incident to `POST /analyze-incident` |
| `components/ResultCard.tsx` | Renders full `AnalysisResponse` as a dashboard |
| `components/Loader.tsx` | Loading spinner |
| `app/page.tsx` | Homepage — renders `IncidentForm` |
| `app/result/page.tsx` | Results page — reads localStorage, renders `ResultCard` |
| `app/layout.tsx` | Root layout with metadata |
| `doc/api-spec.yaml` | OpenAPI 3.0.3 backend contract (source of truth for data shapes) |
| `doc/GITHUB-SPECKIT.md` | Frontend integration spec — UI sections, component mapping |

## API Contract

- **Base URL**: `http://127.0.0.1:8000`
- **Endpoint**: `POST /analyze-incident`
- **Request**: `{ incident_no, short_description, long_description }`
- **Response**: `AnalysisResponse` (see `utils/api.ts` for all interfaces)

`doc/api-spec.yaml` is the authoritative contract. All TypeScript interfaces in `utils/api.ts`
must mirror it exactly.

## Result Flow

1. `IncidentForm` POSTs to the backend and stores the response in `localStorage`
2. Navigates to `/result?key=<storageKey>&incident_no=...`
3. `app/result/page.tsx` reads localStorage and passes data to `ResultCard`
4. `ResultCard` renders all sections: incident info, root cause, resolution steps,
   validation checklist, prevention, escalation path, references, confidence scorecard

## Dev Commands

```bash
npm run dev    # Start dev server at http://localhost:3000
npm run build  # Production build
npm run lint   # ESLint
```

---

## Spec-Driven Development

All feature work follows the **SpecKit workflow**. No code is written without an approved spec.

### Commands

| Command | When to run |
|---------|-------------|
| `/analyze "<requirement>"` | For any new feature or bug fix — generates spec + GitHub issue |
| `/implement "docs/specs/N-slug.md"` | After spec is APPROVED — creates branch, implements changes |
| `/review "docs/specs/N-slug.md"` | After implementation, before raising PR |
| `/generate-tests "docs/specs/N-slug.md"` | Anytime after spec is APPROVED |

### Workflow

```
/analyze → human approves → GitHub issue created → spec committed to main

/implement → branch speckit/<N>-<slug> created → files in spec Section I changed

/review → PASS/FAIL per section → human raises PR → merge to main
```

### Spec structure

Specs live in `docs/specs/<issue-number>-<slug>.md`.
See `docs/specs/README.md` for the full section reference.

### Implementation order (enforced by /implement)

1. `doc/api-spec.yaml` — update YAML contract first (if api_spec_change=true)
2. `utils/api.ts` — update TypeScript interfaces to mirror spec change
3. `components/` — update or add components as specified
4. `app/` — update pages/routes/navigation as specified
5. `doc/GITHUB-SPECKIT.md` — update integration spec if component list or data flow changed

### Branch naming

All implementation branches follow: `speckit/<issue-number>-<kebab-slug>`

Example: `speckit/05-add-developer-fields-card`
