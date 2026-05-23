git pu# GitHub SpecKit — AI ETL Intelligence Frontend

## Purpose
This document is the reference implementation spec for the frontend integration with the backend API at `http://127.0.0.1:8000/docs#/Incident%20Analysis/analyze_incident`.

It is based on the `api-spec.yaml` contract and defines:
- the request and response shapes for the incident analysis endpoint
- the frontend UI sections to render from the API response
- the implementation mapping for the current repository

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
    },
    {
      "step_no": 2,
      "title": "Identify the Stale CDC File",
      "description": "Check the Informatica Workflow Monitor session log..."
    }
  ],
  "validation_checklist": [
    { "check": "CDC file ff_rms_shipsku_pwx_cdc.dat is removed", "system": "Unix / Shared File System" },
    { "check": "BIT_RMS_1110_REP reaches SUCC in TWS", "system": "TWS Console" }
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

## Current Repository Mapping

### Existing files
- `doc/api-spec.yaml` — authoritative OpenAPI contract
- `doc/GITHUB-SPECKIT.md` — frontend integration spec
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

### Current implementation status
- `utils/api.ts` defines `AnalysisResponse` to match the backend contract.
- `components/IncidentForm.tsx` submits `incident_no`, `short_description`, and `long_description` to `POST /analyze-incident`.
- `app/result/page.tsx` loads stored API results from `localStorage` and renders `ResultCard` with a single `data` prop.
- `components/ResultCard.tsx` now renders all main response sections, including `prevention`, `references`, and `confidence_scorecard`.

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

## Implementation Details

### 1. `api-spec.yaml` is the source of truth

The `doc/api-spec.yaml` contract defines the backend `IncidentResponse` schema.

### 2. Frontend API client alignment

`utils/api.ts` now defines `AnalysisResponse` to match the backend contract and ships the request payload to `POST /analyze-incident`.

The implemented response shape includes:
- `incident_info`
- `root_cause`
- `resolution_steps`
- `validation_checklist`
- `prevention`
- `escalation_path`
- `references`
- `confidence_scorecard`

### 3. Result rendering

`components/ResultCard.tsx` renders the current response structure as a dashboard-style result page:
- `incident_info` header and metadata cards
- `root_cause` explanation with category, sub-category, and error code
- `resolution_steps` as ordered action cards
- `validation_checklist` as checklist cards
- `prevention` as a recommendation block
- `escalation_path` routing guidance
- `references` evidence sources for similar incidents, TWS logs, and Confluence links
- `confidence_scorecard` as a percentage indicator plus reason text

### 4. Result flow

`app/result/page.tsx` reads stored results from `localStorage`, validates them, and passes the parsed `AnalysisResponse` object to `ResultCard`.

### 5. Current scope

The current integration is implemented for the frontend flow and response shape. Future updates may include session storage, stronger retry handling, and direct result persistence.

- render `resolution_steps` as an ordered action list
- render `validation_checklist` as bullet/checklist cards
- render `prevention` as a recommendation block
- render `escalation_path` as escalation routing metadata
- render `references` with link cards for Confluence pages and arrays for incidents/logs
- render `confidence_scorecard` as a progress indicator + reason text

### 4. Preserve existing navigation flow

The existing flow is:
- homepage `app/page.tsx` → `IncidentForm` → POST `/analyze-incident`
- store response in `localStorage`
- navigate to `/result?key=<storageKey>&incident_no=...`
- `app/result/page.tsx` loads from localStorage and passes to `ResultCard`

This flow is acceptable but must be updated to use the new response model.

### 5. Error handling

On API error, show a user-facing message in `IncidentForm`.
On result load failure, show a clear retry/back link in `app/result/page.tsx`.

### 6. Future enhancement

A stronger implementation could:
- store results in session storage instead of local storage
- use a direct hashed key or short token instead of raw timestamp
- add a `GET /status` health check before form submission

---

## Recommended File Changes

1. `utils/api.ts`
   - update the request and response types to match `api-spec.yaml`
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
- The `api-spec.yaml` file is already present and should remain the authoritative definition.
- The frontend design should be rebuilt around the exact API response fields, not the legacy `AnalysisResponse` model currently in `utils/api.ts`.
