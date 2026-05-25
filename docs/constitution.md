<!-- Constitution v1.0.0 — Initial ratification — 2026-05-25 -->

# AI ETL Intelligence Frontend — Constitution

## I. Spec-First (NON-NEGOTIABLE)

No code is written without an approved spec in `docs/specs/`.
Every feature, bug fix, or UI change begins with `/analyze`, produces a spec, and only proceeds
after explicit human approval. The branch is created by `/implement`, not by hand.

Implementation that exists outside a spec is considered technical debt and must be
retroactively spec'd before further changes are made to the same files.

## II. API Contract Alignment

`doc/api-spec.yaml` is the single source of truth for all data shapes.
TypeScript interfaces in `utils/api.ts` must mirror it exactly — same field names, same types,
same optional flags. No interface field may be added, removed, or retyped without a
corresponding change to `doc/api-spec.yaml`.

When the backend updates `api-spec.yaml`, the frontend spec must declare `api_spec_change: true`
and include the full TypeScript diff in Section C.

## III. Component Scope

Each component has exactly one responsibility:

| Component | Responsibility |
|-----------|---------------|
| `IncidentForm` | Collect incident fields, validate, submit to API, navigate to results |
| `ResultCard` | Render a complete `AnalysisResponse` — no business logic, no API calls |
| `Loader` | Display a loading indicator — no state, no props beyond optional className |

A component MUST NOT fetch data, mutate global state, or perform business logic outside
its defined responsibility. If a new responsibility is needed, create a new component.

## IV. Rendered Fields Must Come from the Spec

Every field path accessed in a component (e.g. `data.root_cause.category`) must be listed
in the spec's Section E "Fields rendered" list for that component. No field may be added to
a component's render output without appearing in a spec.

The corollary: if a field is in the spec but not rendered, that is a spec violation, not a
creative interpretation.

## V. Tailwind-Only Styling

No custom CSS is written. All styling uses Tailwind CSS utility classes.
No inline `style={{}}` props except for SVG geometry (e.g. `strokeDasharray` for the
confidence score circle — this is data-driven, not styling).

New Tailwind classes introduced by a change must be listed in the spec's Section E
"Tailwind classes added" field.

## VI. Fallbacks for Every Optional Field

Every TypeScript interface field marked `?` or `| null` must have a rendered fallback
in the component that consumes it. Acceptable fallbacks: `|| 'Unknown'`, `|| 'N/A'`,
`?.length ? [...] : <span>None found</span>`. A field access with no null guard is a
spec compliance failure.

## VII. localStorage Key Discipline

The key format for storing API results is `incident-analysis-${Date.now()}`.
The key name, stored type, and cleanup timing (remove after read) must be documented
in any spec that changes the result storage flow (Section F).

localStorage is used only for passing the API response between the form page and the
results page. It is not a persistence layer — data is removed immediately after reading.

## VIII. No New Dependencies Without Justification

No new npm packages may be added without:
1. A spec that declares the package in Section I (Files Changed) with a reason.
2. A constitution compliance check confirming the package does not duplicate existing
   Tailwind, React, or Next.js built-in functionality.

## Governance

This constitution supersedes all other project guidance documents when they conflict.
Amendments require a `/constitution` run with the proposed change, human approval,
and a version bump. The spec-driven workflow (Principles I and IV) cannot be suspended
even for hotfixes — create a minimal spec, approve it, then implement.

**Version**: 1.0.0 | **Ratified**: 2026-05-25 | **Last Amended**: 2026-05-25
