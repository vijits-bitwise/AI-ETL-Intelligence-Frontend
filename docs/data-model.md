# Data Model

All TypeScript interfaces are defined in `utils/api.ts` and mirror `doc/api-spec.yaml`.

The backend returns a single top-level object of type `AnalysisResponse` from
`POST /analyze-incident`. Every field listed below is a direct mapping from the
OpenAPI schema in `doc/api-spec.yaml`.

---

## Request

### `IncidentPayload`

Sent as the POST body to `/analyze-incident`.

```typescript
interface IncidentPayload {
  incident_no: string;           // SNOW incident identifier, e.g. "INC9347965"
  short_description: string;     // One-line alert text from the incident ticket
  long_description: string;      // Full incident detail including error messages
}
```

All three fields are **required**.

---

## Response

### `AnalysisResponse` (top level)

```typescript
interface AnalysisResponse {
  incident_info:        IncidentInfo;
  root_cause:           RootCause;
  resolution_steps:     ResolutionStep[];
  validation_checklist: ValidationCheck[];
  prevention:           string;
  escalation_path:      EscalationPath;
  references:           References;
  confidence_scorecard: ConfidenceScorecard;
}
```

All fields are **required** at the top level. The backend always returns all 8 fields.

---

### `IncidentInfo`

Enriched incident metadata extracted and inferred by the AI pipeline.

```typescript
interface IncidentInfo {
  incident_no:       string;                                       // required
  short_description: string;                                       // required
  description:       string;                                       // required — full description
  created_at:        string;                                       // required — ISO datetime string
  stream_name?:      string | null;                                // optional — TWS stream
  job_name?:         string | null;                                // optional — TWS job name
  priority?:         string;                                       // optional — e.g. "P1", "P2"
  environment?:      string;                                       // optional — e.g. "Prod", "UAT"
  business_impact?:  'Critical' | 'High' | 'Medium' | 'Low';      // optional — impact level
}
```

**Consumed by**: `ResultCard` — incident header, metadata cards, `getStatusLabel`, `getStatusStyles`, `highlightTerms`

---

### `RootCause`

Structured root cause analysis produced by the AI.

```typescript
interface RootCause {
  category:    string;   // required — e.g. "FILE_CONFLICT", "DB_DEADLOCK"
  sub_category: string;  // required — more specific classification
  error_code:  string;   // required — technical error identifier, e.g. "ABEND"
  root_cause:  string;   // required — prose explanation of the root cause
}
```

**Consumed by**: `ResultCard` — Root Cause Analysis section

---

### `ResolutionStep`

One ordered step in the resolution procedure.

```typescript
interface ResolutionStep {
  step_no:     number;  // required — 1-based step number
  title:       string;  // required — short step heading
  description: string;  // required — detailed instructions for this step
}
```

**Consumed by**: `ResultCard` — Resolution Steps section (rendered as ordered list)

---

### `ValidationCheck`

One item in the post-resolution validation checklist.

```typescript
interface ValidationCheck {
  check:  string;  // required — what to verify, e.g. "CDC file is removed"
  system: string;  // required — where to verify it, e.g. "TWS Console"
}
```

**Consumed by**: `ResultCard` — Validation Checklist section

---

### `EscalationPath`

Routing recommendation if the incident cannot be self-resolved.

```typescript
interface EscalationPath {
  required:          'Yes' | 'No';  // required — whether escalation is needed
  scrum_team:        string;         // required — team to escalate to
  assignment_group:  string;         // required — SNOW assignment group
}
```

**Consumed by**: `ResultCard` — Escalation Path section

---

### `ConfluenceLink`

A single Confluence page reference.

```typescript
interface ConfluenceLink {
  title: string;  // required — human-readable page title
  url:   string;  // required — full Confluence page URL
}
```

**Consumed by**: `References.confluence_links[]`

---

### `References`

Evidence sources used to build the resolution.

```typescript
interface References {
  similar_incidents?: string[];         // optional — array of incident IDs, e.g. ["INC001"]
  tws_logs?:          string[];         // optional — array of log file paths
  confluence_links?:  ConfluenceLink[]; // optional — array of Confluence page refs
}
```

**Consumed by**: `ResultCard` — Evidence Sources section
All three fields are optional arrays. `ResultCard` renders "None found" / "No logs referenced" /
"No links available" when each is absent or empty.

---

### `ConfidenceScorecard`

AI self-assessment of the analysis quality.

```typescript
interface ConfidenceScorecard {
  percentage: number;  // required — 0–100 integer
  reason:     string;  // required — prose explanation of the confidence score
}
```

**Consumed by**: `ResultCard` — AI Confidence Score section (circular progress indicator)

---

## Interface Relationship Diagram

```
IncidentPayload  ──POST──►  AnalysisResponse
                                   │
                    ┌──────────────┼──────────────────────┐
                    │              │                       │
               IncidentInfo    RootCause           ResolutionStep[]
                                   │
                    ┌──────────────┼───────────────────────┐
                    │              │                        │
           ValidationCheck[]  EscalationPath           References
                                                            │
                                                     ConfluenceLink[]
                                   │
                          ConfidenceScorecard
```

---

## Contract Alignment Rule

**Every change to this data model requires a spec with `api_spec_change: true`.**

The change must include:
1. The YAML diff for `doc/api-spec.yaml` (Section C of the spec)
2. The TypeScript diff for `utils/api.ts` (Section C + Section D of the spec)
3. An update to this file (Section I — Files Changed)

The two contracts (YAML and TypeScript) must always be in sync.
