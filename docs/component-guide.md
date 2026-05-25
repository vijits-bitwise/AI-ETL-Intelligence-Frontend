# Component Guide

Reference for all React components in `components/`. Covers responsibilities,
props, internal helpers, Tailwind patterns, and extension points.

---

## IncidentForm

**File**: `components/IncidentForm.tsx`
**Type**: `'use client'` component
**Imported by**: `app/page.tsx`

### Responsibility

Collect the three incident fields, validate them, POST to the backend API,
store the response in localStorage, and navigate to the results page.
Has no knowledge of the `AnalysisResponse` shape — it only stores the raw JSON.

### State

| State var | Type | Purpose |
|-----------|------|---------|
| `formData` | `{ incident_no, short_description, long_description }` | Controlled form values |
| `isLoading` | `boolean` | Disables form and shows `<Loader />` during API call |
| `error` | `string \| null` | Displayed in a red error banner |

### Props

None. This is a self-contained page-level component.

### Submission Flow

1. Client-side validation: all three fields must be non-empty strings.
2. Calls `analyzeIncident(payload)` from `utils/api.ts`.
3. On success: `localStorage.setItem("incident-analysis-<timestamp>", JSON.stringify(response))`.
4. Navigates to `/result?key=<key>&incident_no=<val>&short_description=<val>`.
5. On error: sets `error` state, which renders an error banner above the form.

### localStorage Key Format

```
incident-analysis-${Date.now()}
```

The timestamp prevents collisions if two tabs submit simultaneously.

### Extension Points

- To add a fourth field: add to `formData` state, add an `<input>` element, and add to `IncidentPayload`.
- To add field-level validation: add checks before the `analyzeIncident` call in `handleSubmit`.
- Do NOT add API calls, response parsing, or rendering logic to this component.

---

## ResultCard

**File**: `components/ResultCard.tsx`
**Type**: `'use client'` component
**Imported by**: `app/result/page.tsx`

### Responsibility

Render a complete `AnalysisResponse` as a multi-section dashboard.
No API calls, no state beyond what React/Next.js provides, no side effects.

### Props

```typescript
interface ResultCardProps {
  data: AnalysisResponse;
}
```

### Sections Rendered

| Section | Source fields | Fallback |
|---------|--------------|---------|
| Incident header | `incident_info.incident_no`, `short_description`, `description` | — (required fields) |
| Status badges | `incident_info.priority`, `business_impact` | `"Analysis Complete"` / `bg-slate-500` |
| Metadata cards | `environment`, `created_at`, `stream_name`, `job_name` | `"Unknown"` / `"N/A"` / `"Not available"` |
| Root cause | `root_cause.*` | — (required fields) |
| Resolution steps | `resolution_steps[]` | — (non-empty array from backend) |
| Validation checklist | `validation_checklist[]` | — (non-empty array from backend) |
| Escalation path | `escalation_path.*` | — (required fields) |
| Similar incidents | `references.similar_incidents` | `"None found"` |
| TWS logs | `references.tws_logs` | `"No logs referenced"` |
| Confluence links | `references.confluence_links` | `"No links available"` |
| Confidence score | `confidence_scorecard.percentage`, `.reason` | — (required fields) |
| Prevention | `prevention` | — (required field) |

### Internal Helper Functions

These functions are not exported. They are implementation details of `ResultCard`.

#### `cleanContent(value?: string) → string`
Strips lines that contain only `--` (backend section separators). Returns empty string for falsy input.

#### `escapeRegExp(value: string) → string`
Escapes special regex characters in a string. Used before building a highlight regex.

#### `highlightText(text: string, highlights: string[]) → ReactNode`
Wraps occurrences of `highlights` terms in `<strong>` inside `text`. Returns plain string if no matches.
Terms are sorted longest-first to prevent partial match shadowing.

#### `parseInlineText(value?: string, highlights?: string[]) → ReactNode`
Parses `**bold**` and `` `code` `` inline markdown within a string.
Calls `highlightText` on non-formatted segments.
Returns `null` for empty/falsy input.

#### `renderProse(value?: string, highlights?: string[]) → ReactNode`
Splits text on double newlines into paragraphs, wraps each in `<p>`.
Calls `parseInlineText` on each paragraph for inline formatting + highlighting.
Returns `null` for empty/falsy input.

#### `getStatusLabel(priority?, businessImpact?) → string`
```
P1 or Critical → "FAILED"
P2 or High     → "AT RISK"
otherwise      → "IN REVIEW"
no values      → "Analysis Complete"
```

#### `getStatusStyles(priority?, businessImpact?) → string`
```
P1 or Critical → "bg-red-600 text-white"
P2 or High     → "bg-orange-500 text-white"
otherwise      → "bg-slate-500 text-white"
```

### Tailwind Design Patterns

| Pattern | Classes | Used for |
|---------|---------|---------|
| Card container | `rounded-[32px] border border-slate-200 bg-white shadow-sm p-8` | Top-level section cards |
| Inner card | `rounded-3xl bg-slate-50 border border-slate-200 p-5` | Metadata fields, sub-cards |
| Inner prose block | `rounded-[26px] bg-slate-50 p-8` | Long text areas (root cause explanation) |
| Status badge | `rounded-full px-4 py-2 text-xs font-semibold tracking-wide` | Priority / impact / status |
| Section label | `text-xs uppercase tracking-[0.24em] text-slate-500` | Field labels above values |
| Section heading | `text-2xl font-semibold text-slate-900` | Section titles |
| Step number circle | `flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white` | Resolution step numbers |
| Checklist tick | `h-8 w-8 flex-shrink-0 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-bold` | Validation check icons |

### Confidence Score SVG

The circular progress indicator is a plain SVG with two `<circle>` elements:
- Background ring: fixed `stroke="#E2E8F0"`, `strokeWidth="8"`
- Progress ring: `strokeDasharray="${351.86 * (percentage / 100)} 351.86"` — the circumference formula for `r=56`

The SVG is rotated -90° so the progress starts at the top.
`strokeDasharray` is calculated directly from `confidence_scorecard.percentage` — no library needed.

### Extension Points

- To add a new section: add a `<section>` block inside the main `<div>` and list the new
  fields in the spec's Section E "Fields rendered".
- To add a new helper: add it as an unexported function above the component.
- Do NOT add form elements, navigation calls, or API calls to this component.

---

## Loader

**File**: `components/Loader.tsx`
**Type**: Standard component (no directive needed)
**Imported by**: `components/IncidentForm.tsx`

### Responsibility

Display a loading animation while the API call is in progress.

### Props

None.

### Implementation

A simple spinning `<div>` using `animate-spin` from Tailwind.
No state, no logic, no side effects.

### Extension Points

- To customise the spinner size or colour: pass optional `className` prop.
  Add `className?: string` to the component signature and spread it on the wrapper `<div>`.
- Any change to `Loader` must be covered by a spec section E entry.

---

## Adding a New Component

1. Run `/analyze` with the feature requirement.
2. The spec's Section E must specify:
   - File path (`components/<NewComponent>.tsx`)
   - Props interface (exact TypeScript definition)
   - Fields rendered (exact paths from `AnalysisResponse`)
   - Parent component or page that imports it
   - Fallback for every optional field
3. Run `/implement` — it creates the file.
4. Run `/review` — it checks that the file matches the spec exactly.
