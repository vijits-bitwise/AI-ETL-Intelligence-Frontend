# GitHub SpecKit — AI ETL Intelligence Frontend

## Executive Summary

This document is the **source of truth** for the frontend-to-backend API integration. It maps every field in the backend `IncidentResponse` to where it renders in the frontend UI.

**Why this matters:** When the backend API changes, this document ensures the frontend stays in sync. Every SpecKit feature change must update this document to reflect new API fields and their rendering locations.

---

## Table of Contents

1. [Backend API Reference](#backend-api-reference)
2. [Frontend-to-Backend Mapping (Quick Reference)](#quick-reference)
3. [Current Repository Mapping](#current-repository-mapping)
4. [Common Rendering Patterns](#common-rendering-patterns)
5. [Validation Checklist](#validation-checklist)
6. [Error Handling Reference](#error-handling-reference)
7. [Update Process](#update-process)
8. [Implementation Details](#implementation-details)

---

## Backend API Reference

### Base URL
- `http://127.0.0.1:8000`

### Endpoint
- `POST /analyze-incident`

### Purpose
Analyze a TWS/ETL incident and return a structured AI-assisted incident resolution report.

### Request
Content-Type: `application/json`

Schema:
```json
{
  "incident_no": "string",
  "short_description": "string",
  "long_description": "string"
}
```

Required fields:
- `incident_no` — SNOW incident identifier
- `short_description` — one-line alert text from the incident ticket
- `long_description` — detailed incident description, including error messages and context

Example:
```json
{
  "incident_no": "INC9347965",
  "short_description": "[TWS-PROD] ETL_UTLOP_BATCH :: Re-run of job BIT_RMS_1110_REP.BIT_RMS_1110_TSFHEAD_EXT has ended abnormally (ABEND).",
  "long_description": "Error: New CDC execution is blocked because a CDC file already exists: ff_rms_shipsku_pwx_cdc.dat. Please use DISC instructions to resolve."
}
```

### Response
Success response: HTTP `200`
Content-Type: `application/json`

Top-level schema: `IncidentResponse`

Fields:
- `incident_info` — incident metadata and enrichment
- `root_cause` — structured root cause analysis
- `resolution_steps` — ordered resolution actions
- `validation_checklist` — verification checklist items
- `prevention` — mitigation recommendation paragraph
- `escalation_path` — recommended escalation routing
- `references` — evidence sources and links
- `confidence_scorecard` — confidence assessment

Example response:
```json
{
  "incident_info": {
    "incident_no": "INC9347965",
    "short_description": "[TWS-PROD] ETL_UTLOP_BATCH :: Re-run of job BIT_RMS_1110_REP...",
    "description": "Error: New CDC execution is blocked because a CDC file already exists...",
    "created_at": "2026-05-21T10:30:00",
    "stream_name": "BIT_RMS_1110_TSFHEAD_EXT",
    "job_name": "BIT_RMS_1110_REP",
    "priority": "P2",
    "environment": "Prod",
    "business_impact": "High"
  },
  "root_cause": {
    "category": "FILE_CONFLICT",
    "sub_category": "CDC File Lock",
    "error_code": "ABEND",
    "root_cause": "The CDC file ff_rms_shipsku_pwx_cdc.dat was not cleaned up..."
  },
  "resolution_steps": [
    {
      "step_no": 1,
      "title": "Retrieve TWS Job Execution Log",
      "description": "Open the TWS console and locate the execution log for BIT_RMS_1110_REP..."
    }
  ],
  "validation_checklist": [
    { "check": "CDC file ff_rms_shipsku_pwx_cdc.dat is removed", "system": "Unix / Shared File System" }
  ],
  "prevention": "Add a pre-check script in the TWS job definition...",
  "escalation_path": {
    "required": "Yes",
    "scrum_team": "CDC Team",
    "assignment_group": "ETL Support Group"
  },
  "references": {
    "similar_incidents": ["INC9012345", "INC8756231"],
    "tws_logs": ["/opt/tws/logs/BIT_RMS_1110_REP_20260521.log"],
    "confluence_links": [
      { "title": "ETL-ACC Accounting", "url": "https://..." }
    ]
  },
  "confidence_scorecard": {
    "percentage": 82,
    "reason": "Based on: 3 similar historical incidents..."
  }
}
```

### Backend validation errors
- `400` — malformed request body
- `422` — Pydantic validation errors
- `500` — internal pipeline error

---

## Quick Reference

### API Response Field → Frontend Component Mapping

| API Field Path | Component | Element | Rendering Logic |
|---|---|---|---|
| `incident_info.incident_no` | `ResultCard` | Header badge | Display ticket number |
| `incident_info.short_description` | `ResultCard` | Alert title | Display one-liner |
| `incident_info.description` | `ResultCard` | Description panel | Full description text |
| `incident_info.created_at` | `ResultCard` | Timestamp | Format as ISO date |
| `incident_info.stream_name` | `ResultCard` | Metadata field | "Stream: {value}" |
| `incident_info.job_name` | `ResultCard` | Metadata field | "Job: {value}" |
| `incident_info.priority` | `ResultCard` | Badge | Color by priority (P1=Red, P2=Yellow, P3=Green) |
| `incident_info.environment` | `ResultCard` | Badge | Display environment tag |
| `incident_info.business_impact` | `ResultCard` | Badge | Display impact level |
| `root_cause.category` | `ResultCard` | Root cause card | Category badge |
| `root_cause.sub_category` | `ResultCard` | Root cause card | Sub-category text |
| `root_cause.error_code` | `ResultCard` | Root cause card | Code badge |
| `root_cause.root_cause` | `ResultCard` | Root cause card | Explanation paragraph |
| `resolution_steps[]` | `ResultCard` | Action cards | Ordered list with step_no, title, description |
| `validation_checklist[]` | `ResultCard` | Checklist panel | Checkbox items with system annotations |
| `prevention` | `ResultCard` | Recommendation block | Paragraph text |
| `escalation_path.required` | `ResultCard` | Escalation section | Show/hide section based on "Yes"/"No" |
| `escalation_path.scrum_team` | `ResultCard` | Escalation section | "Scrum Team: {value}" |
| `escalation_path.assignment_group` | `ResultCard` | Escalation section | "Assignment Group: {value}" |
| `references.similar_incidents[]` | `ResultCard` | References section | List of incident links |
| `references.tws_logs[]` | `ResultCard` | References section | List of log file paths |
| `references.confluence_links[]` | `ResultCard` | References section | Clickable Confluence links |
| `confidence_scorecard.percentage` | `ResultCard` | Scorecard | Progress bar (0–100) |
| `confidence_scorecard.reason` | `ResultCard` | Scorecard | Explanation text below percentage |

---

## Current Repository Mapping

### Existing Files
- `docs/api-spec.yaml` — authoritative OpenAPI contract
- `docs/GITHUB-SPECKIT.md` — frontend integration spec (this file)
- `utils/api.ts` — frontend API client
- `components/IncidentForm.tsx` — request form
- `app/page.tsx` — homepage wrapper
- `app/result/page.tsx` — results page consumer
- `components/ResultCard.tsx` — current results renderer

### UI/UX Reference
- Use the attached screenshot as a visual reference for layout, spacing, and card-based UX.
- The current frontend implementation now maps directly to the backend `IncidentResponse` fields.
- `components/ResultCard.tsx` renders the response as a dashboard-style result page.
- Key visual sections rendered by the current implementation:
  - incident header with status, priority, environment, and timing
  - incident metadata and summary panel
  - root cause analysis card
  - ordered resolution steps panel
  - validation checklist card
  - escalation routing block
  - references and evidence sources
  - confidence score visualization with prevention recommendation

### Current Implementation Status
- `utils/api.ts` defines `AnalysisResponse` to match the backend contract.
- `components/IncidentForm.tsx` submits `incident_no`, `short_description`, and `long_description` to `POST /analyze-incident`.
- `app/result/page.tsx` loads stored API results from `localStorage` and renders `ResultCard` with a single `data` prop.
- `components/ResultCard.tsx` now renders all main response sections, including `prevention`, `references`, and `confidence_scorecard`.

---

## Common Rendering Patterns

### Pattern 1: Conditional Rendering (Field is Optional)

When a field MAY be null/undefined or empty:

```typescript
// Component Example: Show escalation section only if required="Yes"
{data.escalation_path?.required === "Yes" && (
  <section className="escalation-section">
    <h3>Escalation Routing</h3>
    <p>Scrum Team: {data.escalation_path.scrum_team}</p>
    <p>Assignment Group: {data.escalation_path.assignment_group}</p>
  </section>
)}
```

**When to apply:** `escalation_path.required`, `references.confluence_links`, `references.tws_logs` (all optional in spec)

### Pattern 2: Array Rendering (Field is List)

When a field contains multiple items:

```typescript
// Component Example: Render ordered resolution steps
<section className="resolution-steps">
  {data.resolution_steps.map((step) => (
    <div key={step.step_no} className="step-card">
      <h4>{step.step_no}. {step.title}</h4>
      <p>{step.description}</p>
    </div>
  ))}
</section>
```

**When to apply:** `resolution_steps[]`, `validation_checklist[]`, `references.similar_incidents[]`, `references.tws_logs[]`, `references.confluence_links[]`

### Pattern 3: Badge/Status Rendering (Enum-like Fields)

When a field represents a status or priority:

```typescript
// Component Example: Priority color-coding
const priorityColor = {
  "P1": "bg-red-600",
  "P2": "bg-yellow-500",
  "P3": "bg-green-500",
}[data.incident_info.priority];

<span className={`badge ${priorityColor}`}>{data.incident_info.priority}</span>
```

**When to apply:** `incident_info.priority`, `incident_info.environment`, `incident_info.business_impact`, `root_cause.category`

### Pattern 4: Nested Object Access (Safe Navigation)

When accessing nested objects:

```typescript
// Defensive: use optional chaining to prevent crashes
const screamTeam = data?.escalation_path?.scrum_team || "Not assigned";
```

**When to apply:** All nested structures (incident_info, root_cause, escalation_path, confidence_scorecard)

---

## Validation Checklist

Use this checklist to verify the frontend stays in sync with the backend API:

### Before Merging Any API-Touching PR:

- [ ] **API Contract Matches** — `docs/api-spec.yaml` reflects the backend OpenAPI spec
- [ ] **TypeScript Interfaces Match** — `utils/api.ts` has all fields from `IncidentResponse`
- [ ] **Component Rendering** — `components/ResultCard.tsx` renders all fields from `utils/api.ts`
- [ ] **Optional Fields Handled** — null/undefined fields don't crash the component (conditional rendering works)
- [ ] **Array Fields Rendered** — lists render with `.map()` in correct order
- [ ] **Status/Priority Badges** — enums are color-coded consistently
- [ ] **localStorage Keys** — `app/result/page.tsx` persists and retrieves the full response
- [ ] **Navigation Params** — query params include `incident_no` for context
- [ ] **Error States** — API errors show user-friendly message in `IncidentForm`
- [ ] **This Document Updated** — new fields are added to this mapping table

### Field-by-Field Verification:

For each field in `IncidentResponse`:

1. **In OpenAPI spec?** → Check `docs/api-spec.yaml`
2. **In TypeScript?** → Check `utils/api.ts`
3. **In component?** → Check `components/ResultCard.tsx`
4. **Handles null?** → Look for `?.` or `if (field)` checks
5. **Styled correctly?** → Review Tailwind classes in rendering code

---

## Error Handling Reference

### When a Field is Missing (null/undefined)

**Symptom:** Component crashes with "Cannot read property X of undefined"

**Fix:** Use optional chaining or conditional rendering

```typescript
// ❌ Wrong: Will crash if field is null
<p>{data.root_cause.category}</p>

// ✅ Right: Safe, shows nothing if missing
<p>{data.root_cause?.category}</p>

// ✅ Right: Safe with fallback text
<p>Category: {data.root_cause?.category || "Not available"}</p>
```

### When an Array is Empty

**Symptom:** Section appears but is empty (no items to render)

**Fix:** Show a placeholder message

```typescript
// ❌ Wrong: Shows empty section
{data.resolution_steps.map(...)}

// ✅ Right: Shows message if no items
{data.resolution_steps.length > 0 ? (
  data.resolution_steps.map(...)
) : (
  <p className="text-gray-500">No resolution steps provided.</p>
)}
```

### When an Enum Value is Unexpected

**Symptom:** Status field shows unknown value (not in priority map)

**Fix:** Provide a default or log for investigation

```typescript
// ❌ Wrong: Returns undefined if priority not in map
const color = priorityMap[data.incident_info.priority];

// ✅ Right: Has default fallback
const color = priorityMap[data.incident_info.priority] || "bg-gray-500";

// ✅ Right: Logs for debugging
if (!priorityMap[data.incident_info.priority]) {
  console.warn("Unknown priority:", data.incident_info.priority);
}
```

### When the API Returns an Error

**Symptom:** Form submission fails with 400/422/500

**Fix:** Display error message to user

```typescript
// In IncidentForm.tsx
const [error, setError] = useState<string | null>(null);

try {
  const result = await analyzeIncident(incident);
  // success...
} catch (err) {
  setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
}

{error && <p className="text-red-600">{error}</p>}
```

---

## Update Process

### When the Backend API Changes

**Scenario:** Backend team adds a new field to `IncidentResponse` (e.g., `incident_info.estimated_resolution_time`)

**Steps:**

1. **Update OpenAPI Spec**
   - Edit `docs/api-spec.yaml`
   - Add new field to `IncidentResponse` schema
   - Include field description and type

2. **Update TypeScript Interfaces**
   - Edit `utils/api.ts`
   - Add new field to `AnalysisResponse` interface
   - Match type from OpenAPI spec

3. **Update Component Rendering**
   - Edit `components/ResultCard.tsx`
   - Add new field to the appropriate section (incident_info, root_cause, etc.)
   - Use conditional rendering if field is optional

4. **Update This Document**
   - Add new row to the Quick Reference table
   - Include: API field path, component, element, rendering logic

5. **Test**
   - Run `/review "docs/specs/<N>.md"` to validate
   - Verify rendering in `npm run dev` with sample data

---

## Implementation Details

### 1. API Spec is the Source of Truth

The `docs/api-spec.yaml` contract defines the backend `IncidentResponse` schema.

### 2. Frontend API Client Alignment

`utils/api.ts` defines `AnalysisResponse` to match the backend contract and ships the request payload to `POST /analyze-incident`.

The implemented response shape includes:
- `incident_info`
- `root_cause`
- `resolution_steps`
- `validation_checklist`
- `prevention`
- `escalation_path`
- `references`
- `confidence_scorecard`

### 3. Result Rendering

`components/ResultCard.tsx` renders the current response structure as a dashboard-style result page:
- `incident_info` header and metadata cards
- `root_cause` explanation with category, sub-category, and error code
- `resolution_steps` as ordered action cards
- `validation_checklist` as checklist cards
- `prevention` as a recommendation block
- `escalation_path` routing guidance
- `references` evidence sources for similar incidents, TWS logs, and Confluence links
- `confidence_scorecard` as a percentage indicator plus reason text

### 4. Result Flow

`app/result/page.tsx` reads stored results from `localStorage`, validates them, and passes the parsed `AnalysisResponse` object to `ResultCard`.

### 5. Current Scope

The current integration is implemented for the frontend flow and response shape. Future updates may include session storage, stronger retry handling, and direct result persistence.

---

## UI Design Specification (Mockup Reference)

The result page should be structured in these sections, matching the API output:

1. **Incident Metadata**
   - `incident_info.incident_no`
   - `incident_info.short_description`
   - `incident_info.description`
   - `incident_info.created_at`
   - `incident_info.stream_name`
   - `incident_info.job_name`
   - `incident_info.priority`
   - `incident_info.environment`
   - `incident_info.business_impact`

2. **Root Cause Analysis**
   - `root_cause.category`
   - `root_cause.sub_category`
   - `root_cause.error_code`
   - `root_cause.root_cause`

3. **Resolution Steps**
   - render each object in `resolution_steps`
   - display `step_no`, `title`, and `description`

4. **Validation Checklist**
   - render each object in `validation_checklist`
   - display `check` and `system`

5. **Prevention Recommendation**
   - display `prevention` as a single paragraph

6. **Escalation Path**
   - display `escalation_path.required`
   - display `escalation_path.scrum_team`
   - display `escalation_path.assignment_group`

7. **References**
   - `references.similar_incidents`
   - `references.tws_logs`
   - `references.confluence_links`

8. **Confidence Scorecard**
   - `confidence_scorecard.percentage`
   - `confidence_scorecard.reason`

---

## Recommended File Changes

1. `utils/api.ts`
   - update the request and response types to match `docs/api-spec.yaml`
   - keep `API_BASE_URL` as `http://127.0.0.1:8000`

2. `components/ResultCard.tsx`
   - replace legacy `AnalysisResponse` rendering with the new `IncidentResponse` fields
   - add sections for `validation_checklist`, `escalation_path`, `references`, and `confidence_scorecard`

3. `components/IncidentForm.tsx`
   - keep the current field set
   - optionally add inline guidance matching backend examples

4. `app/result/page.tsx`
   - continue to restore the saved API result from browser storage
   - ensure the incoming object is validated before rendering

---

## Notes

- The backend docs at `http://127.0.0.1:8000/docs#/Incident%20Analysis/analyze_incident` are the source of the contract.
- The `docs/api-spec.yaml` file is already present and should remain the authoritative definition.
- The frontend design should be rebuilt around the exact API response fields, not legacy models.
- Always run `/review` before opening a PR that touches this spec.
